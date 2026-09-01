const data = require('../../utils/data.js');
const app = getApp();

Page({
  data: {
    level: 0,
    stepCount: 0
  },

  map: [], 
  box: [], 
  row: 0, 
  col: 0,
  w: 40,
  history: [],

  // Canvas 2D 引擎专属变量
  canvasNode: null,
  ctx: null,
  imagePool: {}, // 图片内存池，解决加载闪烁

  // 操作记录变量
  touchStartX: 0,
  touchStartY: 0,
  touchMoved: false,

  onLoad: function (options) {
    let level = parseInt(options.level || 0);
    this.setData({ level: level, stepCount: 0 });
    this.history = [];
    
    // 初始化高清 Canvas 2D 引擎
    this.initCanvas2D(level);
  },

  // 1. 初始化 Canvas 2D 与 DPR 高清适配
  initCanvas2D: function(level) {
    wx.showLoading({ title: '加载高清引擎' });
    const query = wx.createSelectorQuery();
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          wx.hideLoading();
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        // 获取手机物理像素比 (DPR)，解决画面模糊锯齿
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        this.canvasNode = canvas;
        this.ctx = ctx;

        // 预加载图片进入内存池后再绘图
        this.preloadImages(() => {
          wx.hideLoading();
          this.initMap(level);
          this.drawCanvas();
        });
      });
  },

  // 2. 图片预加载机制
  preloadImages: function(callback) {
    const sources = {
      ice: '/images/icons/ice.png',
      stone: '/images/icons/stone.png',
      house: '/images/icons/house.png', // 终点
      bone: '/images/icons/bone.png',   // 箱子
      dog: '/images/icons/dog.png'      // 主角
    };
    
    let loadedCount = 0;
    const total = Object.keys(sources).length;

    for (let key in sources) {
      const img = this.canvasNode.createImage();
      img.src = sources[key];
      img.onload = () => {
        this.imagePool[key] = img;
        loadedCount++;
        if (loadedCount === total) callback();
      };
      img.onerror = () => {
        console.error('图片加载失败:', sources[key]);
        loadedCount++; 
        if (loadedCount === total) callback();
      };
    }
  },

  initMap: function (level) {
    let mapData = data.maps[level];
    this.map = [];
    this.box = [];
    for (let i = 0; i < 8; i++) {
      this.map[i] = [];
      this.box[i] = [];
      for (let j = 0; j < 8; j++) {
        let val = mapData[i][j];
        this.box[i][j] = 0; 
        
        if (val === 4) {
          this.box[i][j] = 4;
          this.map[i][j] = 2;
        } else if (val === 5) {
          this.map[i][j] = 2;
          this.row = i;
          this.col = j;
        } else {
          this.map[i][j] = val;
        }
      }
    }
  },

  drawCanvas: function () {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, 320, 320);
    let w = this.w;
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let imgKey = 'ice';
        if (this.map[i][j] === 1) imgKey = 'stone';
        else if (this.map[i][j] === 3) imgKey = 'house';

        if(this.imagePool[imgKey]) {
          this.ctx.drawImage(this.imagePool[imgKey], j * w, i * w, w, w);
        }
        
        if (this.box[i][j] === 4 && this.imagePool['bone']) {
          this.ctx.drawImage(this.imagePool['bone'], j * w, i * w, w, w);
        }
      }
    }
    if(this.imagePool['dog']) {
       this.ctx.drawImage(this.imagePool['dog'], this.col * w, this.row * w, w, w);
    }
  },

  saveHistory: function() {
    this.history.push({
      box: JSON.parse(JSON.stringify(this.box)),
      row: this.row,
      col: this.col,
      stepCount: this.data.stepCount
    });
  },

  undoGame: function() {
    if (this.history.length === 0) {
      wx.showToast({ title: '已经是最开始啦', icon: 'none' });
      return;
    }
    let lastState = this.history.pop();
    this.box = lastState.box;
    this.row = lastState.row;
    this.col = lastState.col;
    this.setData({ stepCount: lastState.stepCount });
    this.drawCanvas();
  },

  step: function(dRow, dCol) {
    let nextRow = this.row + dRow;
    let nextCol = this.col + dCol;
    
    if (nextRow < 0 || nextRow > 7 || nextCol < 0 || nextCol > 7) return;
    if (this.map[nextRow][nextCol] === 1) return;

    this.saveHistory();
    let moved = false;

    if (this.box[nextRow][nextCol] !== 4) {
      this.row = nextRow;
      this.col = nextCol;
      moved = true;
    } else {
      let boxNextRow = nextRow + dRow;
      let boxNextCol = nextCol + dCol;
      if (boxNextRow < 0 || boxNextRow > 7 || boxNextCol < 0 || boxNextCol > 7) {
        this.history.pop(); 
        return;
      }
      if (this.map[boxNextRow][boxNextCol] !== 1 && this.box[boxNextRow][boxNextCol] !== 4) {
        this.box[nextRow][nextCol] = 0;
        this.box[boxNextRow][boxNextCol] = 4;
        this.row = nextRow;
        this.col = nextCol;
        moved = true;
      } else {
        this.history.pop(); 
      }
    }

    if (moved) {
      wx.vibrateShort({ type: 'light' }); // 物理轻震动反馈
      this.setData({ stepCount: this.data.stepCount + 1 });
      this.drawCanvas();
      this.checkWin();
    }
  },

  // 3. 全屏手势滑动逻辑
  touchStart: function(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchMoved = false;
  },
  
  touchEnd: function(e) {
    let dx = e.changedTouches[0].clientX - this.touchStartX;
    let dy = e.changedTouches[0].clientY - this.touchStartY;
    
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      this.touchMoved = true;
      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? this.moveRight() : this.moveLeft();
      } else {
        dy > 0 ? this.moveDown() : this.moveUp();
      }
    }
  },

  // 4. 鼠标精准点击移动逻辑
  onCanvasTap: function(e) {
    if (this.touchMoved) return; 

    let x = e.detail.x;
    let y = e.detail.y;
    
    let targetCol = Math.floor(x / this.w);
    let targetRow = Math.floor(y / this.w);

    let dRow = targetRow - this.row;
    let dCol = targetCol - this.col;

    if (Math.abs(dRow) + Math.abs(dCol) === 1) {
      this.step(dRow, dCol);
    }
  },

  moveUp: function() { this.step(-1, 0); },
  moveDown: function() { this.step(1, 0); },
  moveLeft: function() { this.step(0, -1); },
  moveRight: function() { this.step(0, 1); },

  checkWin: function () {
    let isWin = true;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.box[i][j] === 4 && this.map[i][j] !== 3) {
          isWin = false;
        }
      }
    }
    if (isWin) {
      wx.vibrateLong(); // 通关长震动庆祝

      let leaderboard = wx.getStorageSync('leaderboard') || [];
      leaderboard.push({
        avatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : '',
        nickname: app.globalData.isGuest ? '神秘游客' : app.globalData.userInfo.nickName,
        score: this.data.stepCount,
        level: this.data.level + 1
      });
      leaderboard.sort((a, b) => a.score - b.score);
      wx.setStorageSync('leaderboard', leaderboard);

      wx.showModal({
        title: '恭喜通关',
        content: `太棒了！共走 ${this.data.stepCount} 步`,
        showCancel: false,
        confirmColor: '#EBA2C4',
        success: (res) => {
          if (res.confirm) wx.navigateBack(); 
        }
      });
    }
  },

  restartGame: function () {
    this.setData({ stepCount: 0 });
    this.history = [];
    this.initMap(this.data.level);
    this.drawCanvas();
  }
});
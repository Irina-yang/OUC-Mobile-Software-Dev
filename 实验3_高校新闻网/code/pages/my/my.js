Page({
  data: {
    isLogin: false,
    nickName: '未登录',
    src: '/images/index.png',
    
    currentTab: 'fav', 
    newsList: [],      
    num: 0,
    historyList: [],
    
    startX: 0, 
    startY: 0,

    // 控制底部授权弹窗
    showAuthModal: false,
    tempAvatar: '/images/index.png',
    tempNickName: ''
  },
  
  onShow: function () {
    this.getReadHistory();
    if (this.data.isLogin) this.getMyFavorites();
  },

  // 打开底部授权弹窗
  openAuthModal: function() {
    this.setData({ 
      showAuthModal: true,
      tempAvatar: '/images/index.png',
      tempNickName: ''
    });
  },
  
  // 取消关闭弹窗
  closeAuthModal: function() {
    this.setData({ showAuthModal: false });
    wx.showToast({ title: '已取消授权', icon: 'none' });
  },

  // 获取暂存的头像和昵称
  onTempAvatar: function(e) {
    this.setData({ tempAvatar: e.detail.avatarUrl });
  },
  onTempNickName: function(e) {
    this.setData({ tempNickName: e.detail.value });
  },

  // 确认允许授权登录
  confirmLogin: function() {
    if (!this.data.tempNickName.trim()) {
      wx.showToast({ title: '请输入或获取昵称', icon: 'none' });
      return;
    }
    this.setData({
      isLogin: true,
      src: this.data.tempAvatar,
      nickName: this.data.tempNickName,
      showAuthModal: false
    });
    this.getMyFavorites();
    wx.showToast({ title: '授权登录成功', icon: 'success' });
  },

  // 登录后点击头像直接更换
  onChangeAvatar: function (e) {
    this.setData({ src: e.detail.avatarUrl });
    wx.showToast({ title: '头像更换成功', icon: 'success' });
  },

  // 登录后点击昵称符号修改名称
  editNickName: function () {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: this.data.nickName,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.setData({ nickName: res.content.trim() });
          wx.showToast({ title: '昵称修改成功', icon: 'success' });
        }
      }
    });
  },

  // 右上角设置：退出登录与注销
  openSettings: function () {
    wx.showActionSheet({
      itemList: ['退出登录', '注销账号 (清空数据)'],
      itemColor: '#FF6347',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.handleLogout();
        } else if (res.tapIndex === 1) {
          this.handleDeleteAccount();
        }
      }
    });
  },

  handleLogout: function () {
    this.setData({
      isLogin: false,
      src: '/images/index.png',
      nickName: '未登录',
      newsList: [],
      num: 0
    });
    wx.showToast({ title: '已安全退出', icon: 'none' });
  },

  handleDeleteAccount: function () {
    wx.showModal({
      title: '注销确认',
      content: '注销账号将永久清空收藏和历史，是否继续？',
      confirmColor: '#FF6347',
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.clearStorageSync(); 
          this.setData({
            isLogin: false,
            src: '/images/index.png',
            nickName: '未登录',
            newsList: [],
            num: 0,
            historyList: []
          });
          wx.showToast({ title: '数据已清空', icon: 'success' });
        }
      }
    });
  },

  switchTab: function (e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },
  
  getReadHistory: function () {
    this.setData({ historyList: wx.getStorageSync('history_list') || [] });
  },

  // 滑动交互控制
  touchstart: function (e) {
    let list = this.data.newsList;
    list.forEach(item => { if (item.isTouchMove) item.isTouchMove = false; });
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      newsList: list
    });
  },
  touchmove: function (e) {
    let startX = this.data.startX;
    let startY = this.data.startY;
    let touchX = e.touches[0].clientX;
    let touchY = e.touches[0].clientY;
    let index = e.currentTarget.dataset.index;
    let list = this.data.newsList;

    if (startX - touchX > 40 && Math.abs(touchY - startY) < 50) {
      list[index].isTouchMove = true;
      this.setData({ newsList: list });
    } else if (touchX - startX > 40 && Math.abs(touchY - startY) < 50) {
      list[index].isTouchMove = false;
      this.setData({ newsList: list });
    }
  },

  // 快捷取消收藏
  quickCancelFav: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.removeStorageSync(id); 
    wx.showToast({ title: '已取消收藏', icon: 'success' });
    this.getMyFavorites(); 
  },

  getMyFavorites: function () {
    const info = wx.getStorageInfoSync();
    let myList = [];
    for (let i = 0; i < info.keys.length; i++) {
      let obj = wx.getStorageSync(info.keys[i]);
      if (obj && obj.id && typeof obj.id === 'string' && obj.id.startsWith('ouc_')) {
        myList.push({ ...obj, isTouchMove: false }); 
      }
    }
    this.setData({ newsList: myList, num: myList.length });
  },

  goToDetail: function (e) {
    wx.navigateTo({ url: '../detail/detail?id=' + e.currentTarget.dataset.id });
  },
  
  onShareAppMessage: function () { return { title: '我的中心', path: '/pages/my/my' } },
  onShareTimeline: function () { return { title: '我的中心' } }
});
const app = getApp()
const db = wx.cloud.database()
const photos = db.collection('photos')

Page({
  data: {
    isLogin: false,
    tempAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    tempNickName: '',
    userInfo: null,
    myPosts: [],
    followingCount: 0, // 关注数
    // 默认背景图
    bgImgUrl: 'https://images.unsplash.com/photo-1506744626753-dba37c25a1f1?auto=format&fit=crop&w=800&q=80'
  },

  onShow: function() {
    if (app.globalData.userInfo) {
      this.setData({
        isLogin: true,
        userInfo: app.globalData.userInfo
      });
      this.fetchMyPosts();
      // 获取本地缓存的关注数
      const following = wx.getStorageSync('followingList') || [];
      this.setData({ followingCount: following.length });
    }
  },

  onChooseAvatar: function(e) {
    this.setData({ tempAvatar: e.detail.avatarUrl })
  },

  onInputNickname: function(e) {
    this.setData({ tempNickName: e.detail.value })
  },

  // 点击更换上半部分背景图
  changeBgImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ bgImgUrl: res.tempFilePaths[0] });
        wx.showToast({ title: '背景更换成功', icon: 'success' });
      }
    })
  },

  doLogin: async function() {
    const { tempAvatar, tempNickName } = this.data;
    if (tempAvatar.includes('mmbiz.qpic.cn')) {
      wx.showToast({ title: '请点击设置头像', icon: 'none' }); return;
    }
    if (!tempNickName.trim()) {
      wx.showToast({ title: '请填写昵称', icon: 'none' }); return;
    }

    wx.showLoading({ title: '登录中...' });

    try {
      let finalAvatarUrl = tempAvatar;
      if (tempAvatar.startsWith('http://tmp') || tempAvatar.startsWith('wxfile://')) {
        const res = await wx.cloud.uploadFile({
          cloudPath: 'avatars/' + Date.now() + Math.floor(Math.random() * 1000) + '.jpg',
          filePath: tempAvatar
        });
        finalAvatarUrl = res.fileID;
      }

      const newUserInfo = {
        avatarUrl: finalAvatarUrl,
        nickName: tempNickName
      };
      app.globalData.userInfo = newUserInfo;

      this.setData({
        isLogin: true,
        userInfo: newUserInfo
      });

      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      this.fetchMyPosts();

    } catch(err) {
      console.error(err);
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  toggleText: function (e) {
    const index = e.currentTarget.dataset.index;
    const key = `myPosts[${index}].isExpanded`;
    this.setData({
      [key]: !this.data.myPosts[index].isExpanded
    });
  },

  fetchMyPosts: function() {
    if (!this.data.userInfo) return;
    
    photos.where({
      nickName: this.data.userInfo.nickName
    }).orderBy('addDate', 'desc').get({
      success: res => {
        const myData = res.data.map(item => {
          return { ...item, isExpanded: false }
        });
        this.setData({ myPosts: myData });
      }
    })
  }
})
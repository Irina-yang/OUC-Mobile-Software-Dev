const app = getApp();

Page({
  data: {
    isGuest: true,
    userInfo: null,
    leaderboard: [],
    tempAvatar: '', // 暂存用户选择的头像
  },

  // 用于存储用户输入的昵称（不需要渲染到视图，所以不放data里）
  tempName: '',

  onShow: function () {
    this.setData({
      isGuest: app.globalData.isGuest,
      userInfo: app.globalData.userInfo,
      leaderboard: wx.getStorageSync('leaderboard') || []
    });
  },

  // 微信新版接口：获取用户头像
  onChooseAvatar: function(e) {
    this.setData({
      tempAvatar: e.detail.avatarUrl
    });
  },

  // 微信新版接口：监听用户输入/一键获取的昵称
  onInputNickname: function(e) {
    this.tempName = e.detail.value;
  },

  // 保存个人资料
  saveProfile: function () {
    if (!this.data.tempAvatar || !this.tempName) {
      wx.showToast({ 
        title: '请先点击左侧设置头像，并输入昵称', 
        icon: 'none' 
      });
      return;
    }
    
    let mockUser = {
      nickName: this.tempName,
      avatarUrl: this.data.tempAvatar
    };
    
    app.globalData.userInfo = mockUser;
    app.globalData.isGuest = false;
    
    this.setData({
      isGuest: false,
      userInfo: mockUser
    });
    
    wx.showToast({ title: '登录成功', icon: 'success' });
  }
});
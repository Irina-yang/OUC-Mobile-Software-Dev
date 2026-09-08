App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 已经为您替换为真实的云环境 ID
      wx.cloud.init({
        env: 'cloud1-d6gokf44g49fb8af9', 
        traceUser: true,
      })
    }
    
    // 全局状态管理
    this.globalData = {
      userInfo: null,
      openid: null
    }
  }
})
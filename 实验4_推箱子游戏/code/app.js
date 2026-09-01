App({
  onLaunch: function () {
    // 初始化本地缓存中的排行榜假数据（用于课程验收展示）
    let leaderData = wx.getStorageSync('leaderboard');
    if (!leaderData) {
      wx.setStorageSync('leaderboard', [
        { avatar: '', nickname: '系统高手', score: 99 },
        { avatar: '', nickname: '推箱子达人', score: 85 }
      ]);
    }
  },
  
  // 全局数据容器
  globalData: {
    userInfo: null,      // 存放微信头像和昵称
    isGuest: true,       // 默认以游客模式进入
    currentLevel: 0      // 记录当前关卡
  }
})
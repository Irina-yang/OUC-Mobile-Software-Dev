Page({
  data: {
    // 假定我们有4个关卡
    levels: [1, 2, 3, 4] 
  },

  goToGame: function (e) {
    let level = e.currentTarget.dataset.level;
    wx.navigateTo({
      url: `/pages/game/game?level=${level}`
    })
  },

  goToLeaderboard: function () {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    })
  }
})
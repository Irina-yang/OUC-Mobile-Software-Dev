Page({
  onLoad: function () {
    // 模拟2.5秒的加载时间后，关闭当前页面跳转到首页
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }, 2500);
  }
})
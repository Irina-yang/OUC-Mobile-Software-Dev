Page({
  data: {
    message: 'Hello World' // 初始状态显示的文字
  },

  changeText: function () {
    if (this.data.message === 'Hello World') {
      this.setData({
        message: '你好，世界！'
      });
    } else {
      this.setData({
        message: 'Hello World'
      });
    }
  }
})
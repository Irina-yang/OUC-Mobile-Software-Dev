Page({
  data: {
    name: "杨伊婷",
    school: "中国海洋大学",
    major: "网络空间安全",
    email: "17852422996@163.com",
    github: "Irina-yang",
    tags: ["独立女摄", "信印象新媒体", "机器学习", "C++ / Java"]
  },
  onLoad: function (options) {
  },

  // 1. 发送给微信好友
  onShareAppMessage: function () {
    return {
      title: '你好，我是杨伊婷！这是我的专属电子名片',
      path: '/pages/index/index',
      imageUrl: '/images/header.jpg'
    }
  },

  // 2. 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '很高兴认识你！点击查看我的专属电子名片',
      query: '', 
      imageUrl: '/images/header.jpg' 
    }
  }
})
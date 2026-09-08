const db = wx.cloud.database();

Page({
  data: {
    content: '',
    images: [], // 存放本地临时图片路径
    isPublishing: false
  },

  // 监听文字输入
  onInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 20, // 微信 API 单次最高支持选 20 张
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(item => item.tempFilePath);
        this.setData({
          images: [...this.data.images, ...tempFiles]
        });
      }
    });
  },

  // 预览大图
  previewImage(e) {
    const currentUrl = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: this.data.images,
      current: currentUrl
    });
  },

  // 删除已选图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    let newImages = this.data.images;
    newImages.splice(index, 1);
    this.setData({
      images: newImages
    });
  },

  // 核心：上传图文并写入数据库
  async submitPost() {
    const { content, images } = this.data;

    // 前端校验：不能发布全空的动态
    if (!content.trim() && images.length === 0) {
      wx.showToast({ title: '写点文字或配张图吧', icon: 'none' });
      return;
    }

    this.setData({ isPublishing: true });
    wx.showLoading({ title: '正在发布...', mask: true });

    try {
      // 1. 并发上传图片到微信云存储，换取真实的云端 fileID
      const uploadTasks = images.map(tempFilePath => {
        // 提取文件后缀名 (如 .jpg, .png)
        const suffix = tempFilePath.match(/\.[^.]+?$/)[0];
        // 构造云存储路径，加上时间戳防重名
        const cloudPath = `post_images/${Date.now()}-${Math.floor(Math.random() * 1000)}${suffix}`;
        
        return wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempFilePath
        }).then(res => res.fileID);
      });

      // 等待所有图片上传完毕
      const fileIDs = await Promise.all(uploadTasks);

      // 2. 构建假的用户信息 (工程说明见下方)
      const mockAuthorInfo = {
        nickname: "杨伊婷",
        avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0"
      };

      // 3. 将完整数据写入 posts 集合
      await db.collection('posts').add({
        data: {
          content: content,
          images: fileIDs, // 存入云端图片的 fileID 数组
          authorInfo: mockAuthorInfo,
          likeCount: 0,
          commentCount: 0,
          createTime: db.serverDate() // 使用服务端绝对时间戳
        }
      });

      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });

      // 清空当前页数据
      this.setData({
        content: '',
        images: [],
        isPublishing: false
      });

      // 延迟跳转回首页，留给用户看 Toast 成功提示的时间
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);

    } catch (err) {
      console.error("发布失败：", err);
      wx.hideLoading();
      wx.showToast({ title: '发布失败，请重试', icon: 'error' });
      this.setData({ isPublishing: false });
    }
  }
});
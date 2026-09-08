Page({
  data: {
    currentTab: 'hot', // 'hot' 对应发现(热度排序), 'time' 对应关注(时间排序)
    posts: [],
    page: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true
  },

  onShow() {
    // 每次页面重新显示时，重置数据并重新拉取
    this.setData({
      posts: [],
      page: 1,
      hasMore: true
    });
    this.fetchPosts();
  },

  // 切换顶部导航
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;
    this.setData({
      currentTab: tab,
      posts: [],
      page: 1,
      hasMore: true
    });
    this.fetchPosts();
  },

  // 获取动态数据（对接真实的后端接口）
  async fetchPosts() {
    if (this.data.isLoading || !this.data.hasMore) return;
    this.setData({ isLoading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getPosts',
        data: {
          sort: this.data.currentTab,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });

      const newPosts = res.result.data || [];
      this.setData({
        posts: [...this.data.posts, ...newPosts],
        page: this.data.page + 1,
        hasMore: newPosts.length === this.data.pageSize,
        isLoading: false
      });
    } catch (err) {
      console.error('拉取动态失败', err);
      this.setData({ isLoading: false });
    }
  },

  // 触底加载更多
  onReachBottom() {
    this.fetchPosts();
  },

  // 点击展开/收起全文
  toggleExpand(e) {
    const index = e.currentTarget.dataset.index;
    const key = `posts[${index}].isExpanded`;
    this.setData({
      [key]: !this.data.posts[index].isExpanded
    });
  },

  // 预览大图（自动支持未填满屏幕部分灰色透明背景）
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  },

  // 交互占位，后续补充点赞和不喜欢接口
  onLike(e) {
    console.log("点击了点赞", e.currentTarget.dataset.id);
  },
  
  onDislike(e) {
    console.log("点击了不喜欢", e.currentTarget.dataset.id);
  }
});
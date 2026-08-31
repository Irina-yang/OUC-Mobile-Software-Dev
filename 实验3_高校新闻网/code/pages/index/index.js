const common = require('../../utils/common.js');

Page({
  data: {
    // 幻灯片图片为了美观，可以直接调用本地图片或保持占位
    swiperImg: [
      { src: '/images/news1.jpg' },
      { src: '/images/news2.jpg' },
      { src: '/images/news3.jpg' }
    ],
    categories: ['全部', '海大要闻', '学术前沿', '校园纵横'],
    currentCat: '全部',
    newsList: [],
    
    // 搜索参数
    searchKeyword: '',
    searchHistory: [],
    isSearching: false,
    
    // 回到顶部控制
    showBackTop: false
  },
  
  onLoad: function () {
    this.loadNewsData(this.data.currentCat);
    const history = wx.getStorageSync('search_history') || [];
    this.setData({ searchHistory: history });
  },

  onPageScroll: function (e) {
    if (e.scrollTop > 300) {
      if (!this.data.showBackTop) this.setData({ showBackTop: true });
    } else {
      if (this.data.showBackTop) this.setData({ showBackTop: false });
    }
  },

  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },
  
  switchCategory: function (e) {
    const selected = e.currentTarget.dataset.cat;
    this.setData({ currentCat: selected, isSearching: false, searchKeyword: '' });
    this.loadNewsData(selected);
  },
  
  loadNewsData: function (cat) {
    const list = common.getNewsList(cat);
    this.setData({ newsList: list });
  },
  
  goToDetail: function (e) {
    wx.navigateTo({ url: '../detail/detail?id=' + e.currentTarget.dataset.id });
  },

  onSearchInput: function(e) {
    const val = e.detail.value;
    this.setData({ searchKeyword: val });
    if (!val.trim()) {
      this.setData({ isSearching: false });
      this.loadNewsData(this.data.currentCat);
    } else {
      this.setData({ isSearching: true });
    }
  },
  
  clearSearchInput: function() {
    this.setData({ searchKeyword: '', isSearching: false });
    this.loadNewsData(this.data.currentCat);
  },
  
  onSearchConfirm: function(e) {
    let keyword = this.data.searchKeyword.trim();
    if (!keyword && e.type === 'confirm') keyword = e.detail.value.trim();
    if (!keyword) return;

    this.saveSearchHistory(keyword);
    this.filterNewsByKeyword(keyword);
  },
  
  filterNewsByKeyword: function(keyword) {
    const allNews = common.getNewsList('全部');
    const filtered = allNews.filter(item => item.title.includes(keyword) || item.category.includes(keyword));
    this.setData({ newsList: filtered, isSearching: true });
  },
  
  tapHistoryTag: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.onSearchConfirm({ type: 'tap' });
  },
  
  saveSearchHistory: function(keyword) {
    let history = wx.getStorageSync('search_history') || [];
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    if (history.length > 8) history.pop();
    wx.setStorageSync('search_history', history);
    this.setData({ searchHistory: history });
  },
  
  clearSearchHistory: function() {
    wx.removeStorageSync('search_history');
    this.setData({ searchHistory: [] });
  },

  onShareAppMessage: function () {
    return { title: '中国海洋大学新闻网', path: '/pages/index/index' }
  },
  onShareTimeline: function () {
    return { title: '中国海洋大学新闻网' }
  }
});
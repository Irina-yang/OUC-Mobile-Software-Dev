const common = require('../../utils/common.js');

Page({
  data: {
    article: {},
    isAdd: false
  },
  onLoad: function (options) {
    const id = options.id;
    let currentArticle = null;
    
    const cachedArticle = wx.getStorageSync(id);
    if (cachedArticle) {
      currentArticle = cachedArticle;
      this.setData({ article: currentArticle, isAdd: true });
    } else {
      const res = common.getNewsDetail(id);
      if (res.code === '200') {
        currentArticle = res.news;
        this.setData({ article: currentArticle, isAdd: false });
      }
    }

    if (currentArticle) {
      this.recordHistory(currentArticle);
    }
  },
  
  recordHistory: function(article) {
    let historyList = wx.getStorageSync('history_list') || [];
    historyList = historyList.filter(item => item.id !== article.id);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const readTime = `${year}-${month}-${day} ${hours}:${minutes}`;

    const historyItem = { ...article, read_time: readTime };

    historyList.unshift(historyItem);
    if (historyList.length > 20) {
      historyList.pop();
    }
    wx.setStorageSync('history_list', historyList);
  },

  addFavorites: function () {
    const article = this.data.article;
    wx.setStorageSync(article.id, article);
    this.setData({ isAdd: true });
    wx.showToast({ title: '已加入收藏', icon: 'success' });
  },
  
  cancelFavorites: function () {
    const article = this.data.article;
    wx.removeStorageSync(article.id);
    this.setData({ isAdd: false });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  },
  
  downloadAsWord: function () {
    const article = this.data.article;
    const fileContent = `<html xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"></head>
      <body style="font-family: 'Microsoft YaHei', sans-serif;">
        <h2 style="text-align: center; color: #333;">${article.title}</h2>
        <p style="text-align: center; color: #888; font-size: 12px;">${article.author || '海大新闻网'} | ${article.add_date}</p>
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />
        <div style="line-height: 1.8; font-size: 14px; text-indent: 28px; color: #444;">
          ${article.content}
        </div>
      </body>
    </html>`;
    
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/ouc_news_${article.id}.doc`;

    wx.showLoading({ title: '正在生成Word...' });

    fs.writeFile({
      filePath: filePath,
      data: fileContent,
      encoding: 'utf8',
      success: () => {
        wx.hideLoading();
        wx.openDocument({
          filePath: filePath,
          fileType: 'doc', 
          showMenu: true,  
          success: () => {
            wx.showToast({ title: '文档已打开', icon: 'success' });
          },
          fail: () => {
            wx.showToast({ title: '打开文档失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '生成Word失败', icon: 'none' });
      }
    });
  },
  
  onShareAppMessage: function () {
    const article = this.data.article;
    return {
      title: article.title || '中国海洋大学新闻网',
      path: '/pages/detail/detail?id=' + article.id,
      imageUrl: article.poster 
    }
  },
  
  onShareTimeline: function () {
    const article = this.data.article;
    return {
      title: article.title || '中国海洋大学新闻网', 
      query: 'id=' + article.id,
      imageUrl: article.poster
    }
  }
});
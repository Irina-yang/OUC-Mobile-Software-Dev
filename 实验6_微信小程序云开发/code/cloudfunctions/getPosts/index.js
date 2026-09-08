// cloudfunctions/getPosts/index.js
const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV 
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  // 获取当前用户的 openid
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;

  // 接收前端传来的参数
  // sort: 排序方式 'hot'(热度) 或 'time'(时间)，默认时间排序
  // page: 页码，用于上拉加载更多，默认第1页
  // pageSize: 每页拉取的数量，默认10条
  const { sort = 'time', page = 1, pageSize = 10 } = event;

  try {
    // -----------------------------------------
    // 第一步：核心防骚扰逻辑 - 获取该用户“不喜欢”的动态ID
    // -----------------------------------------
    const dislikeRes = await db.collection('interactions')
      .where({
        _openid: openId,
        type: 'dislike'
      })
      .get();

    // 提取所有被踩过的 postId，组装成数组
    const dislikedPostIds = dislikeRes.data.map(item => item.postId);

    // -----------------------------------------
    // 第二步：构建基础查询条件，所有人动态可见，但过滤掉不喜欢的
    // -----------------------------------------
    let queryCondition = {};
    if (dislikedPostIds.length > 0) {
      queryCondition = {
        _id: _.nin(dislikedPostIds) // _.nin 表示 "not in"，如果在不喜欢列表里，直接不查出来
      };
    }

    // -----------------------------------------
    // 第三步：执行查询与双重排序
    // -----------------------------------------
    let query = db.collection('posts').where(queryCondition);

    if (sort === 'hot') {
      // 按照大纲要求：点赞数优先级第一，其次按照时间顺序倒序
      query = query.orderBy('likeCount', 'desc').orderBy('createTime', 'desc');
    } else {
      // 按照大纲要求：时间是倒序，像栈一样后发的在上面
      query = query.orderBy('createTime', 'desc');
    }

    // -----------------------------------------
    // 第四步：分页返回
    // -----------------------------------------
    const postsRes = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: postsRes.data,
      message: '获取动态成功'
    };

  } catch (err) {
    console.error('获取动态异常:', err);
    return {
      success: false,
      error: err,
      message: '服务器开小差了'
    };
  }
};
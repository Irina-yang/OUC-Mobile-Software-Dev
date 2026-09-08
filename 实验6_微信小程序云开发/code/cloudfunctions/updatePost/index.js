// cloudfunctions/updatePost/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  // event 包含前端传来的参数：postId(帖子ID), action(动作), updateData(要更新的数据)
  const { postId, action, updateData } = event;
  
  try {
    // 管理员权限：无视“仅创建者可写”的限制，强行帮用户更新数据库
    await db.collection('photos').doc(postId).update({
      data: updateData
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID: callerOpenid } = cloud.getWXContext()
  const { targetOpenid, name } = event

  const { data: callers } = await db.collection('admins').where({ openid: callerOpenid }).get()
  if (callers.length === 0) {
    return { code: 403, message: '无权限' }
  }

  if (!targetOpenid || !name) {
    return { code: 400, message: '缺少参数' }
  }

  try {
    const { data: existing } = await db.collection('admins').where({ openid: targetOpenid }).get()
    if (existing.length > 0) {
      return { code: 409, message: '该用户已是管理员' }
    }
    await db.collection('admins').add({
      data: { openid: targetOpenid, name, created_at: db.serverDate() }
    })
    return { code: 200, message: '添加成功' }
  } catch (err) {
    return { code: 500, message: '添加失败', error: err.message }
  }
}

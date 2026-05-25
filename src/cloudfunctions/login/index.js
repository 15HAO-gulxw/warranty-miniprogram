const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const { data } = await db.collection('admins').where({ openid: OPENID }).get()
    if (data.length === 0) {
      return { code: 403, message: '无权限，请联系管理员' }
    }
    return { code: 200, openid: OPENID, name: data[0].name }
  } catch (err) {
    return { code: 500, message: '登录失败', error: err.message }
  }
}

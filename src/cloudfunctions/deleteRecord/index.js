const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { _id } = event
  if (!_id) return { code: 400, message: '缺少记录 ID' }

  try {
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const { data: record } = await db.collection('records').doc(_id).get()
    const allImages = [
      ...(record.product_images || []),
      ...(record.construction_images || []),
    ]
    if (allImages.length > 0) {
      await cloud.deleteFile({ fileList: allImages })
    }
    await db.collection('records').doc(_id).remove()
    return { code: 200 }
  } catch (err) {
    return { code: 500, message: '删除失败', error: err.message }
  }
}

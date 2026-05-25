const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { field, value } = event
  const allowedFields = ['owner_phone', 'warranty_no', 'license_plate', 'vin']
  if (!allowedFields.includes(field)) {
    return { code: 400, message: '不支持的查询字段' }
  }
  if (!value || value.trim() === '') {
    return { code: 400, message: '查询值不能为空' }
  }

  try {
    const { data } = await db.collection('records')
      .where({ [field]: value.trim() })
      .get()

    if (data.length === 0) {
      return { code: 404, message: '未找到质保记录' }
    }

    const now = new Date()
    const masked = data.map(record => {
      const { owner_phone, ...rest } = record
      const expire = new Date(record.warranty_expire)
      const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24))
      let status = 'valid'
      if (diffDays < 0) status = 'expired'
      else if (diffDays <= 30) status = 'expiring'

      return {
        ...rest,
        owner_phone_masked: owner_phone.slice(0, 3) + '****' + owner_phone.slice(-4),
        status,
      }
    })

    return { code: 200, data: masked }
  } catch (err) {
    return { code: 500, message: '查询失败', error: err.message }
  }
}

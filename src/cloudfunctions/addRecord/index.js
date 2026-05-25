const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function generateWarrantyNo() {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const prefix = 'BM' + dateStr
  const { total } = await db.collection('records')
    .where({ warranty_no: db.RegExp({ regexp: '^' + prefix, flags: 'i' }) })
    .count()
  return prefix + String(total + 1).padStart(4, '0')
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const record = event.record
  if (!record) return { code: 400, message: '缺少记录数据' }

  try {
    const { data: admins } = await db.collection('admins').where({ openid: OPENID }).get()
    if (admins.length === 0) return { code: 403, message: '无权限' }

    const warrantyNo = await generateWarrantyNo()
    const constructDate = new Date(record.construction_date)
    constructDate.setFullYear(constructDate.getFullYear() + record.warranty_years)
    const warrantyExpire = constructDate.toISOString().split('T')[0]

    const result = await db.collection('records').add({
      data: {
        ...record,
        warranty_no: warrantyNo,
        warranty_expire: warrantyExpire,
        created_by: OPENID,
        created_at: db.serverDate(),
        updated_at: db.serverDate(),
      }
    })
    return { code: 200, _id: result._id, warranty_no: warrantyNo }
  } catch (err) {
    return { code: 500, message: '录入失败', error: err.message }
  }
}

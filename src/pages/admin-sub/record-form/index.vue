<template>
  <scroll-view class="page" scroll-y>

    <!-- Header -->
    <view class="form-header">
      <image class="header-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="header-title">电子质保录入</text>
      <text class="header-sub">ELECTRONIC WARRANTY REGISTRATION</text>
    </view>

    <!-- 施工店信息 -->
    <view class="form-card">
      <view class="sec-head">
        <view class="sec-bar" />
        <text class="sec-text">施工店信息</text>
      </view>
      <view class="field-row">
        <text class="field-label">施工店名</text>
        <input class="field-input" v-model="form.store_name" placeholder="请输入施工店名" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">施工店电话</text>
        <input class="field-input" v-model="form.store_phone" type="number" placeholder="请输入联系电话" placeholder-class="ph" />
      </view>
    </view>

    <!-- 车主信息 -->
    <view class="form-card">
      <view class="sec-head">
        <view class="sec-bar" />
        <text class="sec-text">车主信息</text>
      </view>
      <view class="field-row">
        <text class="field-label">车主姓名 <text class="req">*</text></text>
        <input class="field-input" v-model="form.owner_name" placeholder="请输入姓名" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">车主电话 <text class="req">*</text></text>
        <input class="field-input" v-model="form.owner_phone" type="number" placeholder="请输入手机号" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">车牌号码 <text class="req">*</text></text>
        <input class="field-input" v-model="form.license_plate" placeholder="如：粤A12345" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">车架号码</text>
        <input class="field-input" v-model="form.vin" placeholder="17位VIN码（选填）" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">车型名称</text>
        <input class="field-input" v-model="form.car_model" placeholder="如：宝马3系" placeholder-class="ph" />
      </view>
    </view>

    <!-- 产品信息 -->
    <view class="form-card">
      <view class="sec-head">
        <view class="sec-bar" />
        <text class="sec-text">产品信息</text>
      </view>
      <view class="field-row">
        <text class="field-label">产品品牌</text>
        <input class="field-input" v-model="form.product_brand" placeholder="如：龙膜、3M、施工宝" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row" @tap="showSeriesPicker = true">
        <text class="field-label">产品系列</text>
        <text class="field-val" :class="{ ph: !form.product_series }">{{ form.product_series || '请选择' }}</text>
        <u-icon name="arrow-right" size="28" color="#606880" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">产品型号</text>
        <input class="field-input" v-model="form.product_model" placeholder="具体型号（选填）" placeholder-class="ph" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">施工总价</text>
        <input class="field-input" style="text-align:right" v-model="priceText" type="digit" placeholder="0.00" placeholder-class="ph" />
        <text class="unit">元</text>
      </view>
      <view class="field-sep" />
      <view class="field-row" @tap="openDatePicker('construction')">
        <text class="field-label">施工日期 <text class="req">*</text></text>
        <text class="field-val" :class="{ ph: !form.construction_date }">{{ form.construction_date || '请选择' }}</text>
        <u-icon name="calendar" size="28" color="#606880" />
      </view>
      <view class="field-sep" />
      <view class="field-row" @tap="openDatePicker('delivery')">
        <text class="field-label">交车时间</text>
        <text class="field-val" :class="{ ph: !form.delivery_date }">{{ form.delivery_date || '请选择' }}</text>
        <u-icon name="calendar" size="28" color="#606880" />
      </view>
      <view class="field-sep" />
      <view class="field-row" @tap="showWarrantyPicker = true">
        <text class="field-label">质保年限 <text class="req">*</text></text>
        <text class="field-val" :class="{ ph: !form.warranty_years }">{{ form.warranty_years ? `${form.warranty_years} 年` : '请选择' }}</text>
        <u-icon name="arrow-right" size="28" color="#606880" />
      </view>
      <view class="field-sep" />
      <view class="field-row">
        <text class="field-label">施工师傅</text>
        <input class="field-input" v-model="form.technician" placeholder="师傅姓名（选填）" placeholder-class="ph" />
      </view>
    </view>

    <!-- 施工部位 -->
    <view class="form-card">
      <view class="sec-head">
        <view class="sec-bar" />
        <text class="sec-text">施工部位</text>
        <text v-if="selectedParts.length" class="parts-badge">已选 {{ selectedParts.length }} 处</text>
      </view>
      <view class="parts-grid">
        <view
          v-for="part in allParts"
          :key="part"
          class="part-chip"
          :class="{ 'part-on': selectedParts.includes(part) }"
          @tap="togglePart(part)"
        >
          <text>{{ part }}</text>
        </view>
      </view>
    </view>

    <!-- 图片上传 -->
    <view class="form-card">
      <view class="sec-head">
        <view class="sec-bar" />
        <text class="sec-text">产品图片</text>
      </view>
      <view class="upload-row" @tap="chooseImages('product')">
        <view class="upload-left">
          <u-icon name="photo" size="44" color="#C9A84C" />
          <text class="upload-hint">{{ form.product_images.length ? `已选 ${form.product_images.length} 张` : '点击选择图片' }}</text>
        </view>
        <text class="upload-action">{{ form.product_images.length ? '重新上传' : '上传' }}</text>
      </view>
      <view v-if="form.product_images.length" class="thumb-row">
        <image v-for="(url, i) in form.product_images" :key="i" :src="url" mode="aspectFill" class="thumb" @tap="previewImgs(form.product_images, i)" />
      </view>

      <view class="sec-head" style="margin-top: 24rpx">
        <view class="sec-bar" />
        <text class="sec-text">施工图片</text>
      </view>
      <view class="upload-row" @tap="chooseImages('construction')">
        <view class="upload-left">
          <u-icon name="photo" size="44" color="#C9A84C" />
          <text class="upload-hint">{{ form.construction_images.length ? `已选 ${form.construction_images.length} 张` : '点击选择图片' }}</text>
        </view>
        <text class="upload-action">{{ form.construction_images.length ? '重新上传' : '上传' }}</text>
      </view>
      <view v-if="form.construction_images.length" class="thumb-row">
        <image v-for="(url, i) in form.construction_images" :key="i" :src="url" mode="aspectFill" class="thumb" @tap="previewImgs(form.construction_images, i)" />
      </view>
    </view>

    <!-- Submit -->
    <view class="submit-wrap">
      <view class="submit-btn" @tap="submit">
        <u-loading-icon v-if="submitting" color="#C9A84C" size="32" />
        <text v-else class="submit-text">确 认 上 传</text>
      </view>
    </view>

  </scroll-view>

  <!-- Date Picker -->
  <u-datetime-picker
    :show="showDatePicker"
    v-model="pickerTs"
    mode="date"
    @confirm="onDateConfirm"
    @cancel="showDatePicker = false"
  />

  <!-- Product Series Picker -->
  <u-picker
    :show="showSeriesPicker"
    :columns="seriesColumns"
    @confirm="onSeriesConfirm"
    @cancel="showSeriesPicker = false"
  />

  <!-- Warranty Years Picker -->
  <u-picker
    :show="showWarrantyPicker"
    :columns="warrantyColumns"
    @confirm="onWarrantyConfirm"
    @cancel="showWarrantyPicker = false"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  store_name: '',
  store_phone: '',
  owner_name: '',
  owner_phone: '',
  license_plate: '',
  vin: '',
  car_model: '',
  car_color: '',
  product_brand: '',
  product_series: '',
  product_model: '',
  construction_parts: [] as string[],
  construction_date: '',
  delivery_date: '',
  warranty_years: 0,
  technician: '',
  total_price: 0,
  product_images: [] as string[],
  construction_images: [] as string[],
})

const priceText = ref('')
const selectedParts = ref<string[]>([])
const submitting = ref(false)
const showDatePicker = ref(false)
const pickerTs = ref(Date.now())
const showSeriesPicker = ref(false)
const showWarrantyPicker = ref(false)
let activeDateField = ''

const allParts = [
  '全车', '左侧裙', '右侧裙', '左前门', '左后门',
  '右前门', '右后门', '左前叶子板', '左后叶子板',
  '右前叶子板', '右后叶子板', '引擎盖', '车顶',
  '后盖', '前保险杠', '后保险杠', '后视镜', '门把手',
]

const seriesColumns = [[
  'PPF 至尊系列', 'PPF 精英系列', 'PPF 标准系列',
  '改色膜 哑光系列', '改色膜 光面系列', '改色膜 变色龙系列',
  '隔热膜 旗舰系列', '隔热膜 标准系列', '其他',
]]

const warrantyColumns = [[
  '1 年', '2 年', '3 年', '4 年', '5 年',
  '6 年', '7 年', '8 年', '9 年', '10 年',
]]

function togglePart(part: string) {
  const idx = selectedParts.value.indexOf(part)
  if (idx >= 0) selectedParts.value.splice(idx, 1)
  else selectedParts.value.push(part)
}

function openDatePicker(field: string) {
  activeDateField = field
  showDatePicker.value = true
}

function tsToDateStr(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function onDateConfirm(e: any) {
  const s = tsToDateStr(e.value)
  if (activeDateField === 'construction') form.construction_date = s
  else if (activeDateField === 'delivery') form.delivery_date = s
  showDatePicker.value = false
}

function onSeriesConfirm(e: any) {
  form.product_series = e.value[0]
  showSeriesPicker.value = false
}

function onWarrantyConfirm(e: any) {
  form.warranty_years = parseInt(e.value[0])
  showWarrantyPicker.value = false
}

async function chooseImages(type: 'product' | 'construction') {
  const current = type === 'product' ? form.product_images : form.construction_images
  const remaining = 9 - current.length
  if (remaining <= 0) {
    uni.showToast({ title: '最多上传 9 张', icon: 'none' })
    return
  }
  try {
    const res = await uni.chooseImage({ count: remaining, sizeType: ['compressed'] })
    uni.showLoading({ title: '上传中...' })
    const uploaded: string[] = []
    for (const path of res.tempFilePaths) {
      const cloudPath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const up = await wx.cloud.uploadFile({ cloudPath, filePath: path })
      uploaded.push(up.fileID)
    }
    if (type === 'product') form.product_images = [...current, ...uploaded]
    else form.construction_images = [...current, ...uploaded]
  } catch {
    uni.showToast({ title: '上传失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

function previewImgs(urls: string[], index: number) {
  uni.previewImage({ urls, current: urls[index] })
}

async function submit() {
  if (!form.owner_name || !form.owner_phone || !form.license_plate) {
    uni.showToast({ title: '请填写车主姓名、电话和车牌号', icon: 'none' })
    return
  }
  if (!form.construction_date) {
    uni.showToast({ title: '请选择施工日期', icon: 'none' })
    return
  }
  if (!form.warranty_years) {
    uni.showToast({ title: '请选择质保年限', icon: 'none' })
    return
  }
  form.construction_parts = [...selectedParts.value]
  form.total_price = parseFloat(priceText.value) || 0
  submitting.value = true
  try {
    const res = await wx.cloud.callFunction({
      name: 'addRecord',
      data: { record: { ...form } },
    }) as any
    if (res.result.code === 200) {
      uni.showToast({ title: '录入成功' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: res.result.message || '录入失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  background: #0A1628;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

/* Header */
.form-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 40rpx 44rpx;
  background: linear-gradient(180deg, #112240 0%, #0d1a2e 100%);
  border-bottom: 1rpx solid rgba(201, 168, 76, 0.3);
}
.header-logo {
  width: 110rpx;
  height: 110rpx;
  border-radius: 22rpx;
  margin-bottom: 20rpx;
  background: #0A1628;
}
.header-title {
  display: block;
  font-size: 38rpx;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 6rpx;
  margin-bottom: 10rpx;
}
.header-sub {
  display: block;
  font-size: 18rpx;
  color: #C9A84C;
  letter-spacing: 3rpx;
  opacity: 0.85;
}

/* Card */
.form-card {
  background: linear-gradient(160deg, #13243d 0%, #0f1d31 100%);
  border: 1rpx solid rgba(201, 168, 76, 0.18);
  border-radius: 24rpx;
  margin: 24rpx 24rpx 0;
  padding: 0 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
}

/* Section Header */
.sec-head {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 28rpx 0 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}
.sec-bar {
  width: 6rpx;
  height: 30rpx;
  background: linear-gradient(180deg, #E8D5A3, #C9A84C);
  border-radius: 3rpx;
}
.sec-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #D4E0ED;
  flex: 1;
}
.parts-badge {
  font-size: 22rpx;
  color: #C9A84C;
  background: rgba(201, 168, 76, 0.12);
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.3);
}

/* Field Rows */
.field-row {
  display: flex;
  align-items: center;
  min-height: 92rpx;
  gap: 12rpx;
}
.field-label {
  font-size: 26rpx;
  color: #7A8FA3;
  flex-shrink: 0;
  width: 160rpx;
}
.req {
  color: #C9A84C;
  font-size: 22rpx;
}
.field-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  text-align: right;
}
.field-val {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
  text-align: right;
}
.field-sep {
  height: 1rpx;
  background: rgba(255, 255, 255, 0.05);
  margin: 0 -32rpx;
  margin-left: -32rpx;
  margin-right: -32rpx;
}
.unit {
  font-size: 24rpx;
  color: #7A8FA3;
  flex-shrink: 0;
}
.ph { color: #3a4d62 !important; }

/* Parts Grid */
.parts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx 0 32rpx;
}
.part-chip {
  padding: 14rpx 24rpx;
  border-radius: 40rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.18);
  background: rgba(255, 255, 255, 0.03);
}
.part-chip text { font-size: 24rpx; color: #7A8FA3; }
.part-on {
  background: rgba(201, 168, 76, 0.15);
  border-color: #C9A84C;
}
.part-on text { color: #C9A84C; }

/* Upload */
.upload-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}
.upload-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.upload-hint {
  font-size: 26rpx;
  color: #7A8FA3;
}
.upload-action {
  font-size: 26rpx;
  color: #C9A84C;
  border-bottom: 1rpx solid rgba(201, 168, 76, 0.35);
}
.thumb-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-bottom: 24rpx;
}
.thumb {
  width: 192rpx;
  height: 192rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.2);
}

/* Submit */
.submit-wrap {
  padding: 40rpx 24rpx 60rpx;
}
.submit-btn {
  background: linear-gradient(135deg, #1a2e4a, #0f1e33);
  border: 1rpx solid rgba(201, 168, 76, 0.45);
  border-radius: 20rpx;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24rpx rgba(201, 168, 76, 0.12), inset 0 1rpx 0 rgba(201, 168, 76, 0.2);
}
.submit-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #C9A84C;
  letter-spacing: 8rpx;
}
</style>

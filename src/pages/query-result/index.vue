<template>
  <view class="page">
    <!-- 查询表单区 -->
    <view class="query-section">
      <text class="query-title">质保查询</text>

      <!-- 字段切换 Tab -->
      <view class="tab-row">
        <view
          v-for="(tab, i) in tabs"
          :key="i"
          class="tab-btn"
          :class="{ 'tab-active': activeTab === i }"
          @tap="switchTab(i)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 输入框 -->
      <view class="input-wrap">
        <u-icon name="search" size="36" color="#8899AA" />
        <input
          class="query-input"
          v-model="queryValue"
          :placeholder="tabs[activeTab].placeholder"
          :placeholder-style="'color:#606880'"
          @confirm="doQuery"
        />
        <u-icon v-if="queryValue" name="close-circle" size="36" color="#606880" @tap="queryValue = ''" />
      </view>

      <view class="search-btn" @tap="doQuery">
        <u-loading-icon v-if="loading" color="#0A1628" />
        <text v-else class="search-btn-text">查询</text>
      </view>
    </view>

    <!-- 多条记录：先选择 -->
    <view v-if="records.length > 1 && !current" class="selector-card">
      <text class="selector-tip">找到 {{ records.length }} 条记录，请选择：</text>
      <view
        v-for="(r, i) in records"
        :key="i"
        class="selector-item"
        @tap="current = r"
      >
        <view class="selector-main">
          <text class="selector-name">{{ r.car_model || '未知车型' }} · {{ r.license_plate }}</text>
          <text class="selector-date">施工日期：{{ r.construction_date }}</text>
        </view>
        <u-icon name="arrow-right" color="#C9A84C" size="28" />
      </view>
    </view>

    <!-- 单条/已选记录：展示详情 -->
    <view v-if="current" class="detail-card">
      <view class="status-row">
        <WarrantyStatusTag :status="current.status" />
        <text class="warranty-no">{{ current.warranty_no }}</text>
      </view>

      <view class="cell-group">
        <view class="cell-item" v-for="field in detailFields" :key="field.label">
          <text class="cell-label">{{ field.label }}</text>
          <text class="cell-value">{{ field.value }}</text>
        </view>
      </view>

      <view v-if="current.product_images?.length" class="image-section">
        <text class="section-title">产品图片</text>
        <view class="image-grid">
          <image
            v-for="(url, i) in current.product_images"
            :key="i"
            :src="url"
            mode="aspectFill"
            @tap="previewImages(current.product_images!, i)"
          />
        </view>
      </view>

      <view v-if="current.construction_images?.length" class="image-section">
        <text class="section-title">施工图片</text>
        <view class="image-grid">
          <image
            v-for="(url, i) in current.construction_images"
            :key="i"
            :src="url"
            mode="aspectFill"
            @tap="previewImages(current.construction_images!, i)"
          />
        </view>
      </view>

      <view v-if="records.length > 1" class="back-row">
        <text class="back-btn" @tap="current = null">← 返回选择</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { QueryResult } from '@/types'
import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'

const tabs = [
  { label: '手机号',  placeholder: '请输入车主手机号',  field: 'owner_phone' },
  { label: '质保卡号', placeholder: '请输入质保卡号',   field: 'warranty_no' },
  { label: '车牌号',  placeholder: '请输入车牌号',     field: 'license_plate' },
  { label: '车架号',  placeholder: '请输入车架号(VIN)', field: 'vin' },
]

const activeTab = ref(0)
const queryValue = ref('')
const loading = ref(false)
const records = ref<QueryResult[]>([])
const current = ref<QueryResult | null>(null)

const detailFields = computed(() => {
  if (!current.value) return []
  const r = current.value
  return [
    { label: '车主姓名', value: r.owner_name },
    { label: '联系手机', value: r.owner_phone_masked },
    { label: '车牌号',   value: r.license_plate },
    { label: '车架号',   value: r.vin || '—' },
    { label: '车型',     value: r.car_model || '—' },
    { label: '车辆颜色', value: r.car_color || '—' },
    { label: '施工产品', value: [r.product_brand, r.product_series, r.product_model].filter(Boolean).join(' ') },
    { label: '施工部位', value: r.construction_parts?.join('、') || '—' },
    { label: '施工日期', value: r.construction_date },
    { label: '交车时间', value: r.delivery_date || '—' },
    { label: '质保年限', value: `${r.warranty_years} 年` },
    { label: '质保到期', value: r.warranty_expire },
    { label: '施工师傅', value: r.technician || '—' },
  ]
})

function switchTab(i: number) {
  activeTab.value = i
  queryValue.value = ''
  records.value = []
  current.value = null
}

async function doQuery() {
  if (!queryValue.value.trim()) {
    uni.showToast({ title: '请输入查询内容', icon: 'none' })
    return
  }
  loading.value = true
  records.value = []
  current.value = null
  try {
    const res = await wx.cloud.callFunction({
      name: 'queryRecord',
      data: { field: tabs[activeTab.value].field, value: queryValue.value.trim() },
    }) as any
    if (res.result.code === 200) {
      records.value = res.result.data
      if (records.value.length === 1) current.value = records.value[0]
    } else {
      uni.showToast({ title: res.result.message || '未找到记录', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '查询失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function previewImages(urls: string[], index: number) {
  uni.previewImage({ urls, current: urls[index] })
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const raw = page.options?.data
  if (raw) {
    try {
      records.value = JSON.parse(decodeURIComponent(raw))
      if (records.value.length === 1) current.value = records.value[0]
    } catch { /* ignore */ }
  }
})
</script>

<style scoped>
.page {
  background: #0A1628;
  min-height: 100vh;
  padding: 32rpx 32rpx 60rpx;
}

/* Query Section */
.query-section { margin-bottom: 32rpx; }
.query-title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 32rpx;
}

/* Tab Row */
.tab-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  border: 1rpx solid rgba(201, 168, 76, 0.3);
  font-size: 24rpx;
  color: #8899AA;
}
.tab-btn text { color: #8899AA; }
.tab-active {
  background: rgba(201, 168, 76, 0.15);
  border-color: #C9A84C;
}
.tab-active text { color: #C9A84C; }

/* Input */
.input-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 20rpx;
}
.query-input {
  flex: 1;
  font-size: 28rpx;
  color: #FFFFFF;
}

/* Search Button */
.search-btn {
  background: linear-gradient(135deg, #C9A84C, #E8D5A3);
  border-radius: 16rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-btn-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #0A1628;
  letter-spacing: 4rpx;
}

/* Selector */
.selector-card {
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.selector-tip {
  font-size: 26rpx;
  color: #8899AA;
  display: block;
  margin-bottom: 24rpx;
}
.selector-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.selector-item:last-child { border-bottom: none; }
.selector-main { flex: 1; }
.selector-name {
  display: block;
  font-size: 30rpx;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}
.selector-date { font-size: 24rpx; color: #8899AA; }

/* Detail Card */
.detail-card {
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 32rpx;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.warranty-no { font-size: 24rpx; color: #8899AA; }

/* Cell Group */
.cell-group { display: flex; flex-direction: column; }
.cell-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
  gap: 24rpx;
}
.cell-item:last-child { border-bottom: none; }
.cell-label {
  font-size: 26rpx;
  color: #8899AA;
  flex-shrink: 0;
  width: 160rpx;
}
.cell-value {
  font-size: 26rpx;
  color: #FFFFFF;
  text-align: right;
  flex: 1;
}

/* Images */
.image-section { margin-top: 32rpx; }
.section-title {
  font-size: 26rpx;
  color: #8899AA;
  display: block;
  margin-bottom: 16rpx;
}
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.image-grid image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

/* Back */
.back-row { margin-top: 32rpx; text-align: center; }
.back-btn { font-size: 26rpx; color: #C9A84C; }
</style>

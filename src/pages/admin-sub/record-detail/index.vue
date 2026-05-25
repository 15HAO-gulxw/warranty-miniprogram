<template>
  <view class="container">
    <view v-if="loading" class="center"><u-loading-icon /></view>

    <view v-else-if="record" class="detail-card">
      <view class="status-row">
        <WarrantyStatusTag :status="getStatus(record.warranty_expire)" />
        <text class="warranty-no">{{ record.warranty_no }}</text>
      </view>

      <u-cell-group margin="0">
        <u-cell title="车主姓名" :value="record.owner_name" />
        <u-cell title="手机号" :value="record.owner_phone" />
        <u-cell title="车牌号" :value="record.license_plate" />
        <u-cell title="车架号(VIN)" :value="record.vin || '—'" />
        <u-cell title="车型" :value="record.car_model || '—'" />
        <u-cell title="车辆颜色" :value="record.car_color || '—'" />
        <u-cell title="产品品牌" :value="record.product_brand" />
        <u-cell title="产品系列" :value="record.product_series || '—'" />
        <u-cell title="产品型号" :value="record.product_model || '—'" />
        <u-cell title="施工部位" :value="record.construction_parts?.join('、') || '—'" />
        <u-cell title="施工日期" :value="record.construction_date" />
        <u-cell title="交车时间" :value="record.delivery_date || '—'" />
        <u-cell title="质保年限" :value="`${record.warranty_years} 年`" />
        <u-cell title="质保到期" :value="record.warranty_expire" />
        <u-cell title="施工师傅" :value="record.technician || '—'" />
        <u-cell title="施工总价" :value="`¥${record.total_price}`" />
      </u-cell-group>

      <view v-if="record.product_images?.length" class="image-section">
        <text class="section-title">产品图片</text>
        <view class="image-grid">
          <image v-for="(url, i) in record.product_images" :key="i" :src="url" mode="aspectFill"
            @tap="previewImages(record.product_images!, i)" />
        </view>
      </view>

      <view v-if="record.construction_images?.length" class="image-section">
        <text class="section-title">施工图片</text>
        <view class="image-grid">
          <image v-for="(url, i) in record.construction_images" :key="i" :src="url" mode="aspectFill"
            @tap="previewImages(record.construction_images!, i)" />
        </view>
      </view>

      <view class="action-row">
        <u-button text="编辑" @click="goEdit" customStyle="flex:1" />
        <view style="width:16rpx" />
        <u-button text="删除" type="error" @click="confirmDelete" customStyle="flex:1" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWarrantyStatus } from '@/utils/date'
import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'
import type { WarrantyRecord } from '@/types'

const record = ref<WarrantyRecord | null>(null)
const loading = ref(true)
let recordId = ''

onMounted(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  recordId = page.options?.id || ''
  if (!recordId) {
    uni.showToast({ title: '记录ID缺失', icon: 'none' })
    loading.value = false
    return
  }
  try {
    const { data } = await wx.cloud.database().collection('records').doc(recordId).get()
    record.value = data as WarrantyRecord
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

function getStatus(expire: string) {
  return getWarrantyStatus(expire)
}

function previewImages(urls: string[], index: number) {
  uni.previewImage({ urls, current: urls[index] })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/admin-sub/record-form/index?id=${recordId}` })
}

async function confirmDelete() {
  const { confirm } = await uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确认删除此记录？',
    confirmColor: '#FA3534',
  })
  if (!confirm) return
  try {
    const res = await wx.cloud.callFunction({ name: 'deleteRecord', data: { _id: recordId } }) as any
    if (res.result.code === 200) {
      uni.showToast({ title: '已删除' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: res.result.message || '删除失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '删除失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
.container { background: #F5F6FA; min-height: 100vh; padding: 24rpx; }
.detail-card { background: #fff; border-radius: 16rpx; padding: 24rpx; }
.status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.warranty-no { font-size: 26rpx; color: #999; }
.image-section { margin-top: 32rpx; }
.section-title { font-size: 28rpx; color: #666; display: block; margin-bottom: 16rpx; }
.image-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.image-grid image { width: 200rpx; height: 200rpx; border-radius: 8rpx; }
.action-row { display: flex; margin-top: 32rpx; }
.center { display: flex; justify-content: center; padding: 80rpx 0; }
</style>

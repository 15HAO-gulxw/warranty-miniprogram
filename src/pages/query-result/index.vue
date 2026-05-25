<template>
  <view class="container">
    <!-- 多条记录：先选择 -->
    <view v-if="records.length > 1 && !current" class="selector-card">
      <text class="selector-tip">找到 {{ records.length }} 条记录，请选择：</text>
      <view
        v-for="(r, i) in records"
        :key="i"
        class="selector-item"
        @tap="current = r"
      >
        <text class="selector-name">{{ r.car_model || '未知车型' }} · {{ r.license_plate }}</text>
        <text class="selector-date">施工日期：{{ r.construction_date }}</text>
        <u-icon name="arrow-right" color="#ccc" size="28" />
      </view>
    </view>

    <!-- 单条/已选记录：展示详情 -->
    <view v-if="current" class="detail-card">
      <view class="status-row">
        <WarrantyStatusTag :status="current.status" />
        <text class="warranty-no">{{ current.warranty_no }}</text>
      </view>

      <u-cell-group margin="0">
        <u-cell title="车主姓名" :value="current.owner_name" />
        <u-cell title="联系手机" :value="current.owner_phone_masked" />
        <u-cell title="车牌号" :value="current.license_plate" />
        <u-cell title="车架号(VIN)" :value="current.vin || '—'" />
        <u-cell title="车型" :value="current.car_model || '—'" />
        <u-cell title="车辆颜色" :value="current.car_color || '—'" />
        <u-cell title="施工产品" :value="[current.product_brand, current.product_series, current.product_model].filter(Boolean).join(' ')" />
        <u-cell title="施工部位" :value="current.construction_parts?.join('、') || '—'" />
        <u-cell title="施工日期" :value="current.construction_date" />
        <u-cell title="交车时间" :value="current.delivery_date || '—'" />
        <u-cell title="质保年限" :value="`${current.warranty_years} 年`" />
        <u-cell title="质保到期" :value="current.warranty_expire" />
        <u-cell title="施工师傅" :value="current.technician || '—'" />
      </u-cell-group>

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
        <u-button text="返回选择" @click="current = null" size="mini" />
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="records.length === 0" class="empty">
      <u-empty text="未找到质保记录" subText="请检查输入信息或联系门店" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QueryResult } from '@/types'
import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'

const records = ref<QueryResult[]>([])
const current = ref<QueryResult | null>(null)

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  const raw = page.options?.data || '[]'
  try {
    records.value = JSON.parse(decodeURIComponent(raw))
    if (records.value.length === 1) {
      current.value = records.value[0]
    }
  } catch {
    records.value = []
  }
})

function previewImages(urls: string[], index: number) {
  uni.previewImage({ urls, current: urls[index] })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F6FA;
  padding: 24rpx;
}
.selector-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.selector-tip {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 24rpx;
}
.selector-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.selector-name {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}
.selector-date {
  font-size: 26rpx;
  color: #999;
  margin-right: 12rpx;
}
.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.warranty-no {
  font-size: 26rpx;
  color: #999;
}
.image-section {
  margin-top: 32rpx;
}
.section-title {
  font-size: 28rpx;
  color: #666;
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
  border-radius: 8rpx;
}
.back-row {
  margin-top: 24rpx;
  display: flex;
  justify-content: center;
}
.empty {
  display: flex;
  justify-content: center;
  padding: 120rpx 0;
}
</style>

<template>
  <view class="container">
    <view v-if="loading" class="center"><u-loading-icon /></view>

    <view v-else>
      <!-- 统计卡片 -->
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-value">{{ data.total_records }}</text>
          <text class="stat-label">累计质保记录</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ data.monthly_count }}</text>
          <text class="stat-label">本月施工量</text>
        </view>
      </view>

      <!-- 施工趋势折线图 -->
      <view class="chart-card">
        <text class="chart-title">施工趋势（近6个月）</text>
        <view v-if="data.trend.length === 0" class="empty-tip">暂无数据</view>
        <qiun-data-charts
          v-else
          type="line"
          :opts="lineOpts"
          :chartData="lineData"
        />
      </view>

      <!-- 产品占比饼图 -->
      <view class="chart-card">
        <text class="chart-title">产品销量占比</text>
        <view v-if="data.product_distribution.length === 0" class="empty-tip">暂无数据</view>
        <qiun-data-charts
          v-else
          type="pie"
          :opts="pieOpts"
          :chartData="pieData"
        />
      </view>

      <!-- 到期预警 -->
      <view class="alert-card">
        <text class="chart-title">质保到期预警（30天内）</text>
        <view v-if="data.expiring_soon.length === 0" class="empty-tip">暂无即将到期记录 🎉</view>
        <view v-for="r in data.expiring_soon" :key="r._id" class="alert-item">
          <view class="alert-left">
            <text class="alert-name">{{ r.owner_name }} · {{ r.license_plate }}</text>
            <text class="alert-product">{{ r.product_brand }} {{ r.product_series }}</text>
          </view>
          <text class="alert-date">{{ r.warranty_expire }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin'
import type { DashboardData } from '@/types'

const store = useAdminStore()
const loading = ref(true)
const data = ref<DashboardData>({
  total_records: 0,
  monthly_count: 0,
  trend: [],
  product_distribution: [],
  expiring_soon: [],
  followup_reminders: [],
})

onMounted(async () => {
  store.restoreFromStorage()
  if (!store.isLoggedIn) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  try {
    const res = await wx.cloud.callFunction({ name: 'getDashboard' }) as any
    if (res.result.code === 200) {
      data.value = res.result.data
    } else {
      uni.showToast({ title: res.result.message || '加载失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
})

const lineData = computed(() => ({
  categories: data.value.trend.map(t => t.month.slice(5)),
  series: [{ name: '施工量', data: data.value.trend.map(t => t.count) }],
}))

const pieData = computed(() => ({
  series: [{
    data: data.value.product_distribution.map(p => ({ name: p.name, value: p.value })),
  }],
}))

const lineOpts = {
  color: ['#2B7EFF'],
  dataLabel: false,
  legend: { show: false },
  xAxis: { disableGrid: true },
  extra: { line: { type: 'curve' } },
}

const pieOpts = {
  legend: { show: true, position: 'bottom', lineHeight: 25 },
}
</script>

<style scoped>
.container { background: #F5F6FA; min-height: 100vh; padding: 24rpx; }
.stats-row { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.stat-card {
  flex: 1; background: #2B7EFF; border-radius: 16rpx;
  padding: 32rpx 24rpx; text-align: center;
}
.stat-value { font-size: 56rpx; font-weight: bold; color: #fff; display: block; }
.stat-label { font-size: 24rpx; color: rgba(255,255,255,.8); display: block; margin-top: 8rpx; }
.chart-card, .alert-card {
  background: #fff; border-radius: 16rpx;
  padding: 24rpx; margin-bottom: 24rpx;
}
.chart-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
.alert-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5;
}
.alert-item:last-child { border-bottom: none; }
.alert-name { font-size: 28rpx; color: #333; display: block; }
.alert-product { font-size: 24rpx; color: #999; display: block; margin-top: 4rpx; }
.alert-date { font-size: 26rpx; color: #FA8C16; white-space: nowrap; margin-left: 16rpx; }
.empty-tip { font-size: 26rpx; color: #999; text-align: center; padding: 32rpx 0; display: block; }
.center { display: flex; justify-content: center; padding: 80rpx 0; }
</style>

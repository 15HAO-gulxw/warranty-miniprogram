<template>
  <view class="container">
    <view class="search-bar">
      <u-search v-model="keyword" placeholder="搜索车牌/手机/质保卡号" @search="loadRecords" @clear="onClear" />
    </view>

    <view v-if="loading" class="center"><u-loading-icon /></view>
    <view v-else-if="records.length === 0" class="center">
      <u-empty text="暂无记录" />
    </view>
    <view v-else>
      <view v-for="r in records" :key="r._id" class="record-card" @tap="goDetail(r._id!)">
        <view class="card-header">
          <text class="name">{{ r.owner_name }} · {{ r.license_plate }}</text>
          <WarrantyStatusTag :status="getStatus(r.warranty_expire)" />
        </view>
        <text class="info">{{ r.product_brand }} {{ r.product_series }}</text>
        <text class="info">施工：{{ r.construction_date }} · 到期：{{ r.warranty_expire }}</text>
        <text class="info price">¥{{ r.total_price }}</text>
      </view>
    </view>

    <u-back-top :scroll-top="scrollTop" />
  </view>

  <view class="fab" @tap="goAdd">
    <u-icon name="plus" color="#fff" size="36" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin'
import { getWarrantyStatus } from '@/utils/date'
import WarrantyStatusTag from '@/components/WarrantyStatusTag/index.vue'
import type { WarrantyRecord } from '@/types'

const store = useAdminStore()
const records = ref<WarrantyRecord[]>([])
const loading = ref(false)
const keyword = ref('')
const scrollTop = ref(0)

onMounted(() => {
  store.restoreFromStorage()
  if (!store.isLoggedIn) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  loadRecords()
})

async function loadRecords() {
  loading.value = true
  try {
    const db = wx.cloud.database()
    const { data } = await db.collection('records').orderBy('created_at', 'desc').limit(50).get()
    records.value = data as WarrantyRecord[]
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onClear() {
  keyword.value = ''
  loadRecords()
}

function getStatus(expire: string) {
  return getWarrantyStatus(expire)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/admin-sub/record-detail/index?id=${id}` })
}

function goAdd() {
  uni.navigateTo({ url: '/pages/admin-sub/record-form/index' })
}
</script>

<style scoped>
.container { background: #F5F6FA; min-height: 100vh; padding: 24rpx; padding-bottom: 120rpx; }
.search-bar { margin-bottom: 24rpx; }
.record-card {
  background: #fff; border-radius: 16rpx; padding: 24rpx;
  margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,.04);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.name { font-size: 30rpx; font-weight: bold; color: #333; }
.info { font-size: 26rpx; color: #666; display: block; margin-top: 6rpx; }
.price { color: #2B7EFF; }
.center { display: flex; justify-content: center; padding: 80rpx 0; }
.fab {
  position: fixed; right: 40rpx; bottom: 100rpx;
  width: 96rpx; height: 96rpx; border-radius: 50%;
  background: #2B7EFF; display: flex;
  align-items: center; justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(43,126,255,.4);
}
</style>

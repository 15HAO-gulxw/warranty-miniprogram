<template>
  <view class="container">
    <view class="header">
      <text class="title">车衣车膜质保查询</text>
      <text class="subtitle">输入以下任意信息查询您的质保记录</text>
    </view>

    <view class="card">
      <u-tabs :list="tabs" :current="activeTab" @click="onTabClick" />

      <view class="search-area">
        <u-input
          v-model="queryValue"
          :placeholder="placeholder"
          :clearable="true"
          border="surround"
          @confirm="doQuery"
        />
        <u-button
          type="primary"
          text="查询"
          :loading="loading"
          @click="doQuery"
          customStyle="margin-top:24rpx;width:100%"
        />
      </view>
    </view>

    <view class="admin-link" @tap="goLogin">管理员登录</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QueryField } from '@/types'

const tabs = [
  { name: '手机号' },
  { name: '质保卡号' },
  { name: '车牌号' },
  { name: '车架号' },
]
const fieldMap: QueryField[] = ['owner_phone', 'warranty_no', 'license_plate', 'vin']
const placeholderMap = ['请输入车主手机号', '请输入质保卡号（如BM202605250001）', '请输入车牌号', '请输入17位车架号']

const activeTab = ref(0)
const queryValue = ref('')
const loading = ref(false)

const placeholder = computed(() => placeholderMap[activeTab.value])

function onTabClick(item: { index: number }) {
  activeTab.value = item.index
  queryValue.value = ''
}

async function doQuery() {
  const val = queryValue.value.trim()
  if (!val) {
    uni.showToast({ title: '请输入查询内容', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await wx.cloud.callFunction({
      name: 'queryRecord',
      data: { field: fieldMap[activeTab.value], value: val },
    }) as any
    const result = res.result
    if (result.code === 200) {
      uni.navigateTo({
        url: `/pages/query-result/index?data=${encodeURIComponent(JSON.stringify(result.data))}`,
      })
    } else {
      uni.showToast({ title: result.message || '未找到记录', icon: 'none', duration: 2000 })
    }
  } catch {
    uni.showToast({ title: '查询失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F6FA;
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
}
.header {
  text-align: center;
  margin-bottom: 48rpx;
}
.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}
.subtitle {
  font-size: 26rpx;
  color: #999;
  display: block;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.06);
}
.search-area {
  margin-top: 32rpx;
}
.admin-link {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  margin-top: auto;
  padding-top: 48rpx;
}
</style>

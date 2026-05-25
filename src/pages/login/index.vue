<template>
  <view class="container">
    <view class="header">
      <text class="title">管理员登录</text>
      <text class="subtitle">仅限授权人员使用</text>
    </view>
    <view class="card">
      <u-button type="primary" text="微信一键登录" :loading="loading" @click="doLogin" customStyle="width:100%" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/store/admin'

const store = useAdminStore()
const loading = ref(false)

async function doLogin() {
  loading.value = true
  try {
    const res = await wx.cloud.callFunction({ name: 'login' }) as any
    const result = res.result
    if (result.code === 200) {
      store.login(result.openid, result.name)
      uni.switchTab({ url: '/pages/admin/dashboard/index' })
    } else {
      uni.showModal({ title: '登录失败', content: result.message, showCancel: false })
    }
  } catch {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #F5F6FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 64rpx;
}
.header { text-align: center; margin-bottom: 64rpx; }
.title { font-size: 48rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
.subtitle { font-size: 28rpx; color: #999; display: block; }
.card { width: 100%; background: #fff; border-radius: 16rpx; padding: 40rpx; }
</style>

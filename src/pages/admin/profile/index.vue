<template>
  <view class="container">
    <!-- 用户信息卡 -->
    <view class="user-card">
      <u-avatar icon="account" size="80" bgColor="#fff" iconColor="#2B7EFF" />
      <view class="user-info">
        <text class="name">{{ store.name || '管理员' }}</text>
        <text class="role">门店管理员</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <u-cell-group margin="0">
      <u-cell title="添加管理员" icon="plus-circle" isLink @click="showAddAdmin = true" />
      <u-cell title="退出登录" icon="log-out" @click="logout" />
    </u-cell-group>

    <!-- 添加管理员弹窗 -->
    <u-popup v-model:show="showAddAdmin" mode="bottom" :round="16">
      <view class="popup-content">
        <text class="popup-title">添加管理员</text>
        <u-input
          v-model="newName"
          placeholder="管理员姓名"
          border="surround"
          customStyle="margin-bottom:16rpx"
        />
        <u-input
          v-model="newOpenid"
          placeholder="对方微信 openid"
          border="surround"
        />
        <text class="openid-tip">在微信开发者工具 Console 运行 wx.cloud.callFunction(&#123;name:'login'&#125;) 获取 openid</text>
        <u-button
          type="primary"
          text="确认添加"
          :loading="adding"
          @click="addAdmin"
          customStyle="margin-top:24rpx;width:100%"
        />
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin'

const store = useAdminStore()
const showAddAdmin = ref(false)
const newName = ref('')
const newOpenid = ref('')
const adding = ref(false)

onMounted(() => {
  store.restoreFromStorage()
  if (!store.isLoggedIn) {
    uni.redirectTo({ url: '/pages/login/index' })
  }
})

async function addAdmin() {
  if (!newName.value.trim() || !newOpenid.value.trim()) {
    uni.showToast({ title: '请填写姓名和 openid', icon: 'none' })
    return
  }
  adding.value = true
  try {
    const res = await wx.cloud.callFunction({
      name: 'addAdmin',
      data: { targetOpenid: newOpenid.value.trim(), name: newName.value.trim() },
    }) as any
    if (res.result.code === 200) {
      uni.showToast({ title: '添加成功' })
      showAddAdmin.value = false
      newName.value = ''
      newOpenid.value = ''
    } else {
      uni.showToast({ title: res.result.message || '添加失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    adding.value = false
  }
}

function logout() {
  uni.showModal({
    title: '确认退出',
    content: '退出后需重新登录',
    success: ({ confirm }) => {
      if (confirm) {
        store.logout()
        uni.reLaunch({ url: '/pages/index/index' })
      }
    },
  })
}
</script>

<style scoped>
.container { background: #F5F6FA; min-height: 100vh; padding: 24rpx; }
.user-card {
  background: #2B7EFF; border-radius: 16rpx;
  padding: 40rpx 32rpx; display: flex;
  align-items: center; gap: 24rpx; margin-bottom: 24rpx;
}
.name { font-size: 36rpx; font-weight: bold; color: #fff; display: block; }
.role { font-size: 26rpx; color: rgba(255,255,255,.8); display: block; margin-top: 6rpx; }
.popup-content { padding: 48rpx 32rpx 64rpx; }
.popup-title { font-size: 32rpx; font-weight: bold; color: #333; display: block; margin-bottom: 32rpx; }
.openid-tip { font-size: 22rpx; color: #999; display: block; margin-top: 12rpx; line-height: 1.6; }
</style>

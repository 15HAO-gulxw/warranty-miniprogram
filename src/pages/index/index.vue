<template>
  <view class="page">
    <!-- 沉浸式 Banner -->
    <view class="banner">
      <image class="banner-img" src="/static/banner.jpg" mode="aspectFill" />
      <view class="banner-overlay" />
      <view class="banner-text">
        <text class="brand-sub">PREMIUM CAR FILM &amp; WRAP</text>
        <text class="brand-title">专业级保护，极致质感</text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="actions">
      <view class="action-card" @tap="goWarrantyEntry">
        <view class="card-left">
          <view class="card-icon-wrap">
            <u-icon name="checkmark-circle-fill" size="52" color="#C9A84C" />
          </view>
          <view class="card-info">
            <text class="card-title">质保录入</text>
            <text class="card-desc">管理员专属 · 微信一键登录</text>
          </view>
        </view>
        <u-icon name="arrow-right" size="32" color="#C9A84C" />
      </view>

      <view class="action-card" @tap="goWarrantyQuery">
        <view class="card-left">
          <view class="card-icon-wrap">
            <u-icon name="search" size="52" color="#C9A84C" />
          </view>
          <view class="card-info">
            <text class="card-title">质保查询</text>
            <text class="card-desc">车主免登录 · 多字段查询</text>
          </view>
        </view>
        <u-icon name="arrow-right" size="32" color="#C9A84C" />
      </view>
    </view>

    <!-- 管理员登录弹窗 -->
    <u-popup
      v-model:show="showLogin"
      mode="bottom"
      round
      :closeOnClickOverlay="true"
      customStyle="background: #112240;"
    >
      <view class="login-popup">
        <view class="popup-header">
          <text class="popup-title">管理员身份验证</text>
          <text class="popup-subtitle">仅授权账号可使用质保录入功能</text>
        </view>
        <u-button
          type="primary"
          text="微信一键登录"
          :loading="logging"
          customStyle="background:linear-gradient(135deg,#C9A84C,#E8D5A3);border:none;color:#0A1628;font-weight:bold;border-radius:16rpx;height:96rpx;"
          @click="doLogin"
        />
        <text class="cancel-btn" @tap="showLogin = false">取消</text>
      </view>
    </u-popup>
  </view>

  <AppTabBar :current="0" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAdminStore } from '@/store/admin'
import AppTabBar from '@/components/AppTabBar/index.vue'

onShow(() => { uni.hideTabBar({ animation: false }) })

const store = useAdminStore()
const showLogin = ref(false)
const logging = ref(false)

function goWarrantyEntry() {
  store.restoreFromStorage()
  if (store.isLoggedIn) {
    uni.navigateTo({ url: '/pages/admin-sub/record-form/index' })
  } else {
    showLogin.value = true
  }
}

function goWarrantyQuery() {
  uni.navigateTo({ url: '/pages/query-result/index' })
}

async function doLogin() {
  logging.value = true
  try {
    const res = await wx.cloud.callFunction({ name: 'login' }) as any
    if (res.result.code === 200) {
      store.login(res.result.openid, res.result.name)
      showLogin.value = false
      uni.navigateTo({ url: '/pages/admin-sub/record-form/index' })
    } else {
      uni.showModal({
        title: '无访问权限',
        content: '您的账号未授权，请联系管理员',
        showCancel: false,
      })
    }
  } catch {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    logging.value = false
  }
}
</script>

<style scoped>
.page {
  background: #0A1628;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* Banner */
.banner {
  position: relative;
  height: 520rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #0A1628 0%, #1A2D50 60%, #0A1628 100%);
}
.banner-img { width: 100%; height: 100%; }
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.88) 100%);
}
.banner-text {
  position: absolute;
  bottom: 56rpx;
  left: 40rpx;
  right: 40rpx;
}
.brand-sub {
  display: block;
  font-size: 22rpx;
  letter-spacing: 5rpx;
  color: #C9A84C;
  margin-bottom: 16rpx;
}
.brand-title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1.25;
}

/* Action Cards */
.actions {
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.action-card {
  background: linear-gradient(135deg, #13243d 0%, #0f1d31 100%);
  border: 1rpx solid rgba(201, 168, 76, 0.28);
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.4), inset 0 1rpx 0 rgba(201, 168, 76, 0.15);
}
.card-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.card-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.18), rgba(201, 168, 76, 0.06));
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}
.card-desc {
  display: block;
  font-size: 24rpx;
  color: #8899AA;
}

/* Login Popup */
.login-popup { padding: 48rpx 40rpx 80rpx; }
.popup-header { margin-bottom: 48rpx; }
.popup-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}
.popup-subtitle {
  display: block;
  font-size: 26rpx;
  color: #8899AA;
}
.cancel-btn {
  display: block;
  text-align: center;
  color: #8899AA;
  font-size: 28rpx;
  margin-top: 36rpx;
}
</style>

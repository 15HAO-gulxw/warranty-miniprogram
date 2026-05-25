<template>
  <view class="page">
    <!-- 品牌区 -->
    <view class="brand-section">
      <image class="brand-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="brand-name">品牌名称</text>
      <text class="brand-slogan">专注高端车衣车膜 · 品质有保障</text>
    </view>

    <!-- 联系信息 -->
    <view class="info-card">
      <view class="info-item" v-for="item in infos" :key="item.label">
        <view class="info-icon-wrap">
          <u-icon :name="item.icon" size="36" color="#C9A84C" />
        </view>
        <view class="info-text">
          <text class="info-label">{{ item.label }}</text>
          <text class="info-value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <!-- 品牌简介 -->
    <view class="intro-card">
      <text class="intro-title">关于我们</text>
      <text class="intro-body">
        我们专注于高端汽车漆面保护与个性改装，代理国际顶尖品牌，拥有资深施工团队。每一道工序精益求精，每一张质保卡背后都是我们对品质的承诺。
      </text>
    </view>

    <!-- 咨询按钮 -->
    <view class="call-btn" @tap="callUs">
      <u-icon name="phone" size="40" color="#0A1628" />
      <text class="call-text">立即致电咨询</text>
    </view>
  </view>

  <AppTabBar :current="2" />
</template>

<script setup lang="ts">
import AppTabBar from '@/components/AppTabBar/index.vue'
const infos = [
  { icon: 'map-pin', label: '门店地址', value: '请填写门店地址' },
  { icon: 'clock',   label: '营业时间', value: '09:00 – 20:00（全年无休）' },
  { icon: 'phone',   label: '联系电话', value: '请填写联系电话' },
]

function callUs() {
  uni.makePhoneCall({ phoneNumber: '请填写电话号码' })
}
</script>

<style scoped>
.page {
  background: #0A1628;
  min-height: 100vh;
  padding: 0 32rpx 160rpx;
}

/* Brand Section */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 56rpx;
}
.brand-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  margin-bottom: 28rpx;
  background: #112240;
}
.brand-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}
.brand-slogan {
  font-size: 26rpx;
  color: #C9A84C;
  letter-spacing: 2rpx;
}

/* Info Card */
.info-card {
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
  margin-bottom: 24rpx;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 0;
  border-bottom: 1rpx solid rgba(255,255,255,0.06);
}
.info-item:last-child { border-bottom: none; }
.info-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 14rpx;
  background: rgba(201, 168, 76, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info-label {
  display: block;
  font-size: 24rpx;
  color: #8899AA;
  margin-bottom: 6rpx;
}
.info-value {
  display: block;
  font-size: 28rpx;
  color: #FFFFFF;
}

/* Intro Card */
.intro-card {
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 40rpx;
}
.intro-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #C9A84C;
  margin-bottom: 20rpx;
}
.intro-body {
  display: block;
  font-size: 26rpx;
  color: #B0BFCC;
  line-height: 1.8;
}

/* Call Button */
.call-btn {
  background: linear-gradient(135deg, #C9A84C, #E8D5A3);
  border-radius: 20rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}
.call-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #0A1628;
}
</style>

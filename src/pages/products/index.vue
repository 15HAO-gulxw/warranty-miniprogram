<template>
  <view class="page">
    <view class="page-header">
      <text class="page-title">产品中心</text>
      <text class="page-sub">顶尖品牌 · 专业施工</text>
    </view>

    <view class="product-list">
      <view v-for="p in products" :key="p.title" class="product-card">
        <view class="prod-icon-wrap">
          <u-icon :name="p.icon" size="56" color="#C9A84C" />
        </view>
        <view class="prod-info">
          <text class="prod-title">{{ p.title }}</text>
          <text class="prod-badge">{{ p.badge }}</text>
          <text class="prod-desc">{{ p.desc }}</text>
        </view>
      </view>
    </view>

    <view class="cta-section">
      <text class="cta-label">想了解更多产品详情？</text>
      <view class="cta-btn" @tap="goAbout">
        <text class="cta-text">联系我们</text>
      </view>
    </view>
  </view>

  <AppTabBar :current="1" />
</template>

<script setup lang="ts">
import AppTabBar from '@/components/AppTabBar/index.vue'
const products = [
  {
    title: '漆面保护膜 PPF',
    badge: '热销推荐',
    icon: 'shield',
    desc: '军工级抗冲击材料，自修复技术，抵御石击、划痕与酸性污染，让漆面历久如新。',
  },
  {
    title: '汽车改色膜',
    badge: '个性定制',
    icon: 'palette',
    desc: '进口哑光/光面膜料，色彩多样，整车改色或局部点缀，施工可逆无损原厂漆面。',
  },
  {
    title: '车窗隔热膜',
    badge: '节能舒适',
    icon: 'sun',
    desc: '高透光、高隔热，阻隔 99% 紫外线，大幅降低车内温度，保护乘员与内饰。',
  },
]

function goAbout() {
  uni.switchTab({ url: '/pages/about/index' })
}
</script>

<style scoped>
.page {
  background: #0A1628;
  min-height: 100vh;
  padding: 0 32rpx 160rpx;
}

.page-header {
  padding: 60rpx 0 48rpx;
}
.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
}
.page-sub {
  display: block;
  font-size: 26rpx;
  color: #C9A84C;
  margin-top: 12rpx;
  letter-spacing: 3rpx;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.product-card {
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: flex-start;
  gap: 28rpx;
}

.prod-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: rgba(201, 168, 76, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prod-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}
.prod-badge {
  display: inline-block;
  font-size: 20rpx;
  color: #C9A84C;
  border: 1rpx solid rgba(201, 168, 76, 0.5);
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  margin-bottom: 16rpx;
}
.prod-desc {
  display: block;
  font-size: 26rpx;
  color: #8899AA;
  line-height: 1.6;
}

.cta-section {
  margin-top: 48rpx;
  background: #112240;
  border: 1rpx solid rgba(201, 168, 76, 0.25);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cta-label {
  font-size: 28rpx;
  color: #B0BFCC;
}
.cta-btn {
  background: linear-gradient(135deg, #C9A84C, #E8D5A3);
  border-radius: 12rpx;
  padding: 16rpx 36rpx;
}
.cta-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #0A1628;
}
</style>

<template>
  <view class="tabbar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      @tap="switchTab(index)"
    >
      <u-icon :name="item.icon" :size="44" :color="current === index ? '#C9A84C' : '#606880'" />
      <text class="tab-label" :class="{ 'active-label': current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ current: number }>()

const tabs = [
  { text: '质保',    icon: 'shield-checkmark', path: '/pages/index/index' },
  { text: '产品',    icon: 'star',             path: '/pages/products/index' },
  { text: '关于我们', icon: 'info-circle',      path: '/pages/about/index' },
]

function switchTab(index: number) {
  uni.switchTab({ url: tabs[index].path })
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #0A1628;
  border-top: 1rpx solid rgba(201, 168, 76, 0.2);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}
.tab-label {
  font-size: 20rpx;
  color: #606880;
}
.active-label {
  color: #C9A84C;
}
</style>

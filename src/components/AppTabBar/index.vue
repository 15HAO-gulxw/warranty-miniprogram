<template>
  <view class="tabbar">
    <view class="top-line" />
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      @tap="switchTab(index)"
    >
      <view class="icon-wrap" :class="{ 'icon-active': current === index }">
        <u-icon
          :name="item.icon"
          :size="46"
          :color="current === index ? '#C9A84C' : '#505E72'"
        />
      </view>
      <text class="tab-label" :class="{ 'label-active': current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ current: number }>()

const tabs = [
  { text: '质保',    icon: 'shield-checkmark', path: '/pages/index/index' },
  { text: '产品',    icon: 'star',             path: '/pages/products/index' },
  { text: '关于我们', icon: 'account',          path: '/pages/about/index' },
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
  height: 110rpx;
  background: linear-gradient(180deg, #0d1a2e 0%, #0A1628 100%);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
  overflow: visible;
}
.top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1rpx;
  background: linear-gradient(90deg, transparent 0%, rgba(201, 168, 76, 0.7) 50%, transparent 100%);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}
.icon-wrap {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  transition: background 0.2s;
}
.icon-active {
  background: rgba(201, 168, 76, 0.14);
}
.tab-label {
  font-size: 20rpx;
  color: #505E72;
}
.label-active {
  color: #C9A84C;
  font-weight: bold;
}
</style>

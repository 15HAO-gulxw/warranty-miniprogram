<template>
  <view class="uploader">
    <view class="image-list">
      <view v-for="(url, i) in modelValue" :key="i" class="image-item">
        <image :src="url" mode="aspectFill" @tap="preview(i)" />
        <view class="delete-btn" @tap="remove(i)">×</view>
      </view>
      <view v-if="modelValue.length < max" class="add-btn" @tap="choose">
        <u-icon name="plus" size="40" color="#999" />
        <text>{{ modelValue.length }}/{{ max }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  maxCount?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const max = props.maxCount ?? 9

async function choose() {
  const res = await uni.chooseImage({
    count: max - props.modelValue.length,
    sizeType: ['compressed'],
  })
  const urls = [...props.modelValue]
  for (const path of res.tempFilePaths) {
    uni.showLoading({ title: '上传中...' })
    try {
      const cloudPath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: path })
      urls.push(uploadRes.fileID)
    } catch {
      uni.showToast({ title: '上传失败，请重试', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }
  emit('update:modelValue', urls)
}

function remove(index: number) {
  const urls = [...props.modelValue]
  urls.splice(index, 1)
  emit('update:modelValue', urls)
}

function preview(index: number) {
  uni.previewImage({ urls: props.modelValue, current: props.modelValue[index] })
}
</script>

<style scoped>
.image-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.image-item { position: relative; width: 200rpx; height: 200rpx; }
.image-item image { width: 100%; height: 100%; border-radius: 8rpx; }
.delete-btn {
  position: absolute; top: -16rpx; right: -16rpx;
  width: 40rpx; height: 40rpx;
  background: rgba(0,0,0,.5); color: #fff;
  border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  font-size: 28rpx;
}
.add-btn {
  width: 200rpx; height: 200rpx;
  border: 2rpx dashed #ddd; border-radius: 8rpx;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #999; font-size: 24rpx;
}
</style>

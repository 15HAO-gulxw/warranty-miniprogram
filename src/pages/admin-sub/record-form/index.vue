<template>
  <view class="container">
    <u-steps :list="steps" :current="step" />

    <!-- Step 0: 车主 & 车辆信息 -->
    <view v-if="step === 0" class="form-section">
      <u-form :model="form">
        <u-form-item label="车主姓名" required labelWidth="180rpx">
          <u-input v-model="form.owner_name" placeholder="请输入车主姓名" border="none" />
        </u-form-item>
        <u-form-item label="手机号" required labelWidth="180rpx">
          <u-input v-model="form.owner_phone" type="number" placeholder="请输入手机号" border="none" />
        </u-form-item>
        <u-form-item label="车牌号" required labelWidth="180rpx">
          <u-input v-model="form.license_plate" placeholder="如：粤A12345" border="none" />
        </u-form-item>
        <u-form-item label="车架号(VIN)" labelWidth="180rpx">
          <u-input v-model="form.vin" placeholder="17位车架号" border="none" />
        </u-form-item>
        <u-form-item label="车型" labelWidth="180rpx">
          <u-input v-model="form.car_model" placeholder="如：宝马3系" border="none" />
        </u-form-item>
        <u-form-item label="车辆颜色" labelWidth="180rpx">
          <u-input v-model="form.car_color" placeholder="如：珍珠白" border="none" />
        </u-form-item>
      </u-form>
    </view>

    <!-- Step 1: 产品 & 施工信息 -->
    <view v-if="step === 1" class="form-section">
      <u-form :model="form">
        <u-form-item label="产品品牌" required labelWidth="180rpx">
          <u-input v-model="form.product_brand" placeholder="如：龙膜" border="none" />
        </u-form-item>
        <u-form-item label="产品系列" labelWidth="180rpx">
          <u-input v-model="form.product_series" placeholder="如：至尊系列" border="none" />
        </u-form-item>
        <u-form-item label="产品型号" labelWidth="180rpx">
          <u-input v-model="form.product_model" placeholder="如：SR PRO" border="none" />
        </u-form-item>
        <u-form-item label="施工部位" labelWidth="180rpx">
          <u-input v-model="partsInput" placeholder="多个部位用逗号分隔" border="none" />
        </u-form-item>
        <u-form-item label="施工日期" required labelWidth="180rpx">
          <u-datetime-picker
            v-model="form.construction_date"
            mode="date"
            :show="showDatePicker"
            @confirm="onDateConfirm"
          />
          <u-input
            :value="form.construction_date"
            placeholder="请选择施工日期"
            border="none"
            readonly
            @click="showDatePicker = true"
          />
        </u-form-item>
        <u-form-item label="交车时间" labelWidth="180rpx">
          <u-input v-model="form.delivery_date" placeholder="如：2026-05-25" border="none" />
        </u-form-item>
        <u-form-item label="质保年限" required labelWidth="180rpx">
          <u-number-box v-model="form.warranty_years" :min="1" :max="10" />
        </u-form-item>
        <u-form-item label="施工师傅" labelWidth="180rpx">
          <u-input v-model="form.technician" placeholder="师傅姓名" border="none" />
        </u-form-item>
        <u-form-item label="施工总价(元)" labelWidth="180rpx">
          <u-input v-model="form.total_price" type="digit" placeholder="0.00" border="none" />
        </u-form-item>
      </u-form>
    </view>

    <!-- Step 2: 图片上传 -->
    <view v-if="step === 2" class="form-section">
      <view class="upload-group">
        <text class="group-label">产品图片（最多9张）</text>
        <ImageUploader v-model="form.product_images" :maxCount="9" />
      </view>
      <view class="upload-group">
        <text class="group-label">施工图片（最多9张）</text>
        <ImageUploader v-model="form.construction_images" :maxCount="9" />
      </view>
    </view>

    <view class="btn-row">
      <u-button v-if="step > 0" text="上一步" @click="step--" customStyle="flex:1" />
      <view v-if="step > 0" style="width:16rpx" />
      <u-button v-if="step < 2" type="primary" text="下一步" @click="nextStep" customStyle="flex:1" />
      <u-button v-if="step === 2" type="primary" text="提交" :loading="submitting" @click="submit" customStyle="flex:1" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ImageUploader from '@/components/ImageUploader/index.vue'

const step = ref(0)
const submitting = ref(false)
const showDatePicker = ref(false)
const partsInput = ref('')
const steps = [{ title: '基本信息' }, { title: '施工信息' }, { title: '图片上传' }]

const form = reactive({
  owner_name: '',
  owner_phone: '',
  license_plate: '',
  vin: '',
  car_model: '',
  car_color: '',
  product_brand: '',
  product_series: '',
  product_model: '',
  construction_parts: [] as string[],
  construction_date: '',
  delivery_date: '',
  warranty_years: 3,
  technician: '',
  total_price: 0,
  product_images: [] as string[],
  construction_images: [] as string[],
})

function onDateConfirm(e: any) {
  form.construction_date = e.value
  showDatePicker.value = false
}

function nextStep() {
  if (step.value === 0) {
    if (!form.owner_name || !form.owner_phone || !form.license_plate) {
      uni.showToast({ title: '请填写必填项（姓名/手机号/车牌号）', icon: 'none' })
      return
    }
  }
  if (step.value === 1) {
    if (!form.product_brand || !form.construction_date) {
      uni.showToast({ title: '请填写必填项（产品品牌/施工日期）', icon: 'none' })
      return
    }
  }
  step.value++
}

async function submit() {
  form.construction_parts = partsInput.value
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)
  submitting.value = true
  try {
    const res = await wx.cloud.callFunction({
      name: 'addRecord',
      data: { record: { ...form } },
    }) as any
    if (res.result.code === 200) {
      uni.showToast({ title: '录入成功' })
      setTimeout(() => uni.navigateBack(), 1500)
    } else {
      uni.showToast({ title: res.result.message || '录入失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.container { background: #F5F6FA; min-height: 100vh; padding: 24rpx; padding-bottom: 40rpx; }
.form-section { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-top: 24rpx; }
.upload-group { margin-bottom: 32rpx; }
.group-label { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; font-weight: bold; }
.btn-row { display: flex; margin-top: 32rpx; }
</style>

<template>
  <u-tag :text="label" :type="tagType" size="mini" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WarrantyStatus } from '@/types'

const props = defineProps<{ status: WarrantyStatus }>()

const label = computed(() => {
  const map: Record<WarrantyStatus, string> = {
    valid: '质保有效',
    expiring: '即将到期',
    expired: '已过期',
  }
  return map[props.status]
})

const tagType = computed(() => {
  const map: Record<WarrantyStatus, string> = {
    valid: 'success',
    expiring: 'warning',
    expired: 'error',
  }
  return map[props.status]
})
</script>

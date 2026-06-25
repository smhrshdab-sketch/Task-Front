<template>
  <div class="flex items-center">
    <div class="flex w-full bg-white rounded shadow">
      <Input class="relative px-6 py-3 w-full rounded-r focus:shadow-outline" autocomplete="off" type="text" name="search" placeholder="جستجو..." :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
    </div>
  </div>
</template>

<script>
import Input from '@/Components/Input.vue'

export default {
    components: {
        Input
    },
    props: {
        modelValue: String,
        maxWidth: {
            type: Number,
            default: 300,
        },
    },
    emits: ['update:modelValue', 'reset'],
}
</script>

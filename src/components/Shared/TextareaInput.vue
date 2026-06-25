<template>
  <div :class="$attrs.class">
    <textarea
        ref="input"
        :rows="$attrs.class"
        v-bind="{ ...$attrs, class: null }"
        class="form-textarea"
        :class="[
            'w-full py-2 border-gray-400 rounded-md',
            'focus:border-gray-400 focus:ring focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
            'dark:border-gray-600 dark:bg-dark-eval-1 dark:text-gray-300 dark:focus:ring-offset-dark-eval-1'
        ]"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)" />
    <div v-if="error" class="form-error">{{ error }}</div>
  </div>
</template>

<script>

export default {
  inheritAttrs: false,
  props: {
    error: String,
    modelValue: String,
  },
  emits: ['update:modelValue'],
  methods: {
    focus() {
      this.$refs.input.focus()
    },
    select() {
      this.$refs.input.select()
    },
  },
}
</script>

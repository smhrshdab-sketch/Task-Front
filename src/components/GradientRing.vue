<template>
  <div class="relative inline-block">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color1" />
          <stop offset="100%" :stop-color="color2" />
        </linearGradient>
      </defs>
      
      <!-- Ring -->
      <circle
        :cx="center"
        :cy="center"
        :r="midRadius"
        fill="transparent"
        stroke="url(#gradient)"
        :stroke-width="thickness"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(${startAngle} ${center} ${center})`"
        stroke-linecap="round"
      />
      
      <!-- Main Label (Percentage) -->
      <text
        :x="center"
        :y="center - (subLabel ? 12 : 0)"
        text-anchor="middle"
        dominant-baseline="central"
        :style="mainLabelStyle"
      >
        {{ mainLabel }}
      </text>
      
      <!-- Sub Label (optional) -->
      <text
        v-if="subLabel"
        :x="center"
        :y="center + (labelFontSize / 2) + 8"
        text-anchor="middle"
        dominant-baseline="central"
        :style="subLabelStyle"
      >
        {{ subLabel }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Existing props
  center: { type: Number, default: 100 },
  outerRadius: { type: Number, default: 80 },
  innerRadius: { type: Number, default: 60 },
  color1: { type: String, default: '#3B82F6' },
  color2: { type: String, default: '#8B5CF6' },
  angle: { type: Number, default: 360, validator: v => v >= 0 && v <= 360 },
  direction: { type: String, default: 'cw', validator: v => ['cw', 'ccw'].includes(v) },
  startAngle: { type: Number, default: -90 },
  size: { type: Number, default: 200 },
  
  // Label props
  label: { type: String, default: '' },
  percentage: { type: Number, default: 0 },
  labelFontSize: { type: Number, default: 28 },
  labelColor: { type: String, default: '#1F2937' },
  labelFontWeight: { type: String, default: 'bold' },
  subLabel: { type: String, default: '' },
  subLabelFontSize: { type: Number, default: 14 },
  subLabelColor: { type: String, default: '#6B7280' },
  labelFormat: { 
    type: String, 
    default: 'percentage', // 'percentage', 'value', or 'custom'
    validator: v => ['percentage', 'value', 'custom'].includes(v)
  },
  customLabel: { type: String, default: '' }
})

// Computed
const thickness = computed(() => props.outerRadius - props.innerRadius)
const midRadius = computed(() => (props.outerRadius + props.innerRadius) / 2)
const circumference = computed(() => 2 * Math.PI * midRadius.value)

const dashArray = computed(() => `${circumference.value} ${circumference.value}`)

const dashOffset = computed(() => {
  const visibleLength = (props.angle / 360) * circumference.value
  return props.direction === 'cw' 
    ? circumference.value - visibleLength
    : visibleLength
})

// Label computations
const mainLabel = computed(() => {
  if (props.labelFormat === 'percentage') {
    return `${Math.round(props.percentage)}%`
  } else if (props.labelFormat === 'value') {
    return props.label || `${Math.round(props.percentage)}%`
  } else if (props.labelFormat === 'custom') {
    return props.customLabel
  }
  return props.label || `${Math.round(props.percentage)}%`
})

const mainLabelStyle = computed(() => ({
  fontSize: `${props.labelFontSize}px`,
  fill: props.labelColor,
  fontWeight: props.labelFontWeight,
  fontFamily: 'system-ui, -apple-system, sans-serif'
}))

const subLabelStyle = computed(() => ({
  fontSize: `${props.subLabelFontSize}px`,
  fill: props.subLabelColor,
  fontFamily: 'system-ui, -apple-system, sans-serif'
}))
</script>
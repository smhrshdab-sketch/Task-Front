<template>
  <div :class="props.class"  >
    <Label v-if="props.caption != null" :labelFor="props.labelFor" :value="props.caption" class="mb-2"/>
    <v-select
        dir="rtl"
        class="style-chooser"
        :label="props.field"
        :options="props.options"
        :v-model="props.modelValue"
        @input="handleChange"
    >
        <template #no-options="{ search, searching, loading }">
            هیچ گزینه‌ای یافت نشد!
        </template>
    </v-select>
    <div v-if="error" class="form-error">{{ error }}</div>
  </div>


</template>

<script>
    import { ref , reactive } from "vue";
    import Label from '@/Components/Label.vue'
    import vSelect from 'vue-select'
    import 'vue-select/dist/vue-select.css'


    export default {
        components: {
            vSelect,
            Label
        },
        inheritAttrs: false,
        props: {
            options : Object,
            class: [String],
            caption   : {
                type : String,
                default : ''
            },
            field   : {
                type : String,
                default : 'title'
            },
            labelFor : {
                type : String,
                default : '0'
            },
            error: String,
            modelValue: [String, Number, Boolean],
        },
        emits: ['update:modelValue'],
        setup(props)
        {
            return { props }
        },
        data() {
            return {
                selected: this.modelValue,
            }
        },
        watch: {
            selected(selected) {
                // console.log(selected);
                this.$emit('update:modelValue', selected)
            },
        },
        methods: {
            handleChange (event) {
              this.$emit("option:selected", event);
              this.$emit("update:modelValue", event);
            }
        },
    }
</script>


<style>
.style-chooser:focus{
    border-color: rgb(156 163 175);
    --tw-ring-color: rgb(168 85 247);
    box-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    --tw-ring-offset-width: 2px;
    /* box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow);
    --tw-ring-offset-color: #fff;
    box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-shadow); */
}

.style-chooser .vs__dropdown-toggle{
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
}

.style-chooser .vs__search::placeholder,
.style-chooser .vs__dropdown-toggle,
.style-chooser .vs__dropdown-menu {
    --tw-border-opacity: 1;
    border-color: rgb(156 163 175 / var(--tw-border-opacity));
    font-size: 1rem;
    line-height: 1.5rem;

}

.dark .style-chooser .vs__search::placeholder,
.dark .style-chooser .vs__dropdown-toggle,
.dark .style-chooser .vs__dropdown-menu {
    --tw-border-opacity: 1;
    border-color: rgb(156 163 175 / var(--tw-border-opacity));
    --tw-text-opacity: 1;
    color: rgb(209 213 219 / var(--tw-text-opacity));
    font-size: 1rem;
    line-height: 1.5rem;
}

.style-chooser .vs__clear,
.style-chooser .vs__open-indicator {
  margin-left: 0.5rem;
}

.dark .style-chooser .vs__clear,
.dark .style-chooser .vs__open-indicator {
  margin-left: 0.5rem;
  fill : rgba(255, 255, 255, 1);
}

.dark .style-chooser .vs__selected{
    color : rgba(255, 255, 255, 1);
}

.dark .style-chooser .vs__dropdown-menu {
    color: rgb(255 255 255 / var(--tw-text-opacity));
    background-color: rgb(21 24 35 / var(--tw-bg-opacity));
}

</style>

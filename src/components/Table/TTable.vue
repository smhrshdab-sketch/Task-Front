<template>
    <component :is="Tag">
        <div class="ttable content-center justify-center overflow-hidden ">
        <div class="flex justify-between items-center mb-4 border-b py-2 sm:px-2" v-if="(title != null || createRoute != null || searchRoute != null)">
          <div class="flex flex-row content-center justify-center items-center"  v-if="title != null">
                <h5 class="text-abrash-blue dark:text-white font-bold text-sm sm:text-base">{{ title }}</h5>
          </div>

          <div class="flex flex-row gap-1" v-if="(createRoute != null || searchRoute != null || dragOrderRoute != null)">

              <t-tooltip v-if="dragOrderRoute != null" position="bottom" :border="false">
                    <button type="button"
                        @click="toggleOrderMode"
                        :class="[
                                    {
                                        'hover:bg-abrash-blue :dark:hover:bg-abrash-red hover:text-white inline-flex items-center justify-center rounded-lg border h-full w-10 transition duration-500 ease-in-out focus:outline-none' : !orderShow ,
                                        'bg-abrash-blue :dark:bg-abrash-red text-white inline-flex items-center justify-center rounded-lg border h-full w-10 transition duration-500 ease-in-out focus:outline-none' : orderShow ,
                                    }
                                ]"
                        >
                        <ArrowsUpDownIcon class="w-6 h-6 hover:animate-pulse" />
                    </button>
                    <template v-if="orderShow" #boxContent> خروج از حالت تغییر چینش </template>
                    <template v-else #boxContent> تغییر چینش آیتم ها</template>
                </t-tooltip>

                <t-tooltip v-if="searchRoute != null" position="bottom" :border="false">
                    <button type="button"
                        @click="toggleSearchInput"
                        :class="[
                                    {
                                        'hover:bg-abrash-blue :dark:hover:bg-abrash-red hover:text-white inline-flex items-center justify-center rounded-lg border h-full w-10 transition duration-500 ease-in-out focus:outline-none' : !searchShow ,
                                        'bg-abrash-blue :dark:bg-abrash-red text-white inline-flex items-center justify-center rounded-lg border h-full w-10 transition duration-500 ease-in-out focus:outline-none' : searchShow ,
                                    }
                                ]"
                        >
                        <MagnifyingGlassIcon class="w-5 h-5"/>
                    </button>
                    <template v-if="searchShow" #boxContent> حذف کادر جستجو </template>
                    <template v-else #boxContent> نمایش کادر جستجو </template>
                </t-tooltip>


                <Button v-if="createRoute != null"
                    variant="primary"
                    class="py-1 h-10 btn-indigo items-center gap-2 w-full sm:w-min sm:mt-0 text-sm !px-2"
                    v-slot="{ iconSizeClasses }"
                    :href="createRoute">
                        <span class="hidden sm:block"> جدید </span>
                        <PlusIcon aria-hidden="true" class="w-3 h-3" :class="iconSizeClasses" />
                </Button>

                <slot name="headerItems" />

          </div>

          <slot />
        </div>

        <Transition>
            <div class="block sm:flex items-center justify-between mb-6 mx-2" v-if="(searchRoute != null && searchShow)">
                <search-filter v-model="form.search" :searchLable="searchLable" class="w-full" @reset="reset" />
            </div>
        </Transition>

        <div class="rounded-md overflow-x-auto">
        <table class="w-full whitespace-nowrap" v-if="enable">
          <thead>
            <tr class="text-left rtl:text-right font-bold">
              <th  v-for="th in headers" :key="th" class="py-2 px-2 text-sm">{{ th }}</th>
            </tr>
          </thead>

          <tbody>

          <draggable v-if="orderShow" :list="theContents.data" tag="tbody" item-key="id" @change="handleOrderChange()">
                  <template #item="{ element }">
                      <tr class="table-tr hover:bg-gray-100 dark:hover:bg-gray-900 focus-within:bg-gray-100 cursor-move">
                          <template v-for="value in element" :key="value">
                              <td v-if="value.show == true" class="border-t items-center px-2 py-2" scope="row">
                                  <span v-if="value.type == 'text'" :class="[value.class]">{{ value.data }}</span>
                                  <span v-else>...</span>
                              </td>
                          </template>
                      </tr>
                  </template>
          </draggable>

            <tr v-else v-for="(item , index) in contents.data"
                :key="item.id.data"
                class="cursor-pointer"
                :class="index % 2 == 0 ?
                    'table-tr hover:bg-gray-100 dark:hover:bg-gray-900 focus-within:bg-gray-100'
                    : 'table-tr bg-gray-200 hover:bg-gray-300 focus-within:bg-gray-200  dark:bg-gray-950 dark:hover:bg-gray-900'"
            >
                <template v-for="value in item" :key="value">
                    <td
                      v-if="value.show == true"
                      class="border-t items-center px-2 py-2 text-sm"
                      @click="(value.type != 'switch' && value.type != 'file') ? gotoLink(item?.link?.data) : null"
                    >
                        <Link v-if="value.type == 'link'"
                            :class="[ 'flex items-center px-4' , value.class ]" :href="value.data" tabindex="-1">
                            <ChevronLeftIcon class="hover:animate-ping block w-5 h-5" />
                        </Link>
                        <template v-else-if="value.type == 'avatar'">
                              <img v-if="value.data != null" :src="value.data"
                                    :class="[ 'rounded-full h-8 w-8 object-cover border mx-2', value.class ]">
                              <UserCircleIcon v-else class="rounded-full h-8 w-8 object-cover border mx-2"  />
                        </template>
                        <template v-else-if="value.type == 'pic'">
                              <img v-if="value.data != null" :src="value.data"
                                    :class="[ 'h-14 w-14 object-cover border mx-2', value.class ]">
                              <UserCircleIcon v-else class="h-14 w-14 object-cover border mx-2"  />
                        </template>
                        <template v-else-if="value.type == 'badge'">
                            <t-badge v-if="value.class == null"
                                design="light"
                                color="violet"
                            >
                                {{ value.data }}
                            </t-badge>
                            <t-badge v-else
                                design="filled"
                                :color="value.class"
                            >
                                {{ value.data }}
                            </t-badge>
                        </template>

                        <Switch
                            v-else-if="value.type == 'switch'"
                            v-model="value.data"
                            :updateRoute="value.route"
                        />

                        <a
                            v-else-if="value.type == 'file'"
                            :href="value.data"
                            target="_blank"
                            :class="value.data != null ? 'text-blue-500' : 'text-gray-500'"
                        >
                            <t-badge
                                design="block"
                                :class="value.class"
                                :color="value.data != null ? 'info' : 'secondary'"

                            >
                              <template #icon>
                                <ArrowDownTrayIcon class="w-4" />
                              </template>
                              دانلود
                            </t-badge>
                        </a>
                        <Link
                          v-else-if="value.type == 'action'"
                          :class="value.class"
                          as="button" type="button"
                          :method="value.method ? value.method : 'get'"
                          :href="value.data"
                        >
                          {{ value.label }}
                        </Link>
                        <ClockIcon
                            v-if="value.data?.visitEmit"
                            class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                            :class="value.class"
                            @click.stop="handleVisit(item, value.data.visitEmit)"
                        />
                        <span v-else :class="[value.class]">{{ value.data }}</span>
                    </td>
                </template>
            </tr>

            <tr v-if="contents.data.length === 0">
            <td class="px-2 py-4 border-t text-abrash-red" :colspan="headers.length"> اطلاعاتی برای نمایش وجود ندارد! </td>
            </tr>
          </tbody>
          <tfoot v-if="footers" class="bg-gray-100 border-t border-gray-300 dark:border-gray-700">
            <tr>
              <td :colspan="headers.length" class="p-2 text-sm">
                {{ footers }}
              </td>
            </tr>
          </tfoot>
        </table>
        </div>
        <!-- <pagination class="mt-6" :links="contents.links" :preserveState="preserveState"/> -->
        </div>
    </component>
</template>

<script>
    import { ref } from "vue";
    import { Link, router, useForm } from '@inertiajs/vue3'
    import { PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ChevronLeftIcon, ArrowsUpDownIcon,ClockIcon } from '@heroicons/vue/24/solid/index.js'
    import { UserCircleIcon } from '@heroicons/vue/24/outline/index.js'
    import Button from '@/Components/Button.vue'
    import Pagination from '@/Components/Shared/Pagination.vue'
    import SearchFilter from '@/Components/Shared/SearchFilter.vue'
    import TBadge from "@/Components/Badge/TBadge.vue";
    import pickBy from 'lodash/pickBy'
    import throttle from 'lodash/throttle'
    import mapValues from 'lodash/mapValues'
    import TTooltip from "@/Components/Tooltip/TTooltip.vue";
    import Switch from '@/Components/Switch/Switch.vue';
    import draggable from "vuedraggable";
    export default {
      components: {
    PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,ClockIcon,
    Button,
    Link,
    Pagination,
    SearchFilter,
    TBadge,
    ChevronLeftIcon,
    Switch,
    UserCircleIcon,
    TTooltip,
    draggable,
    ArrowsUpDownIcon
},
      props: {
        enable : {
          type : Boolean,
          default: true
        },
        title        : {
            type: String,
            default: null,
        },
        createRoute  : {
            type: String,
            default: null,
        },
        searchRoute  : {
            type: String,
            default: null,
        },
        searchLable  : {
            type: String,
            default: 'Search',
        },
        searchSlug  : {
            type: String,
            default: 'search',
        },
        hasCard: {
          type: Boolean,
          default : true
        },
        dragOrderRoute : {
            type: String,
            default: null,
        },
        preserveState : {
          type : Boolean,
          default: false
        },
        headers     : Object,
        filters     : Object,
        contents    : Object,
        footers     : { type: Object, default: null} ,
      },
      setup (props,{emit}) {
        const handleVisit = (item, visitEmit) => {
            emit(visitEmit, item)
            //indexFocused.value = toRaw(item).id.data
            //console.log(`handleVisit (${visitEmit}) : `,item)
        }
        const orderForm  = useForm({
            output : null,
        });

        const saveOrder = () => {

        }

        function gotoLink(dest)
        {
          //console.log(`dest `,dest)
          router.get(dest);
        }

        const Tag = props.hasCard ?  'BaseCard' : 'div';
        return { Tag, props, orderForm, saveOrder, gotoLink,handleVisit }
      },
      data(props) {
        return {
          form: {
            search: this.filters?.search,
          },
          searchRoute : ref(props.searchRoute),
          dragOrderRoute : ref(props.dragOrderRoute),
          searchShow  : ref(false),
          orderShow      : ref(false),
          theContents    : ref(props.contents),
        }
      },
      watch: {
        form: {
          deep: true,
          handler: throttle(function () {
            const para = this.form.search.length ? { [this.props.searchSlug] : this.form.search } : {};
            this.$inertia.get(this.searchRoute, para, { preserveState: true, preserveScroll: true })
          }, 150),
        },
      },
      methods: {
        reset() {
          this.form = mapValues(this.form, () => null)
        },

        toggleSearchInput() {
            this.searchShow = !this.searchShow
        },

        toggleOrderMode() {
            this.orderShow = !this.orderShow
        },

        handleOrderChange() {
            this.orderForm.transform((data) => ({
                    output: this.theContents,
                })).post(
                    this.dragOrderRoute,
                    {
                        preserveState : true,
                        preserveScroll: true,
                        onStart: () => {},
                        onSuccess: (res) => {},
                    }
            );
        },

      },
    }
</script>

<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

th {
  text-align: right;
}
</style>

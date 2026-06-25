<template>
    <component :is="Tag">
        <div class="ttable content-center justify-center overflow-hidden ">
        <div class="flex justify-between items-center mb-4 border-b-2 p-2" v-if="(title != null || createRoute != null || searchRoute != null)">
          <div class="flex flex-row content-center justify-center items-center"  v-if="title != null">
                <h5 class="text-abrash-blue  font-bold text-sm sm:text-base">{{ title }}</h5>
          </div>

          <div class="flex flex-row gap-1">

            <Button
                  iconOnly
                  variant="secondary"
                  type="button"
                  @click="togglefilterStatus"
                  v-slot="{ iconSizeClasses }"
                  class="inline-flex text-sm"
                  srText="Toggle dark mode"
              >
                  <AdjustmentsVerticalIcon class="w-6 h-6"/>
              </Button>

              <Button v-if="searchRoute != null"
                  iconOnly
                  variant="secondary"
                  type="button"
                  @click="toggleSearchInput"
                  v-slot="{ iconSizeClasses }"
                  class="inline-flex mx-1 text-sm"
                  srText="Toggle dark mode"
              >
                  <MagnifyingGlassIcon class="w-5 h-5"/>
              </Button>

              <Button v-if="createRoute != null"
                  variant="primary"
                  class="py-1 h-10 btn-indigo items-center gap-2 w-full sm:w-min sm:mt-0 text-sm"
                  v-slot="{ iconSizeClasses }"
                  @click="newDocument">
                      <PlusIcon aria-hidden="true" class="w-5 h-5"/>
                      <span> جدید </span>
              </Button>
              <Button
                variant="primary"
                class="w-full cursor-pointer bg-gray-600 hover:bg-gray-700"
                @click="backToList"
              >
                <ArrowUturnRightIcon class="text-white size-6" />
              </Button>
          </div>

          <slot />
        </div>

        <Transition>
            <div class="block sm:flex items-center justify-between mb-6 mx-2" v-if="(searchRoute != null && searchShow)">
                <search-filter v-model="form.search" :searchLable="searchLable" class="w-full" @reset="reset" />
            </div>
        </Transition>


        <!-- filter section -->
        <Transition>
        <div class="bg-gray-100 dark:bg-black p-1 -mt-2 rounded" v-if="filterShow">

          <fieldset class="w-full border border-dashed border-gray-300 dark:border-gray-700 p-3 mt-4">
            <legend class="text-xs"> افزودن فیلتر جدید:</legend>

            <div class="flex flex-col sm:flex-row gap-1 items-center">
              <NewSelect
                    class="w-full sm:max-w-fit"
                    insideClass="h-[30px] text-xs mx-1"
                    v-model="selectedFilterField"
                    placeHolder="یکی از ستون ها را انتخاب کنید"
                    :options="filter_slugs"
                    optionsLabelKey="title"
                    optionsValueKey="id"
                    nullable
                />
                <span class="text-gary-500 mx-2 text-md"> &bsime; </span>
                <Input
                      type="text"
                      class="h-[30px] text-xs !bg-transparent w-full sm:w-auto"
                      placeholder="یک مقدار برای فیلتر وارد کنید"
                      v-model="enteredFilterValue"
                      autocomplete="off"
                      v-on:keydown="inputKeydown"
                  />
                  <Button
                    :disabled="! enteredFilterValue || !selectedFilterField"
                    variant="primary"
                    class="py-1 h-[30px] btn-indigo items-center gap-1 w-full sm:w-min sm:mt-0 text-xs flex justify-center"
                    @click="addFilter"
                  >
                        <PlusIcon aria-hidden="true" class="w-5 h-5"/>
                        <span> افزودن </span>
                  </Button>
            </div>

          </fieldset>

          </div>
        </Transition>

        <div class="filter-section flex flex-row gap-1">

          <FilterLabel
            v-for="filterItem in filterArray" :key="filterItem.the_key"
            class="bg-gray-100 dark:bg-black"
            :title="filterItem.title"
            :the_key="filterItem.the_key"
            :the_value="filterItem.the_value"
            @click="deleteFilter(filterItem.the_key)"
          />

        </div>


        <div class="rounded-md overflow-x-auto">
        <table class="w-full whitespace-nowrap" v-if="enable">

            <tr class="text-left rtl:text-right font-bold">
            <th  v-for="th in headers" :key="th.slug" class="py-2 px-2 text-sm">{{ th }}</th>
            </tr>

            <tr
                    v-for="(item, index) in contents?.data"
                    :key="item.id.data"
                    class="table-tr transition-colors duration-300"
                    :class="[
                        indexFocused == item.id.data
                        ? 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-900 focus-within:bg-blue-300'
                        : index % 2 === 0
                            ? 'bg-white hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-yellow-900 focus-within:bg-blue-100'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 focus-within:bg-gray-200'
                    ]"
                    >
                <template v-for="value in item" :key="value">
                    <td v-if="value.show == true"
                        class="border-t items-center px-2 py-2 text-sm"
                        :class="(value.type != 'switch' && value.type != 'file') ? 'cursor-pointer': ''"
                        @click="(value.type != 'switch' && value.type != 'file') ? gotoLink(item) : null"
                    >
                        <Link v-if="value.type == 'link'"
                            :class="[ 'flex items-center px-4' , value.class ]" :href="value.data" tabindex="-1">
                            <ChevronLeftIcon class="hover:animate-ping block w-5 h-5" />
                        </Link>
                        <template v-else-if="value.type == 'avatar'">
                              <img v-if="value.data != null" :src="value.data"
                                    :class="[ 'rounded-full h-8 w-8 object-cover border-2 mx-2', value.class ]">
                              <UserCircleIcon v-else class="rounded-full h-8 w-8 object-cover border-2 mx-2"  />
                        </template>
                        <template v-else-if="value.type == 'pic'">
                              <img v-if="value.data != null" :src="value.data"
                                    :class="[ 'h-14 w-14 object-cover border-2 mx-2', value.class ]">
                              <UserCircleIcon v-else class="h-14 w-14 object-cover border-2 mx-2"  />
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

                        <!-- <a
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
                        </a> -->
                        <Link
                          v-else-if="value.type == 'action'"
                          :class="value.class"
                          as="button" type="button"
                          :method="value.method ? value.method : 'get'"
                          :href="value.data"
                        >
                          {{ value.label }}
                        </Link>
                        <!-- start -->
                         <template v-else-if="value.type == 'route'">
                                <span class="flex flex-row" >
                                    <Link v-if="(value.data.viewRoute != null)"
                                        :href="value.data.viewRoute"
                                        tabindex="1"
                                        class="text-gray-500 hover:text-green-500 px-2"
                                    >
                                        <ViewIcon class="hover:animate-pulse block w-6 h-6" />
                                    </Link>

                                    <Link v-if="(value.data.editRoute != null)"
                                        :href="value.data.editRoute"
                                        tabindex="1"
                                        class="text-gray-500 hover:text-blue-500 px-2"
                                    >
                                        <EditIcon class="hover:animate-pulse block w-6 h-6" />
                                    </Link>


                                    <template  v-if="(value.data.deleteRoute != null)">
                                        <Link v-if="(!value.deleteConfirm)"
                                            :href="value.data.deleteRoute"
                                            tabindex="1"
                                            class="text-gray-500 hover:text-red-500 px-2"
                                            :class="value.class"
                                        >
                                            <LinkSlashIcon v-if="value?.icon == 'unlink'" class="hover:animate-pulse block w-5 h-5" />
                                            <DeleteIcon v-else class="hover:animate-pulse block w-5 h-5" />
                                        </Link>
                                        <template v-else >
                                            <LinkSlashIcon v-if="value?.icon == 'unlink'" class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-red-500 cursor-pointer"
                                                :class="value.class"
                                                @click="confirmDelete(value.data.deleteRoute)"  />
                                            <DeleteIcon
                                                v-else
                                                class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-red-500 cursor-pointer"
                                                :class="value.class"
                                                @click="confirmDelete(value.data.deleteRoute)"
                                            />
                                        </template>

                                    </template>
                                    <PencilSquareIcon
                                        v-if="value.data?.editEmit != null"
                                        class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                                        :class="value.class"
                                        @click.stop="handleEdit(item, value.data.editEmit)">
                                    </PencilSquareIcon>
                                    <ClockIcon
                                        v-if="value.data?.historyEmit"
                                        class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                                        :class="value.class"
                                        @click.stop="handleHistory(item, value.data.historyEmit)"
                                    />
                                     <TrashIcon
                                          v-if="value.data?.deleteRoute"
                                          class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-red-500 cursor-pointer"
                                          :class="value.class"
                                          @click.stop="handleDelete(item, value.data.deleteRoute)"
                                      />
                                </span>
                            </template>
                         <!-- end -->                        
                        <span v-else :class="[value.class]">{{ String(value.data)?.slice(0, 20) + (String(value.data)?.length > 20 ? '...' : '') }}</span>
                    </td>
                </template>
            </tr>

            <tr v-if="contents.data.length === 0">
            <td class="px-2 py-4 border-t text-abrash-red" :colspan="headers.length"> اطلاعاتی برای نمایش وجود ندارد! </td>
            </tr>
        </table>
        </div>
        <pagination class="mt-6" :links="contents.links" />
        </div>
    </component>
</template>

<script>
    import { ref, reactive, watch, defineEmits,toRaw} from "vue";
    import { Link, router, useForm } from '@inertiajs/vue3'
    import { PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,PaperClipIcon, ChevronLeftIcon, AdjustmentsVerticalIcon,ArrowUturnRightIcon,PencilSquareIcon,ClockIcon,TrashIcon,FolderPlusIcon,CommandLineIcon

     } from '@heroicons/vue/24/solid/index.js'
    import { UserCircleIcon } from '@heroicons/vue/24/outline/index.js'
    import Button from '@/Components/Button.vue'
    import Pagination from '@/Components/Shared/Pagination.vue'
    import SearchFilter from '@/Components/Shared/SearchFilter.vue'
    import TBadge from "@/Components/Badge/TBadge.vue";
    import throttle from 'lodash/throttle'
    import mapValues from 'lodash/mapValues'

    import Switch from '@/Components/Switch/Switch.vue';
    import Input from '@/Components/Input.vue';
    import { debounce } from "lodash";
    import FilterLabel from "../Shared/FilterLabel.vue";
    import NewSelect from "../Select/NewSelect.vue";

    export default {
      components: {
    PlusIcon, MagnifyingGlassIcon,PaperClipIcon, ArrowDownTrayIcon, AdjustmentsVerticalIcon,ArrowUturnRightIcon,PencilSquareIcon,ClockIcon,TrashIcon,FolderPlusIcon,CommandLineIcon,
    Button,
    Link,
    Pagination,
    SearchFilter,
    TBadge,
    ChevronLeftIcon,
    Switch,
    UserCircleIcon,
    FilterLabel,
    NewSelect,
    Input
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
        filterSlug  : {
            type: String,
            default: '?',
        },
        hasCard: {
          type: Boolean,
          default : true
        },
        selectedRow        : {
            type: Boolean,
            default: false,
        },
        headers     : Object,
        filterDynamicHeaders: { type : Object, default: []},
        filters     : Object,
        contents    : Object,
      },
      setup (props,{emit}) {
        const handleEdit = (item, editEmit) => {
            emit(editEmit, item)
            indexFocused.value = toRaw(item).id.data
        }
        const newDocument = () => {
          //console.log(`filter : new`)
          emit('new')
        }
        const handleDelete = (item,flag) => {
          emit(flag, item)
          indexFocused.value = toRaw(item).id.data
        }
        const addFiles = (item, flag, eventw) =>{
            eventw.stopPropagation(); // extra safety
            emit(flag, item);
        }
        const handleHistory = (item,flag) => {
          emit(flag, item)
          indexFocused.value = toRaw(item).id.data
        }

        const showFiles = (item,flag) => {
          //console.log(`filter : a`,flag)
          emit(flag,item)
        }
        const backToList = () => {
          //console.log(`filter : back`)
          emit('back')
        }
        const resetSearch = () => {
          //this.filterShow = !this.filterShow         
          console.log(`EMIT`)
          filterShow.value = !filterShow.value
          if(!filterShow.value){
              console.log(`FilterTable | send EMIT`)
              emit('reset')
            }
        }
        //console.log(`headerst : `,props.headers)
        const selectedFilterField = ref(null);
        const enteredFilterValue  = ref(null);
        const filterArray         = reactive([]);
        const indexFocused        = ref(-1)
        const truncatedText       = ref(null)
        function gotoLink(dest)
        {
            emit('history-Item',dest)
            //router.get(dest);
        }
        // بدست آوردن نام ردیف ها و اسلاگ آن
        const filter_slugs    = reactive([]);

        props.headers.forEach(element => {
            if(element.filter == true)
            {
              filter_slugs.push({
                    id: element.slug ,
                    title: element.title
                  });
            }
        });


        props.filterDynamicHeaders.forEach(element => {

          filter_slugs.push({
                id: element.slug ,
                title: element.title
              });

        });


        //init filters
        const filterKeys = Object.keys(props.filters || {});
        for (let index = 0; index < filterKeys.length; index++) {
          if(filterKeys[index] != props.searchSlug)
          {
            selectedFilterField.value = filterKeys[index];
            enteredFilterValue.value  = props.filters[filterKeys[index]];
            addFilter();
          }
        }

        function addFilter()
        {
          const exist_index = filterArray.findIndex(pt => pt.the_key == selectedFilterField.value.id);
          if(exist_index == -1)
          {
            filterArray.push({ the_key: selectedFilterField.value.id, the_value: enteredFilterValue.value, title: filter_slugs[filter_slugs.findIndex(pt => pt.id ==  selectedFilterField.value.id)]?.title });
            selectedFilterField.value= null;
            enteredFilterValue.value= null;
          }
          else
          {
            filterArray[exist_index].the_value = enteredFilterValue.value;
            selectedFilterField.value= null;
            enteredFilterValue.value= null;
          }

        }

        function deleteFilter(the_key)
        {
          filterArray.splice(filterArray.findIndex(pt => pt.the_key === the_key), 1);
        }
        
        //-------------original--------
        watch(filterArray, (newValue, oldValue) => {
            var data = {};
            data[props.searchSlug] = props.filters?.search;
            console.log(`Filter | filterArray : `,filterArray)
            if(newValue.length)
            {
              newValue.forEach( (item) => {
                console.log(`Filter | item : `,item)
                data[item.the_key] = item.the_value;
                console.log(`Filter | data : `,data) 
              });
            }
             console.log(`Filter | props.searchRoute : `,props.searchRoute)                       
            router.get(props.searchRoute, data, { preserveState: true, preserveScroll: true });
            const test = router.get(props.searchRoute, data, { preserveState: true, preserveScroll: true });
            console.log(`Filter | test : `,test)  
        });
        //----------updated---------
        // const applyFilters = debounce(() => {
        //     router.get(props.searchRoute, data, {
        //         preserveState: true,
        //         preserveScroll: true,
        //         replace: true,
        //     });
        // }, 400);

        // watch(filterArray, applyFilters);
        //----------------
        watch(
            () => props.selectedRow,
            (newValue, oldValue) => {
                if (newValue == false) {
                indexFocused.value = -1
                }
            },
            { deep: true, immediate: true } 
            )
        const Tag = props.hasCard ?  'BaseCard' : 'div';
        return { Tag, props, selectedFilterField, enteredFilterValue,indexFocused,filter_slugs, filterArray,resetSearch,handleDelete,handleEdit, addFilter,handleHistory, deleteFilter, gotoLink,backToList,newDocument,addFiles,showFiles }
      },
      data(props) {
        return {
          form: {
            search: this.filters?.search,
          },
          searchRoute : ref(props.searchRoute),
          searchShow  : ref(false),
          filterShow  : ref(false),
        }
      },
      watch: {
        form: {
          deep: true,
          handler: throttle(function () {
            const para = this.form.search.length ? { [this.props.searchSlug] : this.form.search } : {};
            if(this.filterArray.length)
            {
              this.filterArray.forEach( (item) => {
                para[item.the_key] = item.the_value;
              });
            }
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
            //this.resetSearch()
        },

        togglefilterStatus() {
            this.filterShow = !this.filterShow
        },

        inputKeydown: function (e) {
            if(e.key == 'Enter')
              this.addFilter();
        }
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

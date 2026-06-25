<template>
    <BaseCard>
        <div class="p-2 ttable content-center justify-center overflow-hidden ">
        <div class="flex justify-between items-center mb-4 border-b-2 pb-2" v-if="(title != null || createRoute != null || searchRoute != null || dragOrderRoute != null)">
            <div class="flex flex-row content-center justify-center items-center"   v-if="title != null">
                <h5 class="text-abrash-blue dark:text-blue-400 font-bold text-sm sm:text-base">{{ title }}</h5>
            </div>



            <div class="flex flex-row gap-2" v-if="(createRoute != null || searchRoute != null || dragOrderRoute != null || $slots.headerItems)">

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
                        <div class="w-6 h-6 hover:animate-pulse">⬇️</div> 
                    </button>
                    <template v-if="orderShow" #boxContent>Exit fro rorder mode</template>
                    <template v-else #boxContent>Items reorder</template>
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
                        <div class="w-6 h-6 hover:animate-pulse">🔎</div>                        
                    </button>
                    <template v-if="searchShow" #boxContent>Delete search box</template>
                    <template v-else #boxContent>Show search box</template>
                </t-tooltip>

                <!-- <Button v-if="createRoute != null"
                    variant="primary"
                    class="py-1 h-10 btn-indigo items-center gap-2 w-full sm:w-min sm:mt-0 text-sm"
                    v-slot="{ iconSizeClasses }"
                    :href="createRoute">
                        <PlusIcon aria-hidden="true" class="w-3 h-3" :class="iconSizeClasses" />
                        <span> New </span>
                </Button>                -->
                <slot name="headerItems" /> 
            </div>                        
        </div>

        <Transition>
            <!-- search -->
            <div class="block sm:flex items-center justify-between mb-6" v-if="(searchRoute != null && searchShow)">
                <search-filter v-model="form.search" :searchLable="searchLable" class="w-full" @reset="reset" />
            </div>
        </Transition>

        <div class="rounded-md overflow-x-auto">
            <table class="w-full whitespace-nowrap" >
                <thead>
                    <tr class="text-left rtl:text-right font-bold">
                        <th  v-for="th in headers" :key="th" class="py-2 px-2 text-sm text-right">
                            {{ th }}
                        </th>
                        <th  v-if="hasCrud" class="py-2 px-2 text-sm text-right"> managment </th>
                    </tr>
                </thead>

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

                <!-- <tr v-else v-for="(item , index) in contents?.data"
                    :key="item.id.data"
                    :class="index % 2 == 0 ?
                        'table-tr hover:bg-gray-100 dark:hover:bg-gray-900 focus-within:bg-gray-100'
                        : 'table-tr bg-gray-200 hover:bg-gray-300 focus-within:bg-gray-200  dark:bg-gray-700 dark:hover:bg-gray-900'"

                > -->
                <tr
                    v-for="(item, index) in contents?.data"
                    :key="item.id.data"
                    class="table-tr transition-colors duration-300"
                    :class="[
                        indexFocused === item.id.data
                        ? 'bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-900 focus-within:bg-blue-300'
                        : index % 2 === 0
                            ? 'bg-white hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-yellow-900 focus-within:bg-blue-100'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 focus-within:bg-gray-200'
                    ]"
                    >
                    <template v-for="value in item" :key="value">
                        <!-- <pre>{{ value.data }}</pre> -->
                        <td v-if="value.show == true" 
                            class="border-t items-center px-2 py-2 text-sm"
                            :class="(value.type != 'switch' && value.type != 'file') ? 'cursor-pointer': ''"
                            @click="(value.type != 'switch' && value.type != 'file') ? gotoLink(item,value.data.historyEmit) : null"
                        >
                            <Link v-if="value.type == 'link'"
                                :class="[ 'flex items-center px-4' , value.class ]" :href="value.data" tabindex="-1">
                                <ArrowLeftIcon v-if="pageDirection == 'rtl'" class="hover:animate-ping block w-5 h-5" />
                                <ArrowRightIcon v-else class="hover:animate-ping block w-5 h-5 ok" />
                            </Link>
                            <img v-else-if="value.type == 'avatar'" :src="value.data"
                                        :class="[ 'rounded-full h-8 w-8 object-cover border-2 mx-2', value.class ]">

                            <img v-else-if="value.type == 'pic'" :src="value.data"
                                        :class="[ 'h-14 w-14 object-cover border-2 mx-2', value.class ]">

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

                            <template v-else-if="value.type == 'action'">
                                <t-badge v-if="value.class == null"
                                    design="light"
                                    color="violet"
                                    @click="confirmAction(value.data.actionRoute)"
                                    :class="value.data.class"

                                >
                                    {{ value.data.title }}
                                </t-badge>
                                <t-badge v-else
                                    design="filled"
                                    :color="value.class"
                                    @click="confirmAction(value.data.actionRoute)"
                                    :class="value.data.class"
                                >
                                    {{ value.data.title }}
                                </t-badge>
                            </template>

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
                                        <div v-if="value?.icon == 'unlink'" >
                                            <div class="w-6 h-6 hover:animate-pulse">🔎</div> 
                                        </div> 
                                            <LinkSlashIcon class="hover:animate-pulse block w-5 h-5" />
                                        <div v-if="value?.icon == 'unlink'" >
                                            <div class="w-6 h-6 hover:animate-pulse">🔎</div> 
                                        </div> 
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
                                    <!-- <PencilSquareIcon
                                        v-if="value.data?.editEmit != null"
                                        class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                                        :class="value.class"
                                        @click="$emit(value.data.editEmit, item)"
                                    />-->
                                    <PencilSquareIcon
                                        v-if="value.data?.editEmit != null"
                                        class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                                        :class="value.class"
                                        @click="handleEdit(item, value.data.editEmit)">
                                    </PencilSquareIcon>
                                    <EllipsisHorizontalIcon
                                        v-if="value.data?.historyEmit"
                                        class="text-gray-500 hover:animate-pulse block w-5 h-5 hover:text-blue-500 cursor-pointer"
                                        :class="value.class"
                                        @click.stop="handleHistory(item, value.data.historyEmit)"
                                    />
                                </span>
                            </template>

                            <Switch
                                v-else-if="value.type == 'switch'"
                                v-model="value.data"
                                :updateRoute="value.route"
                            />

                            <span v-else :class="[value.class]">{{ value.data }}</span>

                        </td>
                    </template>
                </tr>

                <tr v-if="contents?.data?.length === 0">
                    <td v-if="hasCrud" class="px-2 py-4 border-t text-abrash-red" :colspan="(headers?.length + 1)"> هیچ اطلاعاتی برای نمایش وجود ندارد! </td>
                    <td v-else class="px-2 py-4 border-t text-abrash-red" :colspan="headers?.length"> هیچ اطلاعاتی برای نمایش وجود ندارد! </td>
                </tr>                
            </table>          
        </div>
        <pagination class="mt-6" :links="contents.links" />
        </div>
    </BaseCard>
    <TConfirm
        :title="'Are you sure?!'"
        :waiting=deleteForm.processing
        icon="delete"
        v-model:cancel="showDeleteModal"
        v-model:accept="acceptDelete"
    />
    <TConfirm
        :title="'Are you sure?!'"
        icon="question"
        v-model:cancel="showActionModal"
        v-model:accept="acceptAction"
    />
</template>

<script>
    import { ref, watch,defineEmits } from "vue";
    import Button from '@/Components/Button.vue'
    import Pagination from '@/Components/Shared/Pagination.vue'
    import SearchFilter from '@/Components/Shared/SearchFilter.vue'
    import TBadge from "@/Components/Badge/TBadge.vue";
    import throttle from 'lodash/throttle'
    import mapValues from 'lodash/mapValues'
    import TTooltip from "@/Components/Tooltip/TTooltip.vue";
    import TConfirm from "@/Components/Alert/TConfirm.vue";


    import
    {
        ArrowLeftIcon,
        ArrowRightIcon,
        ViewIcon,
        EditIcon,
        DeleteIcon,
        OrderIcon,
    } from '@/Components/Icons/General'

    import draggable from "vue3-draggable";
    import Switch from '@/Components/Switch/Switch.vue';


    export default {
      components: {
        Button,
        Link,
        Pagination,
        SearchFilter,
        TBadge,
        ArrowLeftIcon, ArrowRightIcon,
        ViewIcon, EditIcon, DeleteIcon, OrderIcon,
        TTooltip,
        draggable,
        Switch,
        TConfirm
      },
      props: {
        title        : {
            type: String,
            default: null,
        },
        createRoute  : {
            type: String,
            default: null,
        },
        hasCrud  : {
            type: Boolean,
            default: true,
        },
        dragOrderRoute : {
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
        selectedRow        : {
            type: Boolean,
            default: false,
        },
        headers     : Object,
        filters     : Object,
        contents    : Object,
      },



      setup (props,{emit}) {
        const handleEdit = (item, editEmit) => {
            emit(editEmit, item)
            indexFocused.value = item.id.data
        }
        const handleHistory = (item, historyEmit) => {
            console.log(`Crud h| item : `,item)
            console.log(`Crud h| historyEmit : `,historyEmit)
            emit(historyEmit, item.id.data)
            indexFocused.value = item.id.data
        }
        //gotoLink gotoLink
       const gotoLink = (item, historyEmit) => {
            if (!historyEmit) {
                console.warn("No historyEmit provided for gotoLink");
                return;
            }

            emit(historyEmit, item.id.data);
        };
        const orderForm  = useForm({
            output : null,
        });

        const saveOrder = () => {

        }

        // delete section start {
        const acceptDelete = ref(false);
        const deleteRoute  = ref(null);
        const showDeleteModal = ref(false);
        const indexFocused = ref(-1)
        const deleteForm  = useForm({
            do : 0,
        });


        function confirmDelete($the_url)
        {
            showDeleteModal.value = true;
            deleteRoute.value     = $the_url;
        }


        watch(acceptDelete, (newValue, oldValue) => {
            if (newValue) {
                deleteForm.do = 1;
                deleteForm.post(deleteRoute.value,
                {
                    preserveState: false,
                    onFinish: () => {
                        acceptDelete.value = false;
                        showDeleteModal.value = false;
                        deleteRoute.value = null;
                        deleteForm.reset();
                    },
                });

            }
        });

        const acceptAction = ref(false);
        const ActionRoute  = ref(null);
        const showActionModal = ref(false);


        const actionForm  = useForm({
            do : 0,
        });


        function confirmAction($the_url)
        {
            showActionModal.value = true;
            ActionRoute.value     = $the_url;
        };


        watch(acceptAction, (newValue, oldValue) => {
            if (newValue) {
                actionForm.do = 1;
                actionForm.post(ActionRoute.value,
                {
                    preserveState: false,
                    onFinish: () => {
                        acceptAction.value = false;
                        showActionModal.value = false;
                        ActionRoute.value = null;
                        actionForm.reset();
                    },
                });

            }
        });
        watch(
            () => props.selectedRow,
            (newValue, oldValue) => {
                if (newValue == false) {
                indexFocused.value = -1
                }
            },
            { deep: true, immediate: true } // Add these options
            )
        return {
            props,
            orderForm,
            saveOrder,
            confirmDelete,
            acceptDelete,
            showDeleteModal,
            deleteRoute,
            deleteForm,
            acceptAction,
            ActionRoute,
            showActionModal,
            actionForm,
            confirmAction,
            handleEdit,
            handleHistory,
            indexFocused,
            gotoLink
        }
      },
      data(props) {
        return {
            form: {
                search: this.filters?.search,
            },
            searchRoute    : ref(props.searchRoute),
            dragOrderRoute : ref(props.dragOrderRoute),
            searchShow     : ref(false),
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
</style>



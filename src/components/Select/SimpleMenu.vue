<template>
    <Menu
        :as="props.as"
        class="w-full relative inline-block text-right"
        :class="props.class"
        v-slot="{ open }"
    >
    <div>
        <MenuButton
            class="inline-flex text-xs w-full justify-between rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white bg-opacity-90 px-4 py-2 font-medium text-gray-600 hover:bg-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
            {{  props.activeTitle }}
            <ArrowDownIcon
                :class="[
                    'ml-2 -mr-1 rtl:-ml-1 rtl:mr-2 h-4 w-4 dark:hover:text-gray-100 hover:text-gray-900',
                    open
                        ? 'rotate-180'
                        : '',
                ]"
                aria-hidden="true"
            />
        </MenuButton>
    </div>

    <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
        <MenuItems
            class="z-[100000000] absolute left-0 origin-top-right rtl:left-auto rtl:right-0 rtl:origin-top-right mt-2 w-full px-2 divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none min-w-max"
        >
            <div
                class="px-1 py-1"
            >
                <MenuItem
                    v-if="firstItem != null"
                    :key="firstItem.id + firstItem.title"
                >
                    <Link
                        as="button"
                        method="get"
                        :href="props.currentUrl"
                        :data="getData(firstItem.id)"
                        :class="[
                            active || firstItem.title == props.activeTitle
                                ? 'bg-abrash-blue text-white dark:text-black'
                                : 'text-gray-900 dark:text-white',
                            'group flex w-full items-center rounded-md px-2 py-2 text-xs cursor-pointer hover:text-abrash-red',
                        ]"
                    >
                        {{
                            
                            firstItem.title
                            
                        }}
                    </Link>
                </MenuItem>
                <MenuItem
                    v-for="item in props.items"
                    :key="item.id + item.title"
                >
                    <Link
                        as="button"
                        method="get"
                        :href="props.currentUrl"
                        :data="getData(item.id)"
                        :class="[
                            active || item.title == props.activeTitle
                                ? 'bg-abrash-blue text-white dark:text-black'
                                : 'text-gray-900 dark:text-white',
                            'group flex w-full items-center rounded-md px-2 py-2 text-xs cursor-pointer hover:text-abrash-red',
                        ]"
                    >
                        {{
                            
                            item.title
                            
                        }}
                    </Link>
                </MenuItem>
            </div>
        </MenuItems>
    </transition>
    </Menu>
</template>

<script>
    import { Link } from "@inertiajs/vue3";
    import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
    import { ArrowDownIcon } from "@/Components/Icons/General";

    export default {
        components: {
            Link,
            Menu, MenuButton, MenuItems, MenuItem,
            ArrowDownIcon
        },
        props : {
            as : {
                type : String,
                default: "div"
            },
            class : {
                type : [String, Array],
                default: null
            },
            items : Object,
            activeTitle : String,
            currentUrl : String,
            queryLabel : String,
            firstItem  : {
                type: Object,
                default: null
            }
        },
        setup(props){

            function getData(id)
            {
                let res = {};
                res[props.queryLabel] = id;
                return res;
            }
            return {
                props,
                getData
            }
        }
    }
</script>

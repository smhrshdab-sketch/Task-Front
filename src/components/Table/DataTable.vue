<script setup lang="ts" generic="TData, TValue">
  import { ref, computed ,defineEmits} from "vue";
  import type { ColumnDef } from "@tanstack/vue-table";
  import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
  } from "@tanstack/vue-table";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";

  const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  }>();

  // ==================== Table ====================
  const table = useVueTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
  });
</script>

<template>
  <div class="border rounded-md overflow-hidden">
    <!-- Set a max height for the table container -->
    <div class="max-h-[400px] overflow-y-auto">
      <Table class="w-full border-collapse">
        <TableHeader class="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="bg-blue-100 text-gray-700 font-semibold text-right sticky top-0 z-10"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="props.data.length > 0">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="row.id % 2 === 0 
                ? 'bg-gray-200 dark:bg-[#112736]' 
                : 'bg-gray-300 dark:bg-[#0e3450]'"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="text-sm text-gray-700 p-1"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow>
              <TableCell :colspan="props.columns.length" class="h-24 text-center">
                تاریخچه ای وجود ندارد.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>


<template>
  <div class="timesheet-table-wrapper relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
    <div class="skeleton-table">
      <!-- Заголовок таблицы -->
      <div class="skeleton-header">
        <div class="skeleton-header-cell sticky left-0 z-10" style="width: 140px;">
          <div class="skeleton-shimmer skeleton-shimmer-wide"></div>
        </div>
        <div
          v-for="n in daysCount"
          :key="n"
          class="skeleton-header-cell"
          style="width: 50px;"
        >
          <div class="skeleton-shimmer skeleton-shimmer-small"></div>
        </div>
        <div class="skeleton-header-cell" style="width: 60px;">
          <div class="skeleton-shimmer skeleton-shimmer-small"></div>
        </div>
      </div>

      <!-- Строки скелетона -->
      <div
        v-for="n in rowsCount"
        :key="n"
        class="skeleton-row"
      >
        <div class="skeleton-cell sticky left-0 z-5" style="width: 140px;">
          <div class="skeleton-shimmer skeleton-shimmer-medium"></div>
        </div>
        <div
          v-for="day in daysCount"
          :key="day"
          class="skeleton-cell"
          style="width: 50px;"
        >
          <div class="skeleton-shimmer skeleton-shimmer-tiny"></div>
        </div>
        <div class="skeleton-cell" style="width: 60px;">
          <div class="skeleton-shimmer skeleton-shimmer-tiny"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rowsCount?: number
  daysCount?: number
}

withDefaults(defineProps<Props>(), {
  rowsCount: 5,
  daysCount: 31,
})
</script>

<style scoped>
.skeleton-table {
  overflow-x: auto;
}

.skeleton-header {
  display: flex;
  border-bottom: 1px solid rgb(229 231 235);
  background-color: rgb(249 250 251);
}

.dark .skeleton-header {
  border-color: rgb(55 65 81);
  background-color: rgb(31 41 55);
}

.skeleton-header-cell {
  padding: 1rem;
  border-right: 1px solid rgb(229 231 235);
}

.skeleton-header-cell.sticky {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  background-color: rgb(249 250 251);
}

.dark .skeleton-header-cell {
  border-color: rgb(55 65 81);
}

.dark .skeleton-header-cell.sticky {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
  background-color: rgb(31 41 55);
}

.skeleton-row {
  display: flex;
  border-bottom: 1px solid rgb(229 231 235);
  background-color: white;
}

.dark .skeleton-row {
  border-color: rgb(55 65 81);
  background-color: rgb(17 24 39);
}

.skeleton-row:nth-child(even) {
  background-color: rgb(249 250 251);
}

.dark .skeleton-row:nth-child(even) {
  background-color: rgb(31 41 55);
}

.skeleton-cell {
  padding: 1rem;
  border-right: 1px solid rgb(229 231 235);
}

.skeleton-cell.sticky {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.skeleton-row:nth-child(even) .skeleton-cell.sticky {
  background-color: rgb(249 250 251);
}

.dark .skeleton-cell {
  border-color: rgb(55 65 81);
}

.dark .skeleton-cell.sticky {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.3);
  background-color: rgb(17 24 39);
}

.dark .skeleton-row:nth-child(even) .skeleton-cell.sticky {
  background-color: rgb(31 41 55);
}

.skeleton-shimmer {
  height: 16px;
  background: linear-gradient(
    90deg,
    rgb(243 244 246) 0%,
    rgb(229 231 235) 50%,
    rgb(243 244 246) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-shimmer-wide {
  width: 100%;
}

.skeleton-shimmer-medium {
  width: 80%;
}

.skeleton-shimmer-small {
  width: 60%;
}

.skeleton-shimmer-tiny {
  width: 40%;
  height: 12px;
}

.dark .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgb(55 65 81) 0%,
    rgb(75 85 99) 50%,
    rgb(55 65 81) 100%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

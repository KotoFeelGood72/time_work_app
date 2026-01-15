<template>
  <div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

declare global {
  interface Window {
    BX24: {
      init: (callback: () => void) => void
      callMethod: (
        method: string,
        params: Record<string, unknown>,
        callback: (result: {
          answer: {
            result: {
              INSTALLED: boolean
            }
          }
        }) => void
      ) => void
      installFinish: () => void
    }
  }
}

const install = () => {
  if (typeof window !== 'undefined' && window.BX24) {
    window.BX24.init(function() {
      window.BX24.callMethod(
        'app.info', {},
        function(result) {
          if (result.answer.result.INSTALLED == false) {
            window.BX24.installFinish()
            if (result.answer.result.INSTALLED) {
              console.dir('Приложение установлено. Ок.')
            }
          }
        }
      )
    })
  }
}

onMounted(() => {
  install()
})
</script>

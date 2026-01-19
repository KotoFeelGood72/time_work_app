import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'

export enum ModalType {
  DEPARTMENT = 'department',
  DAY_DETAILS = 'day_details',
}

export const useModalStore = defineStore('modal', () => {
  const modalType = ref<ModalType | null>(null)


  const openModal = (type: ModalType) => {
    modalType.value = type
  }

  const closeModal = (type: ModalType) => {
    if (modalType.value === type) {
      modalType.value = null
    } else {
      console.error(`Modal type ${type} is not open`)
    }
  }

  return {
    modalType,
    openModal,
    closeModal,
  }
})

export const useModalStoreRefs = () => storeToRefs(useModalStore())

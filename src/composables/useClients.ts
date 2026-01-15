import { ref } from 'vue'

export interface Client { id: number; name: string; email: string; phone: string }


const clients = ref<Client[]>([])

export const useClients = () => {

  const getClients = async () => {
    const response = await fetch('https://api.example.com/clients')
    clients.value = await response.json()
  }

  return { clients, getClients }
}

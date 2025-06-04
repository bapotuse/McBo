<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Mes commandes</h1>

    <div v-if="commandes.length === 0" class="text-gray-600">
      Vous n'avez aucune commande.
    </div>

    <ul v-if="commandes.length > 0" class="space-y-4">
      <li v-for="commande in commandes" :key="commande.idCommande" class="border rounded p-4 shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <div>
            <span class="font-semibold">Commande #{{ commande.idCommande }}</span> - 
            <span class="text-sm text-gray-600">{{ formatDate(commande.date_commande) }}</span>
          </div>
          <div>
            <span 
              :class="{
                'text-green-600': commande.statut === 'prête',
                'text-yellow-600': commande.statut === 'en attente',
                'text-red-600': commande.statut === 'annulée'
              }"
              class="font-semibold capitalize"
            >
              {{ commande.statut }}
            </span>
          </div>
        </div>

        <div class="mb-1">
          <strong>Montant :</strong> {{ commande.montant }} €
        </div>
        <div class="mb-1">
          <strong>Adresse :</strong> {{ commande.adresse }}
        </div>
        <div>
          <strong>Articles :</strong> {{ commande.articles || "toz" }}
        </div>
        <button
            @click="allerDetail(commande.idCommande)"
            class="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
            Voir le détail
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const commandes = ref([])
const error = ref(null)
const router = useRouter()


function formatDate(dateString) {
  const date = new Date(dateString)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleString(undefined, options)
}

function allerDetail(idCommande) {
  router.push({ name: 'DetailCommande', params: { idCommande } })
}

async function fetchCommandes() {
  error.value = null

  try {
    const utilisateurStr = localStorage.getItem('utilisateur')
    const utilisateur = JSON.parse(utilisateurStr)

    if (!utilisateur || !utilisateur.id) {
      throw new Error('Utilisateur non authentifié')
    }

    const response = await fetch(`https://mcbo.onrender.com/api/commandes`, {
      headers: {
        'Content-Type': 'application/json',
        'user-id': utilisateur.id
      },
      credentials: 'include'
    })

    const text = await response.text()
    console.log('Réponse brute:', text)

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    const data = JSON.parse(text)
    commandes.value = data
    console.log('Commandes récupérées:', commandes.value)
  } catch (err) {
    error.value = err.message || 'Erreur lors de la récupération des commandes'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCommandes()
})
</script>


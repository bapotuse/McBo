<template>
  <div class="mt-8 flex flex-col items-center justify-center px-4">
    <div v-if="authorized" class="bg-white rounded-lg shadow-lg p-6 md:p-10 w-full max-w-5xl">
      <h2 class="text-2xl md:text-3xl font-bold text-red-600 mb-6 text-center">Liste des commandes</h2>

      <div v-if="loading" class="text-gray-500 text-center mb-4">Chargement des commandes...</div>
      <div v-else-if="error" class="text-red-600 text-center mb-4">Erreur lors de la récupération des commandes.</div>

      <div class="hidden md:block overflow-x-auto">
        <table class="w-full table-auto border border-gray-300 text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-4 py-2">ID</th>
              <th class="border px-4 py-2">Utilisateur</th>
              <th class="border px-4 py-2">Date</th>
              <th class="border px-4 py-2">Total (€)</th>
              <th class="border px-4 py-2">Statut</th>
              <th class="border px-4 py-2">Contenu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="commande in commandes" :key="commande.idCommande" class="hover:bg-yellow-50">
              <td class="border px-4 py-2 font-semibold">{{ commande.idCommande }}</td>
              <td class="border px-4 py-2">{{ commande.idUtilisateur }}</td>
              <td class="border px-4 py-2">{{ formatDate(commande.date_commande) }}</td>
              <td class="border px-4 py-2">{{ commande.montant }}€</td>
              <td class="border px-4 py-2">
                <select 
                  v-model="commande.statut" 
                  @change="mettreAJourStatut(commande)" 
                  class="border rounded px-2 py-1"
                >
                  <option value="en_attente">En attente</option>
                  <option value="prête">Prête</option>
                  <option value="annulee">Annulée</option>
                </select>
              </td>
              <td class="border px-4 py-2 text-left">
                <div><span class="font-medium">Menus :</span> {{ commande.menus || 'Aucun' }}</div>
                <div><span class="font-medium">Articles :</span> {{ commande.articles || 'Aucun' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden flex flex-col gap-4">
        <div v-for="commande in commandes" :key="commande.idCommande" class="border rounded-lg p-4 shadow">
          <p><span class="font-semibold">ID :</span> {{ commande.idCommande }}</p>
          <p><span class="font-semibold">Utilisateur :</span> {{ commande.idUtilisateur }}</p>
          <p><span class="font-semibold">Date :</span> {{ formatDate(commande.date_commande) }}</p>
          <p><span class="font-semibold">Total :</span> {{ commande.montant }}€</p>
          <p class="mb-2">
            <span class="font-semibold">Statut :</span>
            <select
              v-model="commande.statut"
              @change="mettreAJourStatut(commande)"
              class="border rounded px-2 py-1 ml-2"
            >
              <option value="en_attente">En attente</option>
              <option value="prête">Prête</option>
              <option value="annulee">Annulée</option>
            </select>
          </p>
          <p><span class="font-medium">Menus :</span> {{ commande.menus || 'Aucun' }}</p>
          <p><span class="font-medium">Articles :</span> {{ commande.articles || 'Aucun' }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-red-100 text-red-800 rounded-lg p-8 text-center max-w-md w-full shadow mt-4">
      <h1 class="text-2xl font-bold mb-3">Accès refusé</h1>
      <p class="mb-4">Vous n'avez pas les droits pour accéder à cette page.</p>
      <RouterLink
        to="/"
        class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded transition"
      >
        Retour à l'accueil
      </RouterLink>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const authorized = ref(false)
const commandes = ref([])
const loading = ref(false)
const error = ref(false)


onMounted(async () => {
  const userJson = localStorage.getItem('utilisateur')

  if (!userJson) {
    authorized.value = false
    return
  }

  const user = JSON.parse(userJson)
  authorized.value = user.idTypeUtilisateur === 1

  if (authorized.value) {
    loading.value = true
    try {
      const res = await axios.get('http://localhost:3000/api/commandes/toutes')
      commandes.value = res.data
    } catch (err) {
      console.error('Erreur lors du chargement des commandes :', err)
      error.value = true
    } finally {
      loading.value = false
    }
  }
})

const mettreAJourStatut = async (commande) => {
  try {
    await axios.put(`http://localhost:3000/api/commandes/${commande.idCommande}/statut`, {
      statut: commande.statut
    })
    console.log(`✅ Statut de la commande ${commande.idCommande} mis à jour : ${commande.statut}`)
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du statut :', err)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

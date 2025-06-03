<template>
  <div class="max-w-2xl mx-auto my-8 p-8 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Mon Compte</h2>
    <div v-if="utilisateur" class="space-y-4">
      <div class="flex justify-between items-center py-2 border-b border-gray-200">
        <label class="font-semibold text-gray-600">Nom:</label>
        <span class="text-gray-800">{{ utilisateur.nom }}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-200">
        <label class="font-semibold text-gray-600">Prénom:</label>
        <span class="text-gray-800">{{ utilisateur.prenom }}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-200">
        <label class="font-semibold text-gray-600">Email:</label>
        <span class="text-gray-800">{{ utilisateur.email }}</span>
      </div>
      <div class="mt-6">
        <RouterLink 
          to="/commandes" 
          class="block w-full text-center bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
        >
          Voir mes commandes
        </RouterLink>
      </div>
    </div>
    <div v-else class="text-center text-red-600 py-8">
      Vous devez être connecté pour voir votre profil
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const utilisateur = ref(null)

const recupererInfosUtilisateur = () => {
  const infoUtilisateur = localStorage.getItem('utilisateur')
  
  if (!infoUtilisateur) {
    router.push('/connexion')
    return
  }

  try {
    utilisateur.value = JSON.parse(infoUtilisateur)
  } catch (erreur) {
    console.error('Erreur lors de la récupération des informations:', erreur)
    localStorage.removeItem('utilisateur')
    router.push('/connexion')
  }
}

onMounted(() => {
  recupererInfosUtilisateur()
})
</script>

<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-center text-2xl sm:text-3xl font-bold my-4 sm:my-6">Liste des articles</h1>

    <div class="mb-6 flex flex-wrap justify-center gap-2">
      <button
        @click="categorieSelectionnee = ''"
        class="px-4 py-2 border rounded-full"
        :class="{'bg-red-500 text-white': categorieSelectionnee === ''}"
      >
        Tous
      </button>
      <button
        v-for="type in typesFiltrees"
        :key="type.id"
        @click="categorieSelectionnee = type.libel"
        class="px-4 py-2 border rounded-full"
        :class="{'bg-red-500 text-white': categorieSelectionnee === type.libel}"
      >
        {{ type.libel }}
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mx-auto max-w-[95%] sm:max-w-4xl xl:max-w-6xl">
      <div
        v-for="article in articlesFiltres"
        :key="article.idArticle"
        class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition w-full"
      >
        <img :src="article.image" alt="Produit" class="w-full h-48 object-cover" />
        <div class="p-3">
          <h3 class="text-lg font-semibold text-gray-800 truncate">{{ article.nom }}</h3>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-base font-bold text-red-600">{{ article.prix }} €</span>
            <button
              @click="ajouterAuPanier(article)"
              class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50">
      <RouterLink
        to="/panier"
        class="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:bg-red-700 transition flex items-center gap-2"
      >
        <span>Panier</span>
        <span
          v-if="nombreArticles > 0"
          class="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
        >
          {{ nombreArticles }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const articles = ref([])
const types = ref([])
const nombreArticles = ref(0)
const categorieSelectionnee = ref('')

const typesFiltrees = computed(() => {
  const seen = new Set()
  return types.value.filter(type => {
    if (!seen.has(type.libel)) {
      seen.add(type.libel)
      return true
    }
    return false
  })
})

const articlesFiltres = computed(() => {
  if (!categorieSelectionnee.value) return articles.value
  const idsTypesSelectionnes = types.value
    .filter(type => type.libel === categorieSelectionnee.value)
    .map(type => type.id)
  return articles.value.filter(article => idsTypesSelectionnes.includes(article.idTypeArticle))
})

onMounted(async () => {
  try {
    const resArticles = await axios.get(`https://mcbo.onrender.com/api/articles`)
    articles.value = resArticles.data

    const resTypes = await axios.get(`https://mcbo.onrender.com/api/type-articles`)
    types.value = resTypes.data
  } catch (error) {
    console.error('Erreur lors du chargement des données :', error)
  }

  const panierSauvegarde = localStorage.getItem('panier')
  if (panierSauvegarde) {
    const panier = JSON.parse(panierSauvegarde)
    nombreArticles.value = panier.length
  }
})

function ajouterAuPanier(article) {
  let panier = []
  const panierSauvegarde = localStorage.getItem('panier')
  if (panierSauvegarde) panier = JSON.parse(panierSauvegarde)

  panier.push({
    idArticle: article.id,
    nom: article.nom,
    prix: article.prix,
    description: article.description,
    image: article.image
  })

  localStorage.setItem('panier', JSON.stringify(panier))
  nombreArticles.value = panier.length

  window.dispatchEvent(new StorageEvent('storage', {
    key: 'panier',
    newValue: JSON.stringify(panier)
  }))

  alert(`${article.nom} ajouté au panier !`)
}
</script>

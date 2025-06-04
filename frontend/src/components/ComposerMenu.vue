<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Composez votre menu</h1>

      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-3">Choisissez la taille</h2>
        <div class="flex gap-4 justify-center">
          <button
            @click="choisirTaille('M')"
            :class="[
              'px-6 py-2 rounded-full font-semibold transition duration-200',
              selectedTaille === 'M' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
            ]"
          >
            M
          </button>
          <button
            @click="choisirTaille('L')"
            :class="[
              'px-6 py-2 rounded-full font-semibold transition duration-200',
              selectedTaille === 'L' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
            ]"
          >
            L
          </button>
        </div>
      </div>

      <div v-if="boissons.length" class="mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Boisson</h2>
        <select
          v-model="selectedBoisson"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option v-for="b in boissons" :value="b.id" :key="b.id">{{ b.nom }}</option>
        </select>
      </div>

      <div v-if="frites.length" class="mb-6">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Frites</h2>
        <select
          v-model="selectedFrite"
          class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option v-for="f in frites" :value="f.id" :key="f.id">{{ f.nom }}</option>
        </select>
      </div>

      <div class="text-center">
        <button
          @click="addToCart"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const nombreArticles = ref(0)
const route = useRoute()

const burgerId = ref(route.params.burgerId)
const boissons = ref([])
const frites = ref([])

const selectedTaille = ref(null)
const selectedBoisson = ref(null)
const selectedFrite = ref(null)

const TAILLE_TYPE_MAP = {
  M: { boisson: 3, frite: 2 },
  L: { boisson: 5, frite: 4 },
}

async function choisirTaille(taille) {
  selectedTaille.value = taille
  const { boisson: idTypeBoisson, frite: idTypeFrite } = TAILLE_TYPE_MAP[taille]

  try {
    const resBoissons = await axios.get(`https://mcbo.onrender.com/api/articles-par-type/${idTypeBoisson}`)
    boissons.value = resBoissons.data
    selectedBoisson.value = boissons.value[0]?.id

    const resFrites = await axios.get(`https://mcbo.onrender.com/api/articles-par-type/${idTypeFrite}`)
    frites.value = resFrites.data
    selectedFrite.value = frites.value[0]?.id
  } catch (err) {
    console.error('Erreur lors du chargement des articles :', err)
  }
}

async function addToCart() {
  let panier = []
  const panierSauvegarde = localStorage.getItem('panier')
  if (panierSauvegarde) panier = JSON.parse(panierSauvegarde)

  const boissonChoisie = boissons.value.find(b => b.id === selectedBoisson.value)
  const friteChoisie = frites.value.find(f => f.id === selectedFrite.value)

  if (!boissonChoisie || !friteChoisie || !selectedTaille.value) {
    alert("Veuillez sélectionner une taille, une boisson et une frite avant d'ajouter au panier.")
    return
  }

  try {
    const res = await axios.get(`https://mcbo.onrender.com/api/article/${burgerId.value}`)
    const burgerChoisi = res.data

    const menu = {
      type: 'menu',
      taille: selectedTaille.value,
      nom: `Menu ${burgerChoisi.nom}`,
      prix:
        parseFloat(burgerChoisi.prix) +
        parseFloat(boissonChoisie.prix) +
        parseFloat(friteChoisie.prix),
      contenu: {
        burger: burgerChoisi,
        boisson: boissonChoisie,
        frite: friteChoisie
      }
    }

    panier.push(menu)

    localStorage.setItem('panier', JSON.stringify(panier))
    nombreArticles.value = panier.length

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'panier',
      newValue: JSON.stringify(panier)
    }))

    alert(`Menu ajouté au panier : ${menu.nom}`)
    router.push('/panier')

  } catch (err) {
    console.error('Erreur lors de la récupération du burger :', err)
  }
}




</script>

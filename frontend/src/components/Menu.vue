<template>
  <div class="min-h-screen bg-yellow-50 p-8 flex flex-col items-center">
    <h1 class="text-4xl font-extrabold text-yellow-600 mb-12 drop-shadow-md">
      Nos Menus
    </h1>

    <ul class="w-full max-w-xl space-y-6">
      <li
        v-for="burger in burgers"
        :key="burger.id"
        class="flex justify-between items-center bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300"
      >
        <span class="text-xl font-semibold text-gray-800">{{ burger.nom }}</span>
        <button
          @click="goToComposerMenu(burger.id)"
          class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 "
        >
          Composer mon menu
        </button>
      </li>
    </ul>
  </div>
  <div class="fixed bottom-8 right-8">
      <RouterLink
          to="/panier"
          class="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition flex items-center gap-2"
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const burgers = ref([])

const getBurgers = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/burgers`)
    burgers.value = res.data
  } catch (err) {
    console.error('Erreur lors de la récupération des burgers :', err)
  }
}

const goToComposerMenu = (burgerId) => {
  router.push({
    name: 'ComposerMenu',
    params: { burgerId }
  })
}

onMounted(() => {
  getBurgers()
})
</script>

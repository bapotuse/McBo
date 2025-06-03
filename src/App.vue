<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'

const estConnecte = ref(false)
const utilisateur = ref(null)
const menuOuvert = ref(false)

const verifierStatutConnexion = () => {
  const utilisateurStocke = localStorage.getItem('utilisateur')
  if (utilisateurStocke) {
    utilisateur.value = JSON.parse(utilisateurStocke)
    estConnecte.value = true
  } else {
    utilisateur.value = null
    estConnecte.value = false
  }
}

const deconnexion = () => {
  localStorage.removeItem('utilisateur')
  estConnecte.value = false
  utilisateur.value = null
  window.location.href = '/'
}

onMounted(() => {
  verifierStatutConnexion()
})

window.addEventListener('storage', (e) => {
  if (e.key === 'utilisateur') {
    verifierStatutConnexion()
  }
})
</script>

<template>
  <header class="bg-white shadow-sm">
    <div class="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2">
        <img src="../src/assets/mcboLogo.png" width="40" alt="Logo" class="rounded-lg" />
        <span class="font-bold text-xl text-red-600 hidden sm:inline"></span>
      </RouterLink>

      <!-- Bouton Hamburger -->
      <button @click="menuOuvert = !menuOuvert" class="md:hidden text-gray-600 hover:text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Menu principal -->
      <nav class="hidden md:flex gap-6 items-center">
        <RouterLink to="/article" class="text-gray-700 font-semibold hover:text-red-600">Articles</RouterLink>
        <RouterLink to="/menu" class="text-gray-700 font-semibold hover:text-red-600">Menus</RouterLink>
        <RouterLink to="/panier" class="text-gray-700 font-semibold hover:text-red-600">Panier</RouterLink>
        <RouterLink
          v-if="estConnecte && utilisateur?.idTypeUtilisateur === 1"
          to="/prepa"
          class="text-gray-700 font-semibold hover:text-red-600"
        >
          Préparateur
        </RouterLink>
      </nav>

      <!-- Actions utilisateur -->
      <div class="hidden md:flex gap-4 items-center">
        <template v-if="!estConnecte">
          <RouterLink to="/connexion"
                      class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Se connecter
          </RouterLink>
          <RouterLink to="/inscription"
                      class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium hidden sm:block">
            S'inscrire
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink to="/mon-compte"
                      class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Mon compte
          </RouterLink>
          <button @click="deconnexion"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Déconnexion
          </button>
        </template>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-if="menuOuvert" class="md:hidden px-4 py-2 space-y-2 border-t border-gray-200 bg-white">
      <RouterLink to="/article" class="block text-gray-700 font-medium hover:text-red-600">Articles</RouterLink>
      <RouterLink to="/menu" class="block text-gray-700 font-medium hover:text-red-600">Menus</RouterLink>
      <RouterLink to="/panier" class="block text-gray-700 font-medium hover:text-red-600">Panier</RouterLink>
      <RouterLink
        v-if="estConnecte && utilisateur?.idTypeUtilisateur === 1"
        to="/prepa"
        class="block text-gray-700 font-medium hover:text-red-600"
      >
        Préparateur
      </RouterLink>

      <div class="pt-2 border-t border-gray-200">
        <template v-if="!estConnecte">
          <RouterLink to="/connexion"
                      class="block text-sm text-red-600 font-semibold py-1 hover:underline">
            Se connecter
          </RouterLink>
          <RouterLink to="/inscription"
                      class="block text-sm text-red-600 font-semibold py-1 hover:underline">
            S'inscrire
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/mon-compte"
                      class="block text-sm text-red-600 font-semibold py-1 hover:underline">
            Mon compte
          </RouterLink>
          <button @click="deconnexion"
                  class="w-full text-left text-sm text-red-600 font-semibold py-1 hover:underline">
            Déconnexion
          </button>
        </template>
      </div>
    </div>
  </header>

  <RouterView />
</template>

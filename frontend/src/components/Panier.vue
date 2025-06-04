<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Articles dans votre panier</h1>

    <div v-if="panier.length === 0" class="text-center text-gray-500">
      <p class="text-xl mb-4">Votre panier est vide.</p>
      <router-link to="/article" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Découvrir nos produits
      </router-link>
    </div>

    <div v-else>
      <ul class="space-y-4">
        <li v-for="(article, index) in panier" :key="index" class="bg-white rounded-lg shadow p-4">
        
          <div v-if="article.type === 'menu'">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-xl font-bold text-red-600">
                {{ article.nom }} (Taille {{ article.taille }})
              </h2>
              <div class="text-right font-semibold text-gray-800">
                {{ formatPrix(article.prix) }} €
              </div>
            </div>
            <ul class="pl-4 text-sm text-gray-700">
              <li><strong>Burger :</strong> {{ article.contenu.burger.nom }} - {{ article.contenu.burger.description }}</li>
              <li><strong>Boisson :</strong> {{ article.contenu.boisson.nom }} - {{ article.contenu.boisson.description }}</li>
              <li><strong>Frites :</strong> {{ article.contenu.frite.nom }} - {{ article.contenu.frite.description }}</li>
            </ul>
          </div>

          <div v-else class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold">{{ article.nom }}</h2>
              <p class="text-gray-600 text-sm">{{ article.description }}</p>
            </div>
            <div class="text-right font-semibold text-gray-800">
              {{ formatPrix(article.prix) }} €
            </div>
          </div>

          <div class="mt-2 text-right">
            <button @click="supprimerArticle(index)" class="text-red-600 hover:text-red-800 text-sm">
              Supprimer
            </button>
          </div>
        </li>
      </ul>

      <div class="mt-6 bg-gray-100 p-4 rounded-lg">
        <div class="flex justify-between items-center text-xl font-bold">
          <span>Total :</span> <span>{{ formatPrix(calculerTotal()) }} €</span>
        </div>
      </div>

      <button @click="commander"
              class="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded text-lg"
              :disabled="panier.length === 0 || loading">
        {{ loading ? "Traitement en cours..." : "Valider la commande" }}
      </button>
    </div>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const panier = ref([])       
const loading = ref(false)   

onMounted(() => {
  chargerPanier()
})

function chargerPanier() {
  const panierStocke = localStorage.getItem('panier')
  if (panierStocke) {
    try {
      panier.value = JSON.parse(panierStocke)  
    } catch (e) {
      console.error('Erreur lors du parsing du panier:', e)
      panier.value = []
      localStorage.removeItem('panier')       
    }
  }
}

function sauvegarderPanier() {
  localStorage.setItem('panier', JSON.stringify(panier.value))
}

function supprimerArticle(index) {
  panier.value.splice(index, 1) 
  sauvegarderPanier()             
}

function calculerTotal() {
  return panier.value.reduce((total, article) => {
    return total + parseFloat(article.prix || 0)
  }, 0)
}

function formatPrix(prix) {
  const numPrix = Number(prix)
  return isNaN(numPrix) ? prix : numPrix.toFixed(2)
}

async function commander() {
  if (panier.value.length === 0) return

  const utilisateur = localStorage.getItem('utilisateur')
  if (!utilisateur) {
    alert('Veuillez vous connecter pour passer commande.')
    router.push('/connexion')
    return
  }

  let userId
  try {
    const userObj = JSON.parse(utilisateur)
    userId = userObj.id
  } catch (e) {
    userId = utilisateur
  }

  if (!userId) {
    alert("Erreur d'authentification. Veuillez vous reconnecter.")
    router.push('/login')
    return
  }

  const total = calculerTotal()

  if (!confirm(`Confirmer la commande de ${formatPrix(total)} € ?`)) {
    return
  }

  loading.value = true

  try {
    const response = await axios.post(
      `http://localhost:3000/api/commande`,
      { panier: panier.value },
      {
        headers: {
          'user-id': userId,
          'Content-Type': 'application/json'
        }
      }
    )

    localStorage.removeItem('panier')
    panier.value = []

    alert(`Commande passée avec succès ! Numéro de commande : ${response.data.idCommande}`)
    router.push('/commandes')

  } catch (err) {
    console.error('Erreur lors de la commande :', err)
    if (err.response?.status === 401) {
      alert('Session expirée. Veuillez vous reconnecter.')
      localStorage.removeItem('utilisateur')
      router.push('/connexion')
    } else if (err.response?.status === 400) {
      alert(err.response.data.error || 'Erreur dans les données de la commande.')
    } else if (err.response?.status === 500) {
      alert('Erreur serveur. Veuillez réessayer.')
    } else {
      alert('Impossible de passer commande. Veuillez réessayer.')
    }
  } finally {
    loading.value = false
  }
}

</script>

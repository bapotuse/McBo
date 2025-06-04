<template>
  
  <div class="p-4 max-w-3xl mx-auto">  

    <router-link
      to="/commandes"
      class="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300 ease-in-out"
    >
      ← Retour aux commandes
    </router-link>
    <h1 class="text-2xl font-bold mb-4">Détail de la commande #{{ idCommande }}</h1>

    <div v-if="error" class="text-red-600">{{ error }}</div>
    <div v-else>
      <p><strong>Date :</strong> {{ formatDate(commande.date_commande) }}</p>
      <p><strong>Statut :</strong> {{ commande.statut }}</p>
      <p><strong>Adresse :</strong> {{ commande.adresse }}</p>
      <p><strong>Montant :</strong> {{ commande.montant }} €</p>

      <h2 class="mt-6 mb-2 font-semibold">Lignes de commande :</h2>
      <ul>
        <li v-for="(ligne, index) in commande.articles" :key="ligne.idLigneCommande" class="mb-2 border-b pb-2">
          <div><strong>Type :</strong> {{ ligne.type }}</div>
          <div><strong>Nom :</strong> {{ ligne.nom }}</div>
          <div><strong>Quantité :</strong> {{ ligne.quantite }}</div>
          <div v-if="ligne.type === 'menu' && ligne.typeMenu"><em>Menu type : {{ ligne.typeMenu }}</em></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const idCommande = route.params.idCommande

const commande = ref(null)
const error = ref(null)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' })
}

async function fetchCommande() {
  error.value = null;
  try {
    const utilisateurStr = localStorage.getItem('utilisateur');
    if (!utilisateurStr) throw new Error("Utilisateur non connecté");

    const utilisateur = JSON.parse(utilisateurStr);

    const response = await fetch(`https://mcbo.onrender.com/api/commande/${idCommande}`, {
      headers: {
        'Content-Type': 'application/json',
        'user-id': utilisateur.id
      }
    });

    if (!response.ok) {
      const dataErr = await response.json().catch(() => null);
      throw new Error(dataErr?.error || 'Erreur lors du chargement');
    }

    const data = await response.json();
    commande.value = data;

  } catch (err) {
    error.value = err.message;
  }
}

onMounted(() => {
  fetchCommande()
})
</script>

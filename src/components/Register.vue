<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const nom = ref('')
const prenom = ref('')
const adresse = ref('')
const telephone = ref('')
const email = ref('')
const motDePasse = ref('')
const erreur = ref('')

const inscrire = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      nom: nom.value,
      prenom: prenom.value,
      adresse: adresse.value,
      telephone: telephone.value,
      email: email.value,
      password: motDePasse.value
    })

    if (response.data) {
      router.push('/connexion')
    }
  } catch (error) {
    erreur.value = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
  }
}
</script>

<template>
  <div class="flex flex-col items-center mt-32 px-6 py-8 mx-auto md:h-screen lg:py-0">
    <div class="w-full max-w-4xl bg-white rounded-lg shadow md:mt-0 xl:p-0">
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
          Inscrivez-vous
        </h1>
        <div v-if="erreur" class="text-red-500 mb-3">{{ erreur }}</div>
        <form @submit.prevent="inscrire" class="grid grid-cols-1 md:grid-cols-3 gap-6" action="#">
          <div>
            <label for="nom" class="block mb-2 text-sm font-medium text-gray-900 ">Nom</label>
            <input v-model="nom" type="text" name="nom" id="nom" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Dupont" required="">
          </div>
          <div>
            <label for="prenom" class="block mb-2 text-sm font-medium text-gray-900 ">Prenom</label>
            <input v-model="prenom" type="text" name="prenom" id="prenom" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Frédéric" required="">
          </div>
          <div>
            <label for="adresse" class="block mb-2 text-sm font-medium text-gray-900 ">Adresse</label>
            <input v-model="adresse" type="text" name="adresse" id="adresse" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="4 rue du palmier" required="">
          </div>
          <div>
            <label for="telephone" class="block mb-2 text-sm font-medium text-gray-900 ">Numéro de téléphone</label>
            <input v-model="telephone" type="text" name="telephone" id="telephone" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="06 12 34 56 78" required="">
          </div>
          <div>
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 ">Email</label>
            <input v-model="email" type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="exemple@test.com" required="">
          </div>
          <div>
            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 ">Mot de passe</label>
            <input v-model="motDePasse" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required="">
          </div>
          <div class="col-span-full">
            <button type="submit" class="w-full text-white bg-[#fca81c] hover:cursor-pointer hover:bg-[#e89613] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Inscription</button>
          </div>
          <p class="text-sm text-gray-500 col-span-full">
            Vous avez déjà un compte? <RouterLink to="/connexion" class="font-medium text-primary-600 hover:underline">Connectez-vous</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

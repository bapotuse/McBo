import { createRouter, createWebHistory } from 'vue-router';
import Article from '../components/Article.vue';
import Accueil from '../components/Accueil.vue';
import Connexion from "../components/Connexion.vue";
import Register from '../components/Register.vue';
import Compte from '../components/Compte.vue';
import ComposerMenu from '../components/ComposerMenu.vue';
import Panier from '../components/Panier.vue';
import Commandes from '../components/Commandes.vue';
import DetailCommande from '../components/DetailCommande.vue' 
import Menu from '../components/Menu.vue';
import Preparateur from '../components/Preparateur.vue';

const routes = [
  {
    path: '/article',
    name: 'Article',
    component: Article,
  },
  {
    path: '/',
    name: 'Accueil',
    component: Accueil
  },
  {
    path :'/connexion',
    name: 'Connexion',
    component: Connexion
  },
  {
    path: '/inscription',
    name: 'Inscription',
    component: Register
  },
  {
    path: '/mon-compte',
    name: 'MonCompte',
    component: Compte
  },
  {
    path: '/panier',
    name: 'Panier',
    component: Panier
  },
  {
    path: '/commandes',
    name: 'Commandes',
    component: Commandes
  },
  {
    path: '/commandes/:idCommande',
    name: 'DetailCommande',
    component: DetailCommande,
    props: true
  },
  { 
    path: '/menu', 
    name: 'Menu', 
    component: Menu 
  },
  { 
    path: '/composer-menu/:burgerId', 
    name: 'ComposerMenu', 
    component: ComposerMenu 
  },
  {
    path:'/prepa',
    name: 'Preparateur',
    component: Preparateur
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

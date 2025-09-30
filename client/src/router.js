import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/meals',
    name: 'Meals',
    component: () => import('./views/Meals.vue')
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: () => import('./views/Workouts.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./views/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
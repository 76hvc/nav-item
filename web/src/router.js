import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import('./views/Home.vue');
const Admin = () => import('./views/Admin.vue');
const QuickAdd = () => import('./views/QuickAdd.vue');

const routes = [
  { path: '/', component: Home },
  { path: '/admin', component: Admin },
  { path: '/quick-add', component: QuickAdd }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('./views/Main.vue'),
    },
    {
      path: '/home',
      component: () => import('./layouts/Main.vue'),
      children: [
        {
          name: 'home',
          path: '/home',
          component: () => import('./views/pages/Home.vue'),
        },
        {
          name: 'search',
          path: '/search',
          component: () => import('./views/pages/Search.vue'),
        },
        {
          name: 'countries',
          path: '/countries',
          component: () => import('./views/pages/Countries.vue'),
        },
        {
          name: 'percel',
          path: '/percel',
          component: () => import('./views/pages/Percel.vue'),
        },
        {
          name: 'profile',
          path: '/profile',
          component: () => import('./views/pages/Profile.vue'),
        },
      ],
    },
    {
      path: '/settings',
      component: () => import('./views/pages/Settings.vue'),
    },
    {
      path: '/index',
      component: () => import('./views/Index.vue'),
    },
    {
      path: '/login',
      component: () => import('./views/Login.vue'),
    },
    // {
    //   path: "/register",
    //   component: () => import("./views/Register.vue"),
    // },
  ],
});

export default router;

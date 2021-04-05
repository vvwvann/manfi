import Vue from 'vue';
import App from './App.vue';

import router from '@/router';
import axios from '@/axios.js';

import Fragment from 'vue-fragment';
import vuescroll from 'vuescroll';

import '@/assets/styles/css.css';

Vue.use(vuescroll);
Vue.use(Fragment.Plugin);
Vue.prototype.$axios = axios;
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');

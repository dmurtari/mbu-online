import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import VuePaginate from 'vue-paginate';
import VTooltip from 'v-tooltip'

import App from './App.vue';

import store from './store';
import routes from './router';
import components from './components';
import filters from './filters';

import './assets/sass/main.scss';

Vue.use(VueRouter);
Vue.use(Vuelidate);
Vue.use(VuePaginate);
Vue.use(VTooltip)

components(Vue);
filters(Vue);

export const router = new VueRouter({
  mode: 'history',
  routes: routes,
  linkActiveClass: 'is-active'
});

router.beforeEach((to, from, next) => {
  if (!localStorage.getItem('token')) {
    return next();
  }

  if (to.meta.title) {
    document.title = 'MBU Online | ' + to.meta.title;
  } else {
    document.title = 'MBU Online';
  }

  return next();
});

new Vue({
  router,
  store,
  el: '#app',
  components: { App }
});

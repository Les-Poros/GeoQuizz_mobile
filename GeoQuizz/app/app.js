/* app.js a utiliser avec le dossier router*/
import Vue from "nativescript-vue";

import router from "./router";

Vue.prototype.$router = router
Vue.prototype.$goTo = function (to){
    this.$navigateTo(this.$router[to])
}

new Vue({
    render : h => h('frame', [h(router['home'])])
}).$start();

/* app.js a utiliser avec VueRouter
import Vue from "nativescript-vue";
import VueRouter from "vue-router";

import Home from "./components/Home";
import Picture from "./components/Picture";

Vue.use(VueRouter);

const routes = [
    { name: 'Home', path: '/home', component: Home},
    { name: "Picture", path: '/picture', component: Picture },
];

const router = new VueRouter({
    routes
});


router.replace('/home');

new Vue({
    router
}).$start();*/
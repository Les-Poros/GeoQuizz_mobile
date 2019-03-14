/* app.js a utiliser avec le dossier router*/
import Vue from "nativescript-vue";

import router from "./router";

import conf from "./conf/conf.json";

Vue.prototype.$router = router
Vue.prototype.$goTo = function (to, option) {
    this.$navigateTo(this.$router[to], option)
}

new Vue({
    data: {
        apiUrl: conf.apiUrl
    },
    render: h => h('frame', [h(router['home'])])
}).$start();
// import Vue from 'vue';
// import Vuex from 'vuex';
import actions from "./actions";
import mutations from "./mutations";
import { getDaysBefore } from "@utils/index";
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        v: "V1.0.0",
        appKey: "00001",
        newDate(num = 2, type = true) {
            // 1:年 2:月 3:日
            let date = new Date();
            let year = date.getFullYear().toString();
            let month = (date.getMonth() + 1).toString();
            let day = date.getDate().toString();
            if (type && month.length < 2) {
                month = "0" + month;
            }
            if (type && day.length < 2) {
                day = "0" + day;
            }
            if (num === 1) {
                return year;
            } else if (num === 2) {
                return month;
            } else {
                return day;
            }
        },
        defaultTime1: [getDaysBefore(true, undefined, 60) + ' 00:00:00', getDaysBefore(true, undefined, 0) + ' 23:59:59'],
    },
    mutations,
    actions,

})

export default store;
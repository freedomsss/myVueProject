import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  count: 0
}

export default new Vuex.Store({
  state,
  mutations: {
    increment: state => state.count++,
    decrement: state => state.count--
  }
})

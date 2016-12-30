import * as TYPES from '../../store/types'

const state = {
  results: [],
  results_pagination: {},
  result: {}
}
const mutations = {
  [TYPES.RESULTS_SET_DATA] (state, obj) {
    state.results = obj.results
    state.results_pagination = obj.results_pagination
  },
  [TYPES.RESULT_SET_DATA] (state, result) {
    state.result = result
  }
}
const actions = {
  resultsSetData ({ commit }, obj) {
    commit(TYPES.RESULTS_SET_DATA, obj)
  },
  resultSetData ({ commit }, result) {
    commit(TYPES.RESULT_SET_DATA, result)
  }
}
const module = {
  state,
  mutations,
  actions
}
export default { module }

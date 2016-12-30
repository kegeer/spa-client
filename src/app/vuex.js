import { isFunction } from 'lodash'
import { vuex as Batches } from './batches'
import { vuex as Projects } from './projects'
import { vuex as Experiments } from './experiments'
import { vuex as Qcs } from './qcs'

const vuex = { Qcs, Experiments, Projects, Batches }
const keys = Object.keys(vuex)

const modules = keys.reduce((acc, key) => ({ ...acc, [key]: vuex[key].module }), {})
const plugins = keys.reduce((acc, key) => [...acc, vuex[key].plugin], []).filter(isFunction)

export default { modules, plugins }

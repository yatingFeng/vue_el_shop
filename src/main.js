import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/plugins/element.js'
// 导入字体图标
import '@/assets/fonts/iconfont.css'
// 导入全局样式表
import '@/assets/css/global.css'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// 树形菜单
import TreeTable from 'vue-table-with-tree-grid'
// 编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)


import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 通过axios请求拦截添加token,挂载Authorization请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

// 定义一个过滤器(名称为：fateFormat)，格式化时间
// 传入一个参数，格式化一下时间
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  //月份是从0开始，所以+1 
  // padStart补充为2位字符，不足的补字符0 （参数一定为字符串，不是字符串的转为字符串）
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() +'').padStart(2,'0')
  const hh = (dt.getHours() +'').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

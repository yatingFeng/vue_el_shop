import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/login.vue'
import Home from '@/components/home.vue'
import Welcome from '@/components/welcome.vue'
import Users from '@/components/user/users.vue'


Vue.use(VueRouter)

const routes = [
  // 重定向(当访问‘/’时，跳转到‘/login’)
  {
    path:'/',
    redirect:'/login'
  },
  // 设置登录的路由
  {
    path:'/login',
    component:Login
  },
  // 设置主页的路由
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/users',
        component:Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach( (to,from,next) => {
// to将要访问的路径  from代表从哪个路径来  next是一个函数，表示放行
// next()放行    next('/login')强制跳转
  // 如果要访问的路径是登录页，直接放行
  if(to.path === '/login') return next()
  // 如果要访问的不是登录页，就要看看有没有token.
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token为false(不存在),就强制跳转到登录页
  if(!tokenStr) return next('/login')
  // 如果token存在，直接放行
  next()
})

export default router

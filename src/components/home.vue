<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="@/assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <div>
        <el-button type="info" @click="logout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <!-- 左边侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle-button" @click="toggleCollapse">
           <i :class="isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left' "></i>
        </div>
        <el-menu
          background-color="rgb(49, 55, 67)"
          text-color="#fff"
          active-text-color="rgb(53, 155, 255)"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" 
              v-for="subItem in item.children" 
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 用来存放左侧菜单数据的数组
      menuList: [],
      iconsObj: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      // 是否折叠
      isCollapse:false,
      // 被激活的链接地址
      activePath:'',
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出时qa，清空token,并重定向到登录页
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // handleOpen(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    // handleClose(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // 先判断获取是否失败，如果获取失败返回错误信息
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      // 将接口中获取到的菜单数据数组赋值给data中的menuList
      this.menuList = res.data;
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath){
       window.sessionStorage.setItem('activePath',activePath);
       this.activePath = activePath
    },
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(53, 60, 62);
  display: flex;
  justify-content: space-between;
  color: #fff;
  align-items: center;
  padding-left: 0;
  font-size: 24px;
  font-family: "Courier New";
  > div {
    display: flex;
    align-items: center;
    img {
      width: 50px;
      height: 50px;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: rgb(49, 55, 67);
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(233, 237, 241);
}
.iconfont {
  margin-right: 10px;
}
.toggle-button{
  background-color:rgb(71, 81, 101);
  font-size: 20px;
  line-height: 35px;
  color:#fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
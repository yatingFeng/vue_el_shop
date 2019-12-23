<template>
  <div>logout
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods:{
    // 退出时，清空token,并重定向到登录页
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
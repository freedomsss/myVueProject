<template>
  <header>
    <div class="container">
      <router-link class="logo" to="/" title="富宝袋后台管理系统">
        <img src="../../assets/images/logo_white.png" alt="富宝袋管理后台" width="120">
        <h1 class="title">
          富金富门户系统
        </h1>
      </router-link>
      <div class="user">
        {{ admin }}
        <span class="logout" @click="loginOut">退出</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TopBar',
  data() {
    return {
      flag: true,
    };
  },
  props: {
    admin: {
      type: String,
    },
  },
  methods: {
    loginOut() {
      localStorage.removeItem('token');
      localStorage.removeItem('realName');
      localStorage.removeItem('uiPermissions');
      this.$cookie.delete('token', this.config.domain, '/');
      this.$cookie.delete('realName', this.config.domain, '/');
      this.$bus.$emit('loginBox');
    },
  },
};
</script>

<style lang="less" scoped>
  @import "../../assets/less/common.less";

  header {
    position: relative;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 60px;
    color: #fff;
    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: fixed;
      width: 100%;
      height: 60px;
      line-height: 60px;
      padding: 0 20px;
      background-color: @mainColor;
      box-sizing: border-box;
      // box-shadow: 0 0 10px 0 rgba(141,175,247,0.36);
      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #fff;
        h1 {
          padding-left: 40px;
          font-weight: normal;
        }
      }
      .user {
        color: #fff;
        .logout {
          margin-left: 20px;
          color: #fff;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
</style>

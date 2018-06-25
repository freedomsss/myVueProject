<template>
  <div class="hello">
    <p>{{count}}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <div class="box"></div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  computed: {
    count () {
      return this.$store.state.count
    }
  },
  created () {
    this.postData()
  },
  methods: {
    increment () {
      this.$store.commit('increment')
    },
    decrement () {
      this.$store.commit('decrement')
    },
    do_connect ()
    {
        if(!dal.frontServer._connected) {
            dal.frontServer.registerServerCodesHandler(dal.frontServer.onServerCodes, dal.frontServer);
            // dal.frontServer.doConnect("ws://" + window.location.hostname + ":" + window.location.port + "/gateway");
            dal.frontServer.doConnect("ws://" + 'hk.douhuu.com:8666' + "/gateway");
        }
    },
    postData () {
      dal.frontServer.evtClose.attach(() => {
          // 断线5秒后自动连接
          setTimeout('do_connect()',5000)
      },this);
      this.do_connect()
      dal.frontServer.registerNotifyHandler('common',function(data){
          console.log(data)
          if(data.type === 'user_info') {
              dal.frontServer.user = data.data;
          }
          else if(data.type === 'user_asset'){
              dal.frontServer.user_asset = data.data;
          }
      },this);
      const username = '123'
      const password = '123456'
      dal.frontServer.login(username,password,function(result){
          if(result.rc=="ok"){
              load_main();
          }
          else{
              msg(result.msg);
          }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  body {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hello{
    font-size: 20px;
  }
  .box{
    outline: solid 2px;
    max-width: 15em;
    max-height: 10em;
  }
  @root:2em;
  .box{
    position: relative;
    &::before{
      content: '';
      position: absolute;
      padding: @root;
      box-shadow: 0 0 7px #b53;
      background-color: #95a;
    }
  }
</style>

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
  methods: {
    increment () {
      this.$store.commit('increment')
    },
    decrement () {
      this.$store.commit('decrement')
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

<template>
  <div id="appcontianer">
    <Parent />
  </div>
</template>

<script>
import Parent from './components/postmessage/parent.vue';
export default {
  name: 'App',
  components: {
    Parent,
  },
  data() {
    return {
      worldname:'中世纪'
    }
  },
}
</script>

<style>
#appcontianer {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

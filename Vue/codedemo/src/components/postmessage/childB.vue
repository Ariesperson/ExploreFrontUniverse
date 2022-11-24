<template>
    <div  class="Child">
        <h1>我是{{name}}  </h1>
        <div>领土: {{land}} </div>
        <div>兵力：{{soldier}} </div>
        <div>金钱: {{money}}  </div>
        <div>我的王国是 </div>
        <!-- <grandChild/> -->
    </div>
</template>
<script>
import grandChild from './grandchild.vue'
export default {
  name: 'ChildB',
  components: {
    grandChild
  },
  data() {
    return {
      name:'爱尔兰公爵领B',
      land:2000,
      soldier:3000,
      money:2000,
      kingdomName:''
    }
  },
  created() {
  },  
  computed: {
    
  },
  methods: {
      getName(){
        return this.name
      }
  },
}
</script>
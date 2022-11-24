<template>
    <div class="grandChild">
        <h1>我是{{name}}  </h1>
        <div>领土: {{land}} </div>
        <div>兵力：{{soldier}} </div>
        <div>金钱: {{money}}  </div>
        <div>我的王国是 </div>
        <button @click="checkworld">查看世界</button>
        <!-- <div>
            我的公爵领是{{lordname}} 
        </div>
        <div>
            我的王国是{{kingdomname}} 
        </div> -->
        <div v-if="worldname">
            我的世界是{{worldname}}
         </div>
    </div>
</template>
<script>

export default {
  name: 'grandChild',
  components: {
  },
  data() {
    return {
      name:'爱尔兰男爵领',
      land:1000,
      soldier:1000,
      money:500,
      worldname:'',
    }
  },
  created() {

    // this.$root.data
  },  
  mounted() {
      console.log(this.$root.worldname)
      debugger
  },
  computed: {
     lordname(){
        return this.$parent.name
     },
     kingdomname(){
        // return this.$refs.kindow.getName()
     },
    
  },
  methods: {
   checkworld(){
      this.worldname = this.$root.worldname
   }
  },
}
</script>
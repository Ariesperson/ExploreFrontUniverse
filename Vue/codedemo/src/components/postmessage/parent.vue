<template>
    <div ref="kindom" class="Parent">
        <h1>我是{{name}}  </h1>
        <div>领土: {{land}} </div>
        <div>兵力：{{soldier}} </div>
        <div>金钱: {{money}}  </div>
        <button @click="checkland">查看领土</button>
        <div v-if="displayLand">
          我拥有公爵领：{{lordname}}
          <!-- 我拥有男爵领: {{}} -->
        </div>
        <Child ref="lord"/>
        <ChildB/>
    </div>
</template>
<script>
import Child from './child.vue'
import ChildB from './childB.vue'
export default {
  name: 'Parent',
  
  components: {
    Child,
    ChildB
  },
  data() {
    return {
      kingdomname:'爱尔兰王国',
      name:'爱尔兰王国',
      land:10000,
      soldier:8000,
      money:10000,
      displayLand:false,
      lordname:''
    }
  },
  provide(){
    return{
      kingdomname:()=>{
        return this.kingdomname
      }
    }
    
  },  
  watch: {
    
  },
  computed: {
  },
  methods: {
    checkland(){
      console.log(this.$children)
      this.lordname = ''
      let str  = ''
      this.$children.forEach(element => {
        debugger
        str=str+','+element.name
      });
      this.lordname = str
      this.displayLand = true
    }
  },
}
</script>
let Vue;
// install 方法设置， 因为
const install = (v) =>{
    Vue = v
    Vue.mixin({
        beforeCreate() {
            if (this.$options && this.$options.store) {
                // 根页面，直接将身上的store赋值给自己的$store，
                //  这也解释了为什么使用vuex要先把store放到入口文件main.js里的根Vue实例里
                this.$store = this.$options.store;
            } else {
                // 除了根页面以外，将上级的$store赋值给自己的$store
                this.$store = this.$parent && this.$parent.$store;
            }
        },
    })
}
class Store{
    constructor(options){
        //state
        this.vm = new Vue({
            data:{
                state:options.store
            },
        });
        //getter
        let getters = options.getters || {}
        this.getters = {}
        Object.keys(getters).forEach((getterName)=>{
            Object.defineProperties(this.getters,getterName,{
                get:()=>{
                    return getters[getterName](this.state)
                }
            })
        })
        // mutation
        let mutations = options.mutations || {};
        this.mutations = {};
        Object.keys(mutations).forEach(mutationName => {
            this.mutations[mutationName] = payload => {
                mutations[mutationName](this.state, payload);
            }
        })
        // action
        let actions = options.actions || {};
        this.actions = {};
        Object.keys(actions).forEach(actionName => {
            this.actions[actionName] = payload => {
                actions[actionName](this.state, payload);
            }
        })
    }
    // 获取state时，直接返回
    get state(){
        return this.vm.state
    }
    // commit方法，执行mutations的'name'方法
    commit(name,payload){
        this.mutations[name](payload)
    }
    // dispatch方法，执行actions的'name'方法
    dispatch(name,payload){
        this.actions[name](payload)
    }
}
// 把install方法和类Store暴露出去
export default {
    install,
    Store
}
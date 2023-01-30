# Vue
mvvm渐进式框架model view viewmodel  model代表数据层 view代表UI层 viewModel代表数据驱动试图
优点：

低耦合、数据model和view低耦合

可重用、不同view的现实可以复用model的逻辑

独立开发、后端、设计、前端分工明确

可测试性 

## vue全部生命周期

vue实例在创建时会经过一系列初始化的过程，在我们的日常开发中需要在某一阶段去触发一些业务逻辑完成一些动作和事件。因此我们需要用到这些生命周期。

- `create阶段`：vue实例被创建
   `beforeCreate`: 创建前，此时data和methods中的数据都还没有初始化
   `created`： 创建完毕，data中有值，未挂载
- `mount阶段`： vue实例被挂载到真实DOM节点
   `beforeMount`：可以发起服务端请求，去数据
   `mounted`: 此时可以操作DOM
- `update阶段`：当vue实例里面的data数据变化时，触发组件的重新渲染
   `beforeUpdate` :更新前
   `updated`：更新后
- `destroy阶段`：vue实例被销毁
   `beforeDestroy`：实例被销毁前，此时可以手动销毁一些方法
   `destroyed`:销毁后

#### 



## vue多种组件通信方式

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bf775050e1f948bfa52f3c79b3a3e538~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

1.父传子：props  子传父：$emit  和自定义事件

2.$parent $children获取当前组件的父组件和子组件

3.$root

4.ref

5.eventbus

6.vuex和pinia状态管理机

7.$attrs

8.provide 和 inject

- 父子组件
  - `props`/`$emit`/`$parent`/`ref`/`$attrs`
- 兄弟组件
  - `$parent`/`$root`/`eventbus`/`vuex`
- 跨层级关系
  - `eventbus`/`vuex`/`provide`+`inject`

## vue2/3diff算法差异，实现方式

vue3diff算法

简单diff算法

实现思路：

1.比较新旧children的长度。公共长度common length,即较短的那一组子节点的长度。然后旧的比较长就卸载，新的比较长就挂载。这减少dom操作次数，减少了性能开销。

2.key的使用和type的判断：通过给虚拟dom设置key值建立映射关系。并判断key和node.type值找到可以复用的dom

3.找到需要移动的dom元素

判断是自节点的type类型、key值以及

快速diff算法



## vue2/vue3差异



## vue/react差异

## 服务端渲染原理

## vue3响应式系统实现原理，proxy缺陷（主要是基础类型需要额外包装一层带来的.value的用法）

proxy只能代理对象类型不能代理基础值类型，所以vue3为了解决这个缺陷设计了ref，即使用一层对象包裹基础值类型，再通过proxy代理这个包裹的对象的形式来实现响应式。即把这个基础值类型的变量赋值给这个被包裹的对象的value属性。





## 内置组件原理：keepalive>transition>teleport

## vue3编译优化（动态节点、静态提升等）

## watch、computed区别，底层区别

```vue
<template>
  <div class="hello">
      {{fullName}}
  </div>
</template>

<script>
export default {
    data() {
        return {
            firstName: '蒙奇D',
            lastName: "路费"
        }
    },
    props: {
      msg: String
    },
    computed: {
        fullName() {
            return this.firstName + ' ' + this.lastName
        }
    },
    watch:{
    
	}
}
</script>

```

watch

computed



## vue中的性能优化方式（key/v-once/v-memo/Object.freeze/()=>import()）



## vuex实现原理（递推到pinia）

```javascript
let Vue;
// install 方法设置， 因为
const install = (v) =>{
    Vue = v
    Vue.mixin({
        beforeCreate() {
            if (this.$options && this.$options.store) {
                // 根页面，直接将身上的store赋值给自己的$store，
                这也解释了为什么使用vuex要先把store放到入口文件main.js里的根Vue实例里
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
```



# js

## 实现deepClone  new 防抖节流、检测datatype、lazyman

实现deepClone

```javascript
function deepClone(source,map = new WeakMap()){
    const iterations = ['[object Object]','[object Array]','object [Map]','[object Set]']
    if(source === null) return source
    const type = Object.prototype.toString.call(source)
    //处理不可遍历对象
    if(!iterations.includes(type)){
         // 处理日期
      if (type === 'date') return new Date(source)
  
      // 处理正则
      if (type === 'regexp') return new RegExp(source)
  
      // 处理 Symbol
      if (type === '[object Symbol]') return Symbol(source.description)
        
      return source
    }
    //处理可遍历对象
        // 处理循环引用，防止死循环
        if (map.get(source)) {
            return source // 如果已经处理过，则直接返回，不再遍历
        } else {
            map.set(source, target)
        }
        // 处理 Map
        if (type === '[object Map]') {
            let target = new Map() // {} | [] | Map(0) | Set(0)
            source.forEach((value, key) => {
                target.set(key, deepClone(value))
            })
            return target
        }
        // 处理 Set
        if (type === '[object Set]') {
            let target = new Set()
            source.forEach(value => {
                target.add(deepClone(value))
            })
            return target
        }
        //处理对象和数组
        if(type === '[object Array]'){
            let target = []
            source[key].forEach(element => {
                target.push(deepcopy(element))
            });
            return target
        }
        if(type === '[object Object]'){
            let target = {}
            for (const key in source) {
                target[key] = deepcopy(source[key])
            }
            return target 
        }
    //处理基本值类型
    return target
}
```

防抖

```javascript
functiondebounce(fn,delay = 1000){
    let timer = null
    return function (...args) {
       if(timer) clearTimeout(timer)
       timer = setTimeout(()=>{
         fn.apply(this,_args)
       },delay)
    }
}
```

节流

```javascript
function throttle(fn,delay = 1000){
   let timer = null
   return function (...args) {
       if(timer) return
       timer = setTimeout(()=>{
         fn.apply(this,args)
       },delay)
    }
}
```

检测dataType

```javascript
function getType (target){
    var dataType = new Map([
        ['[object Null]' , 'null'],
        ['[object Undefined]' , 'undefiend'],
        ['[object Boolean]' , 'boolean'],
        ['[object Number]' , 'number'],
        ['[object String]' , 'string'],
        ['[object Function]' , 'function'],
        ['[object Array]' , 'array'],
        ['[object Date]' ,'date'],
        ['[object RegExp]' , 'regexp'],
        ['[object Object]' , 'object'],
        ['[object Error]' , 'error'],
        ['[object Symbol]' , 'error']
    ]);
    let toString = Object.prototype.toString
    if(dataType.has(toString.call(target))){
        return dataType.get(toString.call(target))
    }else{
        return 'unknown type'
    }
}
```

lazyman

```javascript
class _LazyMan{
    constructor(name){
        this.tasks = []
        const task = ()=>{
            console.log(`Hi! This is ${name}!`)
            this.next()
        }
        this.tasks.push(task)
        setTimeout(() => {               // 把 this.next() 放到调用栈清空之后执行
            this.next();
        }, 0);
    }
    next(){
        const task = this.tasks.shift()//出栈
        task && task()
    }
    sleep(){
        this.sleepaction(timer)
        return this
    }
    eat(name){
        const task = ()=>{
            console.log(`Eat ${name}~`) 
        }
        this.tasks.push(task);  
        return this
    }
    sleepFirst(timer){
        this.sleepaction(timer,true)
        return this
    }
    sleepaction(timer,isfirst=false){
        const task = ()=>{
            setTimeout(()=>{
                console.log(`Wake up after ${timer}`)
                this.next()
            },timer*1000)
        }
        if(isfirst){
            this.tasks.unshift(task);  
        }else{
            this.tasks.push(task);  
        }
    }

}
function LazyMan(name) {
    return new _LazyMan(name)
}

```



## 经典原型、闭包作用域、提升、内存泄漏 this、浮点数精度丢失



## Symbol使用场景：避免键冲突、Symbol.toStringTag



## toPrimitive、Symbol.iterator



## Generator+yield，以及使用它实现async/await



## 事件循环



## proxy、reflect怎么使用



# 算法

链表数组各个操作的时间复杂度

快排、归并排序区别，实现原理

二分法，N查树算法使用场景

DFS、BFS区别

树和链表有什么区别

对算法的看法

如果刷题，对前端的推荐：树(处理嵌套结构DFS、BFS)、排序算法（功利向）、二分法、双指针

# 浏览器

HTTP与https区别

对称加密、非对称加密，常见加密算法

http状态码100~5xx

http三次握手、https四次握手、挥手

浏览器打开页面到解析全过程

缓存



# CSS

这个随缘，8想列了



# Node问的少

express/koa区别，洋葱模型实现方式，在什么地方有类似的实现（redux）

node多线程怎么实现

Docker就提了一下

前端通过Docker构建的流程，多阶段构建的方式

和K8S什么关系

# 其他

DP设计模式（Proxy代理模式，Generator状态机）

Domain Drive Development之类的名词概念

对低代码平台的认识看法，实现大致步骤




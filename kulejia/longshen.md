# Vue

## vue全部生命周期、

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

## vue2/vue3差异

1、

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



# js

## 实现deepClone/new防抖节流、检测datatype、lazyman

## 经典原型闭包作用域、提升、内存泄漏 this、浮点数精度丢失

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
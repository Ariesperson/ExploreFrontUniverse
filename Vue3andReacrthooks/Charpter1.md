# Vue3好在哪儿

## Vue2存在的问题

1.随着功能的增长，复杂组件的代码变得越来越难以维护。 尤其发生你去新接手别人的代码时。 根本原因是 Vue 的现有 API 通过「选项」组织代码，但是在大部分情况下，通过逻辑考虑来组织代码更有意义。

2.缺少一种比较「干净」的在多个组件之间提取和复用逻辑的机制。

3.类型推断不够友好。

## vue3六大亮点

**Performance**：通过`Proxy`实现双向响应式绑定，相比`defineProperty`的遍历属性的方式效率更高，性能更好，另外`Virtual DOM`只更新diff动态部分、事件缓存等，也带来了性能上的提升

**Tree-Shaking Support**：相比2.x导入整个Vue对象，3.x支持按需导入，只打包需要的代码（react现在也支持）

**Composition API**：组合式API，面向函数编程

**Fragment、Teleport、Suspense**：“碎片”，`Teleport`即Protal传送门，“悬念”，参考了React的设计

**Better Typescript support**：2.x设计之初没有考虑到类型推导，导致适配ts比较困难，3.x移除了this对象，利用了天然对类型友好的普通变量与函数，对TypeScript支持更好

**Custom Render API**：提供了自定义渲染API

## Vue2与 Vue3的对比

### Options-Api

```vue
<template>
  <div>
    <div v-if="error">failed to load</div>
    <div v-else-if="loading">loading...</div>
    <div v-else>hello {{fullName}}!</div>
  </div>
</template>

<script>
import { createComponent, computed } from 'vue'
export default {
  data() {
    // 集中式的data定义 如果有其他逻辑相关的数据就很容易混乱
    return {
        data: {
            firstName: '',
            lastName: ''
        },
        loading: false,
        error: false,
    },
  },
  async created() {
      try {
        // 管理loading
        this.loading = true
        // 取数据
        const data = await this.$axios('/api/user')
        this.data = data
      } catch (e) {
        // 管理error
        this.error = true
      } finally {
        // 管理loading
        this.loading = false
      }
  },
  computed() {
      // 没人知道这个fullName和哪一部分的异步请求有关 和哪一部分的data有关 除非仔细阅读
      // 在组件大了以后更是如此
      fullName() {
          return this.data.firstName + this.data.lastName
      }
  }
}
</script>

```

### Components Api

```vue
<template>
  <div>
    <div v-if="error">failed to load</div>
    <div v-else-if="loading">loading...</div>
    <div v-else>hello {{fullName}}!</div>
  </div>
</template>
<script>
import {  ref,reactive,defineComponent  } from 'vue'
export default defineComponent({
  setup{
    let data = reactive({
    	firstName: '',
        lastName: ''
	})
    let loading = ref(false)
    let error = ref(false)
  }
 
  async created() {
      try {
        // 管理loading
        loading = true
        // 取数据
        const sourcedata = await this.$axios('/api/user')
        data = sourcedata
      } catch (e) {
        // 管理error
        error = true
      } finally {
        // 管理loading
        loading = false
      }
  },
  computed() {
      // 没人知道这个fullName和哪一部分的异步请求有关 和哪一部分的data有关 除非仔细阅读
      // 在组件大了以后更是如此
      fullName() {
          return this.data.firstName + this.data.lastName
      }
  }
})
</script>
```



### Setup语法糖

```vue
<template>
  <div>
    <div v-if="error">failed to load</div>
    <div v-else-if="loading">loading...</div>
    <div v-else>hello {{fullName}}!</div>
  </div>
</template>

<script setup>
import { createComponent, computed } from 'vue'
import useSWR from 'vue-swr'
  // useSWR帮你管理好了取数、缓存、甚至标签页聚焦重新请求、甚至Suspense...
  const { data, loading, error } = useSWR('/api/user', fetcher)
  // 轻松的定义计算属性
  const fullName = computed(() => data.firstName + data.lastName)
  return { data, fullName, loading, error }
</script>

```


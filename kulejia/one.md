## 1.讲一下盒模型

css盒模型本质上是一个盒子，这个盒子包括边距(padding)、边框(border)、填充(content)和实际内容。

我所知道的盒模型有两种:

一种是W3C标准盒模型：一个盒子的总宽度=width+margin+padding+border

一种是IE盒子模型（怪异盒子模型）:  一个盒子的总宽度=width（包含padding和border）+margin。

## 2.讲一下HTML语义化、SEO

html语义化的概念是指合理得使用语义化标签创建页面结构，

语义化标签有：header nav main article section aside footer

语义化的优点：代码结构清晰、有利于搜索引擎搜索、没有css也能呈现很好的结构效果、利于开发和维护。

## 3.讲一下对于Flex布局的理解

flex布局是弹性布局的一种技术方案、为我们的css盒子提供最大的灵活性。主要用的话其实就是看是要用容器属性还是元素属性。

容器：flex-direction  algin-items   flex-wrap  justify-content等

元素：order属性  flex-grow放大  flex-shrink缩小  flex-basis弹性占用空间   algin-self  align-items   

## 4.讲一下React和Vue的区别

共同点：

1.都是用了虚拟Dom

2.提供响应式和组件化

3.把注意力集中在核心库上。

我结合自己的情况来说下我的感受吧。

Vue 是一个渐进式框架，它本身体现的是一种权衡的技术。它考虑的更多的是用户的开发体验，所以更适合新手。

React 则是一种数学层面的一致之美，追求的是函数式编程的理念。

### 监听数据变化的实现原理不同: 

vue2.0是通过definepoperty的getter和setter劫持数据的变化来实现响应式的

React默认是通过比较引用的方式（diff）进行的，如果不优化可能导致大量不必要的VDOM的重新渲染。为什么React不精确监听数据变化呢？这是因为Vue和React设计理念上的区别，Vue使用的是可变数据，而React更强调数据的不可变，两者没有好坏之分。

而vue3.0和核心思想很奇妙，它是采用函数编程中的副作用这一个点，通过proxy代理数据来监听数据的变化实现响应式的。

### 数据流向不同:

![img](https://pic2.zhimg.com/80/v2-f604862155689e675bdc3539f4242ba5_720w.webp)

### 组件之间的通信不同：

Vue中有三种方式可以实现组件通信：

父组件通过props向子组件传递数据或者回调，虽然可以传递回调，但是我们一般只传数据；

子组件通过事件向父组件发送消息；通过V2.2.0中新增的provide/inject来实现父组件向子组件注入数据，可以跨越多个层级。

React中也有对应的三种方式：

父组件通过props可以向子组件传递数据或者回调；

可以通过 context 进行跨层级的通信，这其实和 provide/inject 起到的作用差不多。

React 本身并不支持自定义事件，而Vue中子组件向父组件传递消息有两种方式：事件和回调函数，但Vue更倾向于使用事件。在React中我们都是使用回调函数的，这可能是他们二者最大的区别。

![img](https://pic4.zhimg.com/v2-a82e1eafc7a220062812b6402e1546a3_r.jpg)

### 渲染过程不同：

Vue可以更快地计算出Virtual DOM的差异，这是由于它在渲染过程中，会跟踪每一个组件的依赖关系，不需要重新渲染整个组件树。

React在应用的状态被改变时，全部子组件都会重新渲染。（比如useState变化时，该hooks函数会重新执行一遍）。



## 


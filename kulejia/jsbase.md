## 说一下call、bind、apply和this指向的问题

this永远指向最后调用他的那个对象

**箭头函数的 this 始终指向函数定义时的 this，而非执行时。**

“箭头函数中没有 this 绑定，必须通过查找作用域链来决定其值，如果箭头函数被非箭头函数包含，则 this 绑定的是最近一层非箭头函数的 this，否则，this 为 undefined

这三个方法都可以改变this的指向，只是他们接收参数的方式不一样。apply接收的是数组，call接收参数列表，bind通过传入一个对象返回一个` this `绑定了传入对象的新函数，需要()执行一下。

## 原型和原型链

原型关系

每个class都有显性的原型prototype

每个实例都有隐形的原型`_proto_`

实例的`_proto_`指向的是该实例对应的class的prototype

原型：

每个函数对象都有一个prototype属性，这个属性指向函数的原型对象

原型链:

函数的原型链对象constructor默认指向函数本身，原型对象除了原有属性外还有一个指针。

每个对象都有一个原型链指针`_proto_`,该指针指向上一层的原型对象，Object的`_proto_`=null表示原型链的顶端。

## 讲一讲怎么实现一个New操作符

1.定义一个函数

2.处理函数的arguments

3.创建一个新的对象，将新的对象的原型链和对象的原型挂在一起

4.使用apply将该函数的执行的this指向为该新对象
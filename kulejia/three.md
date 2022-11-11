## 讲一讲Map和weakMap 还有set和weakSet

Map和weakMap都是集合类型的对象，且他们都是依靠key和value建立键值对储存的集合对象。

但是他们不同的点是：
1.WeakMap的key值只能是对象，而map既可以是对象也可以是元始值类型。
2.WeakMap只拥有部分Map的方法
3.WeakMap对于key是弱引用的，意思就是当key被回收时，相应的键值也会被回收。所以WeakMap用于存储那些只有key存在时才有价值的信息。
```
let John = { major: "math" };

const map = new Map();
const weakMap = new WeakMap();

map.set(John, 'John');
weakMap.set(John, 'John');

John = null;
/* John 被垃圾收集 */
此时weakMap内的Johm对象所对应的键值对也会被回收而map是不会被影响的。
```
set是一个唯一值集合，集合里的每一项都是唯一的。

比较总结
相同点：添加相同的值不支持。
Map vs. WeakMap：WeakMap仅接受对象作为键，而Map不接受。
Map and Set：

可迭代的对象，支持 for..of，forEach 或 ... 运算符
脱离GC关系

WeakMap and WeakSet：

不是一个可迭代的对象，不能循环。
如果引用数据被垃圾收集，则无法访问数据。
支持较少的方法。


## 请用es5实现一个继承有哪些方式
原型链继承
```javascript
function parent1{
  this.name=‘parent1’
  this.play=[1,2]
}
function child1(){
  this.type=‘child1’
}
child1.prototype=new parent1()
var ch1 = new child1()
```
构造器继承
```javascript
function parent2(){
  this.name=‘parent2’
  this.play=[1,2]
}
parent2.prototype.getName=function(){
  reutrn this.name
}
function child2(){
  parent2.call(this)
  this.type=‘child2’
}
child2.prototype.constructor=parent2
```
组合继承
```javascript

function parent3(){
  this.name=‘parent3’
  this.play=[1,2]
}

parent3.prototype. getName =function(){
  reutrn this.name
}
function child3(){
  parent3.call(this)
  this.type=“child3”
}
child3.prototype = new parent3()
Child3.prototype.constructor = Child3;
var s3 = new Child3();
var s4 = new Child3();
s3.play.push(4);
console.log(s3.play, s4.play);  // 不互相影响
console.log(s3.getName()); // 正常输出'parent3'
console.log(s4.getName()); // 正常输出'parent3'
```
原型式继承
```
let parent4 = {
    name: "parent4",
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };

var chid4 = Object.create(parent4)
```
寄生继承
```

let parent5 = {
    name: "parent5”,
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };
  //寄生就是在组合的基础上创建一个克隆函数然后把相关的方法在写一下
 function clone(original) {
    let clone = Object.create(original);
    clone.getFriends = function() {
      return this.friends;
    };
    return clone;
  }
​
```
寄生组合继承
```
  function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
  }
   Parent6.prototype.getName = function () {
    return this.name;
  }
  function Child6() {
    Parent6.call(this);
    this.friends = 'child6';
  }
​
  function clone (parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
  }
​
  clone(Parent6, Child6);
  Child6.prototype.getFriends = function () {
    return this.friends;
  }
​
  let person6 = new Child6();
  console.log(person6);
  console.log(person6.getName());
  console.log(person6.getFriends());
```

es6中的extends继承
```
class parent{
  constructor(name) {
    this.name = name
  }
   this.play=[1,2]
   function getname(){
     return this.name
   }
}
class child extends parent{
  constructor(name, age) {
    // 子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    super(name)
    this.age = age
  }
}
```
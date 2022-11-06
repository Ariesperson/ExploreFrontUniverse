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

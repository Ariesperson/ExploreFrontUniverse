# Vue

## 简述MVVM

### 什么是MVVM?

mvvm—>Model-View-ViewModel的缩写。`Model`层代表数据模型，`View`代表UI组件，`ViewModel`是`View`和`Model`层的桥梁，数据会绑定到`viewModel`层并自动将数据渲染到页面中，视图变化的时候会通知`viewModel`层更新数据。以前是操作DOM结构更新视图，现在是`数据驱动视图`。

### **MVVM的优点**

1.`低耦合`。视图（View）可以独立于Model变化和修改，一个Model可以绑定到不同的View上，当View变化的时候Model可以不变化，当Model变化的时候View也可以不变；
 2.`可重用性`。你可以把一些视图逻辑放在一个Model里面，让很多View重用这段视图逻辑。
 3.`独立开发`。开发人员可以专注于业务逻辑和数据的开发(ViewModel)，设计人员可以专注于页面设计。
 4.`可测试`。

### Vue底层实现原理


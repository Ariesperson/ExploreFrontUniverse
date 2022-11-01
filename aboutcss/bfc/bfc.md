# BFC（块级格式上下文）

## BFC的概念

`BFC` 是 `Block Formatting Context `的缩写，即块级格式化上下文。BFC是一个布局的概念。

## BFC的原理布局规则

1.垂直方向一个一个的放置。

2.垂直方向距离由margin决定。

3.独立，不影响外部块

4.每个元素margin box的左边， 与包含块border box的左边相接触(对于从左往右的格式化，否则相反)

5.计算高度，浮动元素也参与计算高度。

6.BFC不会与float box重叠

## 如何创建BFC

1.根元素，HTML

2.float的值不为none

3.position为absolute或fixed

4.display的值为inline-block、table-cell、table-caption

5.overflow的值不为visible

## **BFC的使用场景**

- 去除**边距重叠现象**
- **清除浮动**（让父元素的高度包含子浮动元素）
- 避免某元素被浮动元素覆盖
- 避免多列布局由于宽度计算四舍五入而自动换行
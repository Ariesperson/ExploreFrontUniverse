## 那些操作会触发浏览器的重排和重绘

触发重排一定会触发重绘

1.添加和删除dom节点

2.display:none 和display:block这种隐藏和显示dom节点的操作

3.visible属性

4.移动dom和添加动画效果

5.添加一个样式表，新增样式或者调整样式属性

6.用户调整窗口大小、改编字号或者滚动。

## 怎么尽可能的避免触发重排和重绘

1.统一修改样式表、不要一条条的样式修改

2.不要把Dom节点的属性这放在循环里当做变量

3.为动画原件的display设置fixed和absoute  他们就不会触发reflow

4.尽量不使用table布局

5.动画开启GPU加速。translate使用3D变化

 6.将元素提升为合成层

将元素提升为合成层有以下优点：

- 合成层的位图，会交由 GPU 合成，比 CPU 处理要快
- 当需要 repaint 时，只需要 repaint 本身，不会影响到其他的层
- 对于 transform 和 opacity 效果，不会触发 layout 和 paint

提升合成层的最好方式是使用 CSS 的 will-change 属性：

```css
#target {
  will-change: transform;
}
```




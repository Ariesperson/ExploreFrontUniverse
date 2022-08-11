# H5页面性能初探之性能分析🌕

## 前言：

​	上一章我们讲了关于前端性能问题带给我们的现象描绘以及时间节点的描述。这一章我们将会稍稍深入一点，对前端页面的性能情况进行分析。

## Performance Monitor性能监视器

Performance还有一个性能监视器功能，可以实时监控浏览器性能情况。😈

按以下方式, 即可打开性能监视器

- 打开浏览器, 输入需要监视的网址
- 按`F12`打开Chrome控制台
- 按组合键`Ctrl+P`(windows, mac快捷键为command + p)
- 输入`> Show Performance Monitor`, 打开性能监视器

注意, 在按组合键`Ctrl+P`(windows, mac快捷键为command + p), 可输入`?`, 会提示6种不同的命令:

- `...`, open file, 打开文件(Source)
- `:`, Go to line, 跳转至文件的指定行
- `@`, Go to symbol
- `!`, Run snippet, 运行代码片段
- `>`, Run command, 运行command

### Performance Monitor性能指标

- CPU usage,     CPU占用率
- JS head size,    JS内存使用大小
- DOM Nodes,   内存中挂载的DOM节点个数
- JS event listeners,   事件监听数
- Document
- Document Frames
- Layouts / sec,     布局重排, 浏览器用来计算页面上所有元素的位置和大小的过程
- Style recalcs / sec,     页面样式重绘

​        所以我们可以根据以上数据的使用情况知道我们的前端页面在当前阶段做了些什么，并根据这几个指标对应的数据进行某一方面的性能优化。


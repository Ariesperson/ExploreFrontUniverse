

# 微前端实现思路

## 外层框架



## 内层页面

### 初始化进入start

首次进入的时候，seajs.use中 会调用router.start方法。

这个方法做的事情：

### window对象监听hashchange事件

处理pathData，然后生成得到一个P对象，这个P对象就是当前页签的数据结构对象。后面壳子框架需要使用它进行一些操作。（后面会用）

### 解析path,调用parsePath方法。

```javascript
 /*==============	功能相关	==============*/
    start: function ( config ) {
      config = config || {}
      var events = handle.events,
        data, path, pathData, p, context;
      if (handle.isRunning) {
        return;
      }
      // 这里暂时没有默认配置
      this.config = _fn.mix( this.config, config );
      
      window.addEventListener('hashchange', _fn.hashChange);
      path = window.location.hash;
      pathData = _fn.resolvePath(path);
      context = _fn.getContext();
      //context = localdata.get( 'kayak.context' );	// 保留执行上下文
      data = {
        pathData: pathData,
        type: 'start',
        context: context,
        currentData: {
          url: handle.currentUrl,
          path: handle.currentPath,
          actions: handle.currentActions
        },
      };
      events.fire('preJump', data);
      _fn.setContext(data.context);
      //localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      p = data.pathData[_fn.getPathType()] || '';
      _fn.parsePath(p);
      handle.isRunning = true;
    },
        
```



解析path的作用是想从url的角度根据规则分析出当前地址的布局模式、项目层级资源、页面层级的资源。

```javascript
//
parsePath: function (path) {
      var originPath = '';
      var config = handle.config;
      var args = {};

      path = typeof path == 'string' ? path : location.hash;
      originPath = path.indexOf('#') > -1 ? path.split('#')[1] : path;
      path = originPath.split(CFG.paramSplit);
      args = utils.parseParam(path.slice(1).join(':'));
      if (config.multiInstanceAsDiffParam) {
        _fn.changeView(originPath, args);
      } else {
        _fn.changeView(path[0], args);
      }
},
  
```



处理完path后



## 


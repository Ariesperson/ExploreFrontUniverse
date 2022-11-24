function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if (getter == null) {
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        // if (key in vm.$data) {
        //   warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        // } else if (vm.$options.props && key in vm.$options.props) {
        //   warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        // } else if (vm.$options.methods && key in vm.$options.methods) {
        //   warn(("The computed property \"" + key + "\" is already defined as a method."), vm);
        // }
      }
    }
  }
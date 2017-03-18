## 动态数据绑定（二）

笔记 
--

> 如果传入参数对象是一个“比较深”的对象（也就是其属性值也可能是对象），那该怎么办呢？

即如果传入对又是一个对象呢？需要将“深对象”也绑定get、set方法，想到用递归的方法，对属性进行判断，如果是对象，则重新new一个Observer出来。即：

    Observer.prototype.makeObserver = function(data) {
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          if(typeof data[i] === 'object') {
            new Observer(data[i]);
          } else {
            this.getset(i, data[i]);
          }
        }
      }
    }

> 如果设置新的值是一个对象的话，新设置的对象的属性是否能继续响应getter和setter呢？

例如：

    let app = new Observer({
        basicInfo: {
            name: 'season',
            age: 25
        },
        address: 'Beijing'
    })
    //要实现的结果如下
    app.data.basicInfo = {like: 'movie'}//你设置了basicInfo，新的basicInfo为{like: 'movie'}
    app.data.basicInfo.like //你访问了basicInfo，你访问了like

同上，需要在set中进行判断，如果是对象，重新new一个Observer。

> 考虑传递回调函数。在实际应用中，当特定数据发生改变的时候，我们是希望做一些特定的事情，而不是每一次只能打印出来一些信息，所以，我们需要支持传入回调函数的功能。

对属性绑定回调函数，需要的时候触发。即：每次$watch一个属性相当于注册一个监听事件，每次属性发生改变（set）的时候触发该事件。采用发布-订阅模式，实现一个自定义事件，可以对一个属性注册多个事件，触发的时候依次调用。

    function Event() {
      this.events = {};
    }
    Event.prototype.on = function (attr, callback) {
      if (this.events[attr]){
        this.events[attr].push(callback);
      } else {
        this.events[attr] = [callback];
      }
    }
    Event.prototype.emit = function (attr, newval) {
      for(var item in this.events) {
        if(item === attr) {
          this.events[attr].forEach(function(item) {
            item(newval);
          })
        }
      }
    }
    
这样的话，每次new一个Observer实例时，就new一个Event实例管理所有的事件。在set中触发事件，

    function Observer(data) {
      this.data = data;
      this.makeObserver(data);
      this.eventsBus = new Event();
    }
    Observer.prototype.makeObserver = function(data) {
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          if(typeof data[i] === 'object') {
            new Observer(data[i]);
          }
          this.getset(i, data[i]);
        }
      }
    }
    Observer.prototype.getset = function(i, value) {
      let val = value;
      let that = this;
      Object.defineProperty(this.data, i, {
        configurable: true,
        enumerable: true,
        get: function () {
          console.log('你访问了' + i);
          return val;
        },
        set: function (newval) {
          console.log('你设置了' + i + ',新的值为' + newval);
          if(typeof newval === 'object') {
            new Observer(newval);
          }
          // 触发
          that.eventsBus.emit(i, newval);
          val = newval;
        }
      })
    }
    Observer.prototype.$watch = function (attr,callback){
        // 注册一个监听事件
        this.eventsBus.on(attr, callback);
    }
至此，完成了事件监听。

目前只能注册监听对象到第一层属性，深层对象属性的监听未完成，看下回分析。

----------

任务目的
----

在实践中使用递归思想
了解设计模式中的“发布-订阅模式”

任务描述
----

这是“动态数据绑定”系列的第二题。在第一题的基础上，我们继续考虑以下难点：

如果传入参数对象是一个“比较深”的对象（也就是其属性值也可能是对象），那该怎么办呢？举个例子。

    // 一个“比较深”的对象：某些属性的值也是一个对象
    let obj = {
     a: 1,
     b: 2,
     c: {
         d: 3,
         e: 4
     }
    }

如果设置新的值是一个对象的话，新设置的对象的属性是否能能继续响应 getter 和 setter。举个例子。

    let app1 = new Observer({
             name: 'youngwind',
             age: 25
     });
    app1.data.name = {
             lastName: 'liang',
             firstName: 'shaofeng'
     };
    app1.data.name.lastName;
     // 这里还需要输出 '你访问了 lastName '
    app1.data.name.firstName = 'lalala';
     // 这里还需要输出 '你设置了firstName, 新的值为 lalala'

考虑传递回调函数。在实际应用中，当特定数据发生改变的时候，我们是希望做一些特定的事情的，而不是每一次都只能打印出一些信息。所以，我们需要支持传入回调函数的功能。举个例子。

    let app1 = new Observer({
             name: 'youngwind',
             age: 25
     });
     // 你需要实现 $watch 这个 API
     app1.$watch('age', function(age) {
             console.log(`我的年纪变了，现在已经是：${age}岁了`)
     });
     app1.data.age = 100; // 输出：'我的年纪变了，现在已经是100岁了'

任务注意事项
------

不能使用任何第三方的库
程序执行环境为浏览器

在线学习参考资料
--------

[发布-订阅模式][1] 
更多设计模式相关的资料强烈推荐曾探所著[《JavaScript设计模式与开发实践][2]》
  [1]: https://juejin.im/entry/580b5553570c350068e6c2d6
  [2]: https://book.douban.com/subject/26382780/
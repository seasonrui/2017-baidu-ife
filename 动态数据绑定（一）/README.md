## 动态数据绑定（一）

笔记 
--
题目需要监听属性的变化，有两种方式：

1.**采用ES5中的defineProperty，设置get和set函数，重新定义读取和赋值的方式**。

2.**采用ES6中的proxy，对目标对象进行"拦截"**。

方式一：
Object.defineProperty(obj, prop, descriptor)定义对象的属性。
Object.defineProperty可设置的属性如下：

**configurable**：能否使用delete、能否修改属性特性、能否修改访问器属性，false为不可重新定义。
//一般情况下，configurable是设置为true，如果设置为false，这个属性除了writable之外都不能修改了，writable也只能从true改为false而不能反过来。

**enumerable**：对象属性是否可通过for-in循环遍历或在Object.keys中列举。

**writable**：对象属性是否可修改，false为不可修改。

**value**：对象属性的默认值，默认值为undefined。


注意： configurable， enumerable， writable特性默认值根据对象定义方法不同而不同。
// 直接在对象上定义属性，这些特性默认值为true
var obj = {};
obj.name = 'season';
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
// Object {value: "season", writable: true, enumerable: true, configurable: true}

// 调用Object.defineProperty()方法，不指定值的时候，默认为false
var obj = {};
obj.defineProperty(obj, 'name', {
  value: 'season'
});
console.log(Object.getOwnPropertyDescriptor(obj, 'name'))
// Object {value: "season", writable: false, enumerable: false, configurable: false}


// 在本例中，可以定义configurable、enumerable，默认为false。 但是如果定义了set或get方法中的任何一个，就不能再设置writable，即使false也不可以。


接着获取对象属性：

方法一：使用Object.keys(obj)，该方法返回一个数组，数组里是obj可被枚举的所有属性，接着对数组进行forEach遍历。

方法二：使用for in获取所有属性，接着用obj.hasOwnProperty(key)对属性进行判断过滤。

接着就可以自定义get和set函数啦！

在这过程中犯了一个低级错误：
get函数return data[key]，导致get函数返回时又触发了get函数，陷入死循环。

最终代码：

    function Observer(data) {
      this.data = data;
      this.getset(data);
    }
    Observer.prototype.getset = function(data) {
      for(var key in data) {
        var val = data[key];
        if(data.hasOwnProperty(key)) {
          Object.defineProperty(data, key, {
            configurable: true,
            enumerable: true, 
            //writable: true, //这里不能定义此属性，报错：Uncaught TypeError: Invalid property descriptor. Cannot both specify accessors and a value or writable attribute, #<Object>
            get: function () {
              console.log('你访问了' + key);
              return val;
            },
            set: function (newval) {
              console.log('你设置了' + val + ',新的值为' + newval);
              val = newval;
            }
          })
        }
      }
    }

方式二：
> Proxy可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。

最终代码：

    function Observer (data) {
      return new Proxy(data, {
        get: function (target, propKey) {
          if (propKey in target) {
            console.log('你访问了' + propKey);
            return target[propKey];
          } else {
            console.log("Property \"" + propKey + "\" does not exist.");
          }
        },
        set: function (target, propKey, value) {
          console.log('你设置了' + propKey + ',新的值为' + value);
          target[propKey] = value;
        }
      })
    }


----------

任务目的
--
1.了解 getter 和 setter

2.了解 new

任务描述
--
这是“动态数据绑定”系列的第一题。
我之前经常使用 Vue，后来不满足于仅仅使用它，我想了解其内部实现原理，所以就尝试学习其源码，获益匪浅。所以，如果你跟我一样，希望挑战这高难度的事情，那就开启这一系列吧！
我们从最简单的开始。
其中，动态数据绑定就是 Vue 最为基础，最为有用的一个功能。这个系列将分成5部分，一步一步来理解和实现这一功能。
ok，我们从最简单的开始。给定任意一个对象，如何监听其属性的读取与变化？也就是说，如何知道程序访问了对象的哪个属性，又改变了哪个属性？ 举个例子。

    let app1 = new Observer({
        name: 'youngwind',
        age: 25
    });
    let app2 = new Observer({
        university: 'bupt',
        major: 'computer'
    });此处输入代码
    let app1 = new Observer({
        name: 'youngwind',
        age: 25
    });
    let app2 = new Observer({
        university: 'bupt',
        major: 'computer'
    });
    // 要实现的结果如下：
    app1.data.name // 你访问了 name
    app.data.age = 100;  // 你设置了 age，新的值为100
    app2.data.university // 你访问了 university
    app2.data.major = 'science'  // 你设置了major，新的值为 science

请实现这样的一个 Observer，要求如下：

 1. 传入参数只考虑对象，不考虑数组。
 2. new Observer返回一个对象，其 data 属性要能够访问到传递进去的对象。
 3. 通过 data 访问属性和设置属性的时候，均能打印出右侧对应的信息。
 
任务注意事项
--
不能使用任何第三方的库
程序执行环境为浏览器

在线学习参考资料
--

[vue早期源码学习系列之一：如何监听一个对象的变化述][1]
  [1]: https://github.com/youngwind/blog/issues/84
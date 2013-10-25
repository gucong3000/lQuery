/*
 * Light Query v0.4
 * https://github.com/gucong3000/lQuery
 */
(function(){
	"use strict";

	var queryName = "LQ",
		win = window,
		doc = win.document,
		root = doc.documentElement,
		addEventListener = doc.addEventListener,
		querySelector = doc.querySelector,
		protoProp = "prototype",
		randomNames = {},
		loopFns = !addEventListener && querySelector ? [] : null,
		readyFns = [],
		readyFnOld,
		dataAttr;

	//补全低端浏览器下的String.prototype.trim
	if(!String[protoProp].trim){
		String[protoProp].trim = function(){
			return this.replace(/^\s+|\s+$/g, "");
		};
	}

	//补全低端浏览器下的Array.prototype.forEach
	if (!Array[protoProp].forEach) {
		Array[protoProp].forEach = function (fn, scope) {
			for ( var i = 0; i < this.length; i++ ) {
				if (i in this) {
					fn.call(scope, this[i], i, this);
				}
			}
		};
	}
	//对象初始化函数
	function LightQuery(selector) {
		return new LightQuery.fn.init(selector);
	}

	//将callback在文档就绪时和节点插入时执行
	function readyEval(call){
		if(doc.body || !readyFns){
			//如果document.body可访问，说明文档已经开始渲染，尝试执行一次
			//如果队列不存在，表示文档就绪，直接执行
			call();
		}
		if (readyFns) {
			//如果文档就绪函数队列存在，表示文档未就绪，call放入队列
			readyFns.push(call);
		}
		if(addEventListener){
			//将call注册为节点插入事件响应函数
			addEventListener( "DOMNodeInserted", call );
		}
	}

	//执行文档就绪队列中的函数
	function completed(){
		if (readyFns) {
			readyFns.forEach(function(fn){
				fn();
			});
			readyFns = null;
		}
	}

	//返回文档状态是否就绪
	LightQuery.isReady = function(){
		return doc.readyState === "complete";
	};

	//生成一个不重复的变量名
	LightQuery.randomName = function(){
		var name = (function(){
			name = queryName + (+new Date()) + parseInt(Math.random() * 0xfff);
			return randomNames[name] ? arguments.callee() : name;
		})();
		return randomNames[name] = name;
	};

	//LightQuery.data函数所需的在Node上存储数据所需的属性的名称
	dataAttr = LightQuery.randomName();

	//在Node上储存数据所用的函数
	LightQuery.data = function(node, key, val, udf){
		var dataSet = node[dataAttr];
		if(!dataSet){
			node[dataAttr] = dataSet = {};
		}
		if(val === udf){
			val = dataSet[key];
		} else {
			dataSet[key] = val;
			val = this;
		}
		return val;
	};

	//doc.addEventListener缩写
	if(addEventListener) {
		addEventListener = function(eType, call){
			doc.addEventListener( eType, call, false );
		};
	}

	//除IE6、7外，建立DOMContentLoaded响应机制
	if(querySelector && !LightQuery.isReady()){
		if ( addEventListener ) {
			//w3c标准的DOMContentLoaded事件
			addEventListener( "DOMContentLoaded", completed );
		} else {
			//IE模拟DOMContentLoaded事件
			var readyFnOld = doc.onreadystatechange;
			doc.onreadystatechange = function(){
				completed();
				if(readyFnOld){
					readyFnOld.apply(this, arguments);
				}
			};
		}
	}

	//IE8下不支持节点插入事件，用setInterval模拟
	if(loopFns){
		setInterval(function(){
			loopFns.forEach(function(loopFnsArry){
				if(loopFnsArry && loopFnsArry.hooks){
					loopFnsArry.hooks.forEach(function(fn){
						fn();
					});
				}
			});
		}, 100);
	}

	//声明LightQuery对象的prototype
	LightQuery.fn = {
		//初始化
		init: function(selector) {
			this.hooks = [];
			this.selector = selector;
			//声明一个css样式表并插入页面当前位置
			root.lastChild.appendChild(this.styleNode = doc.createElement("style"));
			//IE8下降hooks加入全局定时器
			loopFns && loopFns.push(this);
		},
		//写入css
		style: function(rule, css){
			if(!css){
				css = rule;
				rule = this.selector;
			}
			if(rule && this.styleNode.styleSheet){
				//担心IE低版遇到表达式中部分不识别导致整体失效，所以将规则拆分后写入
				rule.trim().split(/\s?,\s?/).forEach(function(subRule){
					this.styleNode.styleSheet.addRule(subRule, css);
				}, this);
			} else {
				//一般浏览器下写入css
				this.styleNode.appendChild(doc.createTextNode(rule + "{" + css + "}"));
			}
			return this;
		},
		//动态元素查找
		query: function(rule, callback){
			var randomName = LightQuery.randomName(),
				index = 0,
				stop = 0,
				hook;
				
			//去重后带参执行回调，参数为节点对象
			function call(node){
				//过滤回调过的节点
				if(!LightQuery.data(node, randomName) && !stop){
					//标记为已回调过了
					LightQuery.data(node, randomName, true);
					stop = callback.call(node, index++, node) === false;
				}
			}
			if(querySelector){
				//其他浏览器下利用document.querySelectorAll查找
				readyEval(hook = function(){
					Array[protoProp].forEach.call(doc.querySelectorAll(rule), function(node){
						call(node);
					});
				});
			} else {
				//IE6\7下利用css表达式查找节点
				LightQuery[randomName] = call;
				this.style(rule, randomName + ":expression((function(n){try{return " + queryName + "." + randomName + "(n)}catch(ex){}})(this))");
				hook = randomName;
			}

			this.hooks.push(hook);

			return this;
		},
		//动态元素遍历，参数可变
		each: function(rule, callback){
			if(!callback){
				callback = rule;
				rule = this.selector;
			}
			return this.query(rule, callback);
		},
		//停止动态遍历节点
		die: function (){
			if(this.hooks){
				//删除初始化时插入的css样式表
				this.styleNode.parentNode.removeChild(this.styleNode);
				this.hooks.forEach(function(fn){
					if(addEventListener){
						//标准浏览器下删除DOMNodeInserted事件
						doc.removeEventListener( "DOMNodeInserted", fn, false );
					} else {
						//IE6\7删除hook函数
						delete LightQuery[fn];
					}
				});
				this.hooks = null;
			}
		}
	};

	LightQuery.fn.init[protoProp] = LightQuery.fn;

	if (typeof define === 'function' && ( define.amd || define.cmd )) {
		// AMD. CMD. Register as an anonymous module.
		define(function(){
			return LightQuery;
		});
	}

	// Browser globals
	win[queryName] = LightQuery;

})();
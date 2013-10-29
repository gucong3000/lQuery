/*
 * Light Query classList 插件 v0.1
 * 让给IE9及以下浏览器支持w3c的classList方式操作class
 * gucong@gmail.com
 */
"use strict";
//基本上支持use strict的浏览器都已经支持classList功能，所以只在开发阶段使用即可
(function (root, factory) {
	if (typeof define === 'function' && ( define.amd || define.cmd )) {
		// AMD. CMD. Register as an anonymous module.
		define(factory);
	} else {
		factory(function(){
			return root.LQ;
		});
	}
}(this, function(require){
	var classListProp = "classList",
		protoProp = "prototype",
		objCtr = Object,
		win = window,
		datekey,
		dataFn,
		elemCtrProto = (win.HTMLElement || win.Element),
		LQ = require("lightquery");

	if(LQ){
		datekey = LQ.randomName();
		dataFn = function(node, val){
			return LQ.data(node, datekey, val);
		};
	}

	//声明classList的原型，DOMTokenList对象
	function DOMTokenList(node){
		//toString方法中刷新classList的键值
		this.toString = function(){
			var classStr = node.className;
				arr = classStr ? classStr.trim().split(/\s+/) : [],
				i = 0;
			for(; i < arr.length; i++ ){
				if(this[i] !== arr[i]){
					this[i] = arr[i];
				}
			}
			if(this.length !== arr.length){
				for(;i < this.length; i++){
					delete this[i];
				}
				this.length = arr.length;
			}
			arr = arr.join(" ");
			if(node.className !== arr){
				node.className = arr;
			}
			return arr;
		};
		//传统的addClass方式
		this.add = function(classStr){
			classStr = classStr.trim();
			if(!this.contains(classStr)){
				node.className += " " + classStr;
				this.toString();
			}
		};
		//传统的removeClass方式
		this.remove = function(classStr){
			classStr = classStr.trim();
			if(this.contains(classStr)){
				node.className = Array.prototype.filter.call(this, function(str){
					return str !== classStr;
				}.join(" "));
				this.toString();
			}
		};
		//刷新一次数据，也就是初始化
		this.toString();
	}

	DOMTokenList[protoProp] = {

		//实现item方法
		item: function(i){
			return this[i];
		},

		//判断class是否存在
		contains: function(classStr){
			classStr = classStr.trim();
			return this.toString().split(/\s+/).some(function(str){
				return str === classStr;
			});
		},

		//toggleClass方法
		toggle: function(token, forse){
			var result = this.contains(token),
				method = result ? forse !== true && "remove" : forse !== false && "add";

			if (method) {
				this[method](token);
			}

			return !result;
		},

		//伪数组所需的length属性
		length: 0
	};
	
	//get方法，IE内核尝试优先返回已有的classList，其他浏览器每次都返回一个全新的
	function classListGetter(){
		if(this.attachEvent && dataFn){
			return getClassList(this);
		} else {
			return new DOMTokenList(this);
		}
	};

	//尝试获取node的classList，如果没有则新建一个返回
	function getClassList(node){
		var classList = dataFn(node);
		if(!classList){
			node.attachEvent("onpropertychange", function(){
				var prop = event.propertyName;
				if(prop === classListProp || prop === "className"){
					node[classListProp].toString();
				}
			});
			classList = new DOMTokenList(node);
			dataFn(node, classList);
			if (!elemCtrProto){
				node[classListProp] = classList;
			}
		}
		return classList;
	};

	//如果有Element或HTMLElement原型
	if(elemCtrProto){
		elemCtrProto = elemCtrProto[protoProp];
		if(!(classListProp in elemCtrProto)){
			//IE9下使用Object.defineProperty方式定义get方法
			if (objCtr.defineProperty) {
				var classListPropDesc = {
						get: classListGetter,
						enumerable: true,
						configurable: true
					};
				try {
					objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
				} catch (ex) { // IE 8 doesn't support enumerable:true
					if (ex.number === -0x7FF5EC54) {
						classListPropDesc.enumerable = false;
						objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
					}
				}
			} else if (objCtr[protoProp].__defineGetter__) {
				//高端浏览器下使用Element.__defineGetter__方式定义get方法
				elemCtrProto.__defineGetter__(classListProp, classListGetter);
			}
		}
	} else {
		//IE6、7下将每一个LQ.fn.query捕获到的node添加classList
		LQ.fn.query.hijack.push(function(node){
			if(!(classListProp in node)){
				node[classListProp] = getClassList(this);
			}
		});
	}

	return LQ;
}));
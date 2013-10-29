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
	var query,
		LQ = require("lightquery"),
		datekey = LQ.randomName(),
		dataFn = function(node, val){
			return LQ.data(node, datekey, val);
		};

	if(!document.querySelector){
		LQ.fn.query.hijack.push(function(node){
			if(!dataFn(node)){
				var getAttribute = node.getAttribute;
				node.getAttribute = function(name){
					return getAttribute.call(this, name, 2);
				}
				dataFn(node, getAttribute);
			}
		});
	}
	return LQ;
}));
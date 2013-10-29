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
	var addFn = "addEventListener",
		delFn = "removeEventListener",
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
	function returnTrue(){
		return true;
	}

	function returnFalse(){
		return false;
	}

	function getEvent(){
		var e = win.event;
		if(!e.preventDefault){
			if (e.type == 'mouseout') { 
				e.relatedTarget = e.toElement;
			} else if (e.type == 'mouseover') {
				e.relatedTarget = e.fromElement;
			}
			e.target = e.srcElement;
			e.timeStamp = (new Date()).getTime();
			e.charCode = (e.type == 'keypress') ? e.keyCode: 0;
			e.eventPhase = 2;
			e.isChar = (e.charCode > 0);
			e.pageX = e.x;
			e.pageY = e.y;

			e.preventDefault = function() {
				e.returnValue = false;
				e.isDefaultPrevented = returnTrue;
			};
			e.isDefaultPrevented = function(){
				return !e.returnValue;
			};

			e.stopPropagation = function() {
				e.cancelBubble = true;
				e.isDefaultPrevented = returnTrue;
			};
			e.isPropagationStopped = function(){
				return e.cancelBubble;
			};

			e.stopImmediatePropagation = function(){
				e.stopPropagation();
				e.isImmediatePropagationStopped = returnTrue;
			};
			e.isImmediatePropagationStopped = returnFalse;
			
		}
		return e;
	}
	
	function setEventListener(node, eventType) {
		var ehook = dataFn(node) || {};
		if(!ehook[eventType]){
			ehook[eventType] = [];
			node.attachEvent("on" + eventType, function(){
				var e = getEvent();
				ehook[eventType].forEach(function(fn){
					if(!e.isImmediatePropagationStopped()){
						e.returnValue &= fn.call(node, e) !== false;
					}
				});
			});
		}
		dataFn(node, ehook);
		return ehook[eventType];
	}

	function add(eventType, fn) {
		setEventListener(this, eventType).push(fn);
	}

	function del(eventType, fun) {
		var data = dataFn(node);
		if(data && (data = data[eventType])){
			for(var i = 0; i< data.length; i++){
				if(data[i] === fn){
					data[i] = null;
				}
			}
		}
	}

	function fixEvent(node){
		if(!(addFn in node)){
			node[addFn] = add;
		}
		if(!(delFn in node)){
			node[delFn] = del;
		}
	}

	//如果有Element或HTMLElement原型
	if(elemCtrProto){
		fixEvent(elemCtrProto.prototype);
	} else {
		//IE6、7下将每一个LQ.fn.query捕获到的node添加classList
		LQ.fn.query.hijack.push(fixEvent);
	}

	return LQ;
}));
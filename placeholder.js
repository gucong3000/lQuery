/*
 * placeholder插件 v0.2
 * 让低端浏览器支持HTML5的placeholder属性，修复高版本IE下placeholder与其他浏览器的差异
 * 顺便支持了autofocus
 * <input type="text" placeholder="DEMO" autofocus>
 * 注意：高版本IE的placeholder与其他浏览器表现有差异，所以隐藏并重新实现了一次，目前只测试到IE11，未来IE12出现，且表现与其他浏览器一致，应修改此插件
 */
"use strict";
(function(win, undefined){
	var doc = document,
		placeholder = "placeholder",
		cssDefault = "text-overflow:ellipsis;overflow:hidden;color:gray;padding:0;border:0;",
		notSupport = createElement("input")[placeholder] === undefined,
		head = doc.documentElement.firstChild,
		styleNode = createElement("style"),
		documentMode = doc.documentMode,
		parseInt = win.parseInt,
		normal = "normal",
		activeElement,
		getComputedStyle = win.getComputedStyle ? function(node){
			return win.getComputedStyle(node, null);
		} : 0;

	//document.createElement缩写
	function createElement(tag){
		return doc.createElement(tag);
	}

	//获取node的style对象，优先使用runtimeStyle
	function runtimeStyle(node){
		return node.runtimeStyle || node.style;
	}

	//获取node的计算样式，兼容IE，非IE
	function currentStyle(node){
		return node.currentStyle || getComputedStyle(node);
	}

	//为this简历模拟的placeholder
	function createHolder(){
		var input = this;
		//判断是否文本框
		if(/^text|textarea|password|email|month|search|tel|url$/i.test(input.type)){
			var holder,
				//更新placeholder文本
				setText = function (){
					//读取placeholder
					var text = placeholder in input ? input[placeholder] : input.getAttribute(placeholder);
					//如果placeholder属性不为空而node还没有建立
					if(!holder && text) {
						//建立一个node
						holder = createElement(placeholder);
						holder.onmousedown = function(){
							//鼠标点holder是文本框获得焦点
							setTimeout(function(){
								input.focus();
							}, 1);
							return false;
						};
					}
					//如果有node，更新其内容为
					if(holder){
						holder.innerHTML = text || "";
					}
				},
				timer,
				//控制node的样式
				setDisplay = function (){
					clearTimeout(timer);
					if(holder){
						var show = holder.innerHTML && !input.value,
							currStyle = currentStyle(input),
							style = runtimeStyle(holder),
							parent = input.parentNode;
						style.display = show && parent ? "inline-block" : "none";
						//如果文本框可见时
						if(parent && (input.offsetHeight || input.offsetWidth)){
							if(show){
								if(/^textarea$/i.test(input.tagName)){
									style.whiteSpace = normal;
									style.wordBreak = "break-all";
								} else {
									style.whiteSpace = "nowrap";
									style.wordBreak = normal;
								}
								//如果文本框定位不为static，则自动计算placeholder的位置
								if(currStyle.position !== "static"){
									style.width = getComputedStyle ? getComputedStyle(input).width : (input.clientWidth - parseInt(currStyle.paddingLeft) - parseInt(currStyle.paddingRight)) + "px";
									style.left = (input.offsetLeft + input.clientLeft) + "px";
									style.top = (input.offsetTop + input.clientTop) + "px";
									style.position = "absolute";
									currCss("marginLeft", "paddingLeft");
									currCss("marginTop", "paddingTop");
									currCss("zIndex");
								}
								//设置继承样式
								if(getComputedStyle && currStyle.lineHeight === normal){
									style.lineHeight = getComputedStyle(input).height;
								} else {
									currCss("lineHeight");
								}
								currCss("textAlign");
								currCss("fontFamily");
								currCss("fontWidth");
								currCss("fontSize");

								//将node插入文本框之后
								if(input.nextSibling){
									parent.insertBefore(holder, input.nextSibling);
								} else {
									parent.appendChild(holder);
								}
							}
						} else {
							//文本框不可见时延迟运行setDisplay
							timer = setTimeout(setDisplay, 50);
						}
					}
				},
				//样式集成，取文本框的样式赋值给placeholder
				currCss = function(name,attr){
					try{
						runtimeStyle(holder)[name] = currentStyle(input)[attr || name];
					}catch(e){}
				},
				//文本框无值时将字体颜色设为透明，以便隐藏原生placeholder，重新实现。
				transparent = function(){
					runtimeStyle(input).color = input.value ? "" : "transparent";
				};

			//旧版IE下事件注册
			if(notSupport){
				//value和placeholder属性变化时触发
				input.attachEvent("onpropertychange", function(){
					switch(event.propertyName){
						//如placeholder属性发生改变，重置文案和样式
						case placeholder :
							setText();
						//如value属性发生改变，重置重置样式
						case "value" :
							setDisplay();
					}
				});
				input.attachEvent("onkeypress", function(e) {
					setDisplay();
				});
			} else {
				//其他浏览器下事件注册
				"change keypress input DOMAttrModified".split(/\s/).forEach(function(eType){
					input.addEventListener(eType, function(e){
						transparent();
						setText();
						setDisplay();
					}, true);
				});
				transparent();
			}
			//初始化placeholder及其样式
			setText();
			setDisplay();
			
		}
		//autofocus属性的兼容实现
		if( notSupport && !activeElement && input.focus && input.getAttribute("autofocus") !== null ){
			activeElement = input;
			setTimeout(function(){
				input.focus();
			}, 1);
		}
	}

	function init($){
		$("input,textarea").each(createHolder);
	}

	//修复原型链
	if(notSupport && documentMode){

		//IE8及以上统一node.placeholder和node.getAttribute("placeholder")
		var hook = {
				set: function (x) {
					this.setAttribute(placeholder, x);
				},
				get: function () {
					return this.getAttribute(placeholder) || "";
				}
			},
			defineProperty = Object.defineProperty,
			prototype = "prototype";

		//HTMLTextAreaElement和HTMLInputElement的原型上加入placeholder的get、set方法
		if(defineProperty){
			defineProperty(HTMLTextAreaElement[prototype], placeholder, hook);
			defineProperty(HTMLInputElement[prototype], placeholder, hook);
		}
	}

	if(notSupport || documentMode){
		head.insertBefore(styleNode, head.firstChild);

		if(styleNode.styleSheet){
			styleNode.styleSheet.addRule(placeholder, cssDefault);
		} else {
			styleNode.appendChild(doc.createTextNode(placeholder + "{" + cssDefault + "}"));
		}
		if(win.LQ){
			init(LQ);
		} else if(win.jQuery){
			jQuery(init);
		}
	}
	
})(this);

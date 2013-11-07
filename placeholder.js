/*
 * placeholder插件，让浏览器支持HTML5的placeholder属性，高端浏览器下啥也不做
 * 顺便支持了autofocus
 * <input type="text" placeholder="DEMO" autofocus>
 */
"use strict";
(function(win, undefined){
	var doc = document,
		placeholder = "placeholder",
		notSupport = createElement("input")[placeholder] === undefined,
		head = doc.documentElement.firstChild,
		styleNode = createElement("style"),
		documentMode = doc.documentMode,
		normal = "normal",
		activeElement;
		
	function createElement(tag){
		return doc.createElement(tag);
	}

	function createHolder(){
		var input = this;
		if(/^text|textarea|password|email|month|search|tel|url$/i.test(input.type)){
			var holder,
				setText = function (){
					var text = placeholder in input ? input[placeholder] : input.getAttribute(placeholder);
					if(!holder && text) {
						holder = createElement(placeholder);
						holder.onmousedown = function(){
							setTimeout(function(){
								input.focus();
							}, 1);
							return false;
						};
					}
					if(holder){
						holder.innerHTML = text || "";
					}
				},
				timer,
				setDisplay = function (){
					clearTimeout(timer);
					if(holder){
						var show = holder.innerHTML && !input.value,
							style = holder.runtimeStyle,
							parent = input.parentNode;
						style.display = show && parent ? "inline-block" : "none";
						if(parent && (input.offsetHeight || input.offsetWidth)){
							if(show){
								if(/^textarea$/i.test(input.tagName)){
									style.whiteSpace = normal;
									style.wordBreak = "break-all";
								} else {
									style.whiteSpace = "nowrap";
									style.wordBreak = normal;
								}
								if(input.currentStyle.position !== "static"){
									style.width = (input.clientWidth || input.offsetWidth) + "px";
									style.left = input.offsetLeft + "px";
									style.top = input.offsetTop + "px";
									style.position = "absolute";
									currCss("marginLeft", "borderLeftWidth");
									currCss("marginTop", "borderTopWidth");
									currCss("paddingLeft");
									currCss("paddingTop");
									currCss("zIndex");
								}
								style.textOverflow = "ellipsis"; 
								style.overflow = "hidden";
								currCss("lineHeight");
								currCss("fontFamily");
								currCss("fontWidth");
								currCss("fontSize");

								if(input.nextSibling){
									parent.insertBefore(holder, input.nextSibling);
								} else {
									parent.appendChild(holder);
								}
							}
						} else {
							timer = setTimeout(setDisplay, 50);
						}
					}
				},
				currCss = function(name,attr){
					try{
						holder.runtimeStyle[name] = input.currentStyle[attr || name];
					}catch(e){}
				},
				transparent = function(){
					input.runtimeStyle.color = input.value ? "" : "transparent";
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
			} else {
				//IE10\11下事件注册
				"change keypress input DOMAttrModified".split(/\s/).forEach(function(eType){
					input.addEventListener(eType, function(e){
						transparent();
						setText();
						setDisplay()
					}, true);
				});
				transparent();
			}
			setText();
			setDisplay();
			
		}
		//autofocus属性的兼容实现
		if( notSupport && !activeElement && input.focus && input.getAttribute("autofocus") !== null ){
			activeElement = input;
			setTimeout(input.focus, 1);
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
			styleNode.styleSheet.addRule(placeholder, "color: gray;");
		} else {
			styleNode.appendChild(doc.createTextNode(placeholder + "{color: gray;}"));
		}
		if(win.LQ){
			init(LQ);
		} else if(win.jQuery){
			jQuery(init);
		}
	}
	
})(this);

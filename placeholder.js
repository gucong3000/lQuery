/*
 * placeholder插件，让浏览器支持HTML5的placeholder属性，高端浏览器下啥也不做
 * 顺便支持了autofocus
 * <input type="text" placeholder="DEMO" autofocus>
 */
(function(win, undefined){
	"use strict";
	var doc = document,
		placeholder = "placeholder",
		notSupport = createElement("input")[placeholder] === undefined,
		activeElement;
		
	function createElement(tag){
		return doc.createElement(tag);
	}

	function createHolder(){
		var input = this;
		if(/^text|textarea|password$/.test(input.type)){
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
		
				setDisplay = function (){
					if(holder){
						var show = holder.innerHTML && !input.value,
							parent = input.parentNode,
							style = holder.runtimeStyle;
						style.display = show ? "inline-block" : "none";
						if(show){
							if(input.currentStyle.position !== "static"){
								style.left = input.offsetLeft + "px";
								style.top = input.offsetTop + "px";
								style.position = "absolute";
								currCss("marginLeft", "borderLeftWidth");
								currCss("marginTop", "borderTopWidth");
								currCss("lineHeight");
								currCss("paddingLeft");
								currCss("paddingTop");
								currCss("fontFamily");
								currCss("fontWidth");
								currCss("fontSize");
								currCss("zIndex");
							}
							if(input.nextSibling){
								parent.insertBefore(holder, input.nextSibling);
							} else {
								parent.appendChild(holder);
							}
						}
					}
				},
				currCss = function(name,attr){
					holder.runtimeStyle[name] = input.currentStyle[attr || name];
				};

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
			setText();
			setDisplay();
			
		}
		//autofocus属性的兼容实现
		if( !activeElement && input.focus && input.getAttribute("autofocus") !== null ){
			activeElement = input;
			setTimeout(input.focus, 1);
		}
	}

	function init($){
		$("input,textarea").each(createHolder);
	}

	if(notSupport && (!doc.querySelector || doc.documentMode )){

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
			prototype = "prototype",
			styleNode = createElement("style");

		//HTMLTextAreaElement和HTMLInputElement的原型上加入placeholder的get、set方法
		if(defineProperty){
			defineProperty(HTMLTextAreaElement[prototype], placeholder, hook);
			defineProperty(HTMLInputElement[prototype], placeholder, hook);
		}
		
		//给予placeholder默认的样式
		doc.documentElement.firstChild.appendChild(styleNode);
		styleNode.styleSheet.addRule(placeholder, "color: gray;");

		if(win.LQ){
			init(LQ);
		} else if(win.jQuery){
			jQuery(init);
		}
	}

})(this);

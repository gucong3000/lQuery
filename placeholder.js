/*
 * $.fn.placeholder插件，让浏览器支持HTML5的placeholder属性，高端浏览器下啥也不做
 * 顺便支持了autofocus
 * <input type="text"> <script>$(":input")</script>
 */
"use strict";
(function($, undefined){
	var doc = document,
		placeholder = "placeholder",
		support = createElement("input")[placeholder] !== undefined;
		
	function createElement(tag){
		return doc.createElement(tag);
	}
	function createHolder(){
		if(/^text|textarea|password$/.test(this.type)){
			var input = this,
				holder = createElement(placeholder),
				prop = input[placeholder],
				setText = function (){
					holder.innerHTML = input.getAttribute(placeholder) || "";
				},
		
				setDisplay = function (){
					var show = holder.innerHTML && !input.value;
					holder.runtimeStyle.display = show ? "inline-block" : "none";
					if(show){
						input.parentNode.insertBefore(holder, input);
					}
				};

			input.attachEvent("onpropertychange", function(){
				switch(event.propertyName){
					case placeholder :
						if(input[placeholder] !== input.getAttribute(placeholder) && input[placeholder] !== prop){
							input.setAttribute(placeholder, (prop = input[placeholder]));
							break;
						}
						setText();
					case "value" :
						setDisplay();
				}
			});
			setText();
			setDisplay();
			holder.onmousedown = function(){
				setTimeout(function(){
					input.focus();
				}, 1);
			};
		}
	}
	
	$.fn[placeholder] = support ? function(){
		return this;
	} : function(){
		return this.each(createHolder);
	};

	if(!support && $.fn.jquery){
		$(function(){
			$(":input[autofocus]").focus();
		});
	}

})(this.LQ || this.jQuery);

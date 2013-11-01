Light Query v0.5
================

Light Query 最轻量级的js选择器
--------------------------------------

### 特性：
- 超轻量级，代码仅仅200行
- 动态DOM元素查找，即使是异步加入的DOM节点依然有效
- 在页面UI渲染之前运行，特别适用于代替以往UI渲染导致页面载入后闪动一次的场景

### 动态元素查找
```bash
var q = $(".test2").each(function(){
	this.innerHTML = "test11";
});
```

### 动态添加样式
```bash
q.style("color: red;");
```

### 停止动态元素查找，并删除样式
```bash
q.die();
```

### classList插件
```bash
var q = $(".test2").each(function(){
	this.classList.add("test8848");		//添加class
	this.classList.remove("test2");		//删除class
	this.classList.toggle("test3");		//切换class
	this.classList.contains("test3");	//判断class是否存在
});
```

### event插件
为IE提供addEventListener支持，并修正事件注册顺序和执行顺序相反的问题。
```bash
var q = $("a").each(function(){
	this.addEventListener("click", function(e){
		e.preventDefault();
		console.log(e.target);
	});
});
```

### attr插件
```bash
var q = $("a").each(function(){
	this.getAttribute("href"); //修正IE6 IE7下bug
});
```

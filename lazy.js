(function(){
	var win = window,
		doc = document,
		loc = doc.location,
		input =  doc.createElement("input"),
		base = doc.scripts || document.getElementsByTagName("script"),
		callbackName = "LQ_lazy" + (+new Date()),
		paths = [],
		hooksInit,
		search,
		ext;

	function loadScript(url, js){
		doc.writeln("<script type=\"text/javascript\"" + ( url ? "src=\"" + url + "\"" : "" ) + ">" + (js || "") + "</script>");
	}

	function loadfile(paths, callback){
		if(isLocal){
			for(var i = 0; i < paths.length; i++){
				loadScript(base + paths[i]);
			}
		} else {
			loadScript(base + "??" + paths.join(",") + search);
		}
	}

	function addFile(name){
		if(!/\.\w+/.test(name)){
			name += ext;
		}
		if(isLocal && !/\?\w+/.test(name)){
			name += search;
		}
		paths.push(name);
	}

	base = base[base.length - 1].getAttribute("src", 2).replace(/[^\/]*$/, function(file){
		search = file.match(/\?.*/);
		search = search ? search[0] : "";
		ext = /.min./i.test(file) ? ".min.js" : ".js";
		return "";
	});

	isLocal = !base || !loc.host || (base.indexOf(loc.protocol) == 0 && base.indexOf(loc.host) > 0);

	hooksInit = {
		array: ![].forEach || ![].some,
		string: !"".trim || !"".trimLeft,
		classlist : !input.classList,
		attr: !input.querySelector,
		event: !input.addEventListener
	};

	addFile("lightquery");

	for(var i in hooksInit){
		if(hooksInit[i]){
			addFile(i);
		}
	}

	loadfile(paths);

})();
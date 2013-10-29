(function(){
	var strProp = String.prototype;
	//补全低端浏览器下的String.prototype.trim
	if(!strProp.trim){
		strProp.trim = function(){
			return this.replace(/^\s+|\s+$/g, "");
		};
	}
	if(!strProp.trimLeft){
		strProp.trim = function(){
			return this.replace(/^\s+/g, "");
		};
	}
	if(!strProp.trimRight){
		strProp.trim = function(){
			return this.replace(/\s+$/g, "");
		};
	}

})();
//TODO Add unit test for utility
var u = (function (){
    return {
        endsWith : function(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        startsWith : function(str, prefix){
            var result;
            if(str == null && prefix == null){
                result = true;
            } else if ((str == null && prefix != null) ||(str != null && prefix == null)){
                result = false;
            } else {
                result = str.slice(0, prefix.length) == prefix;
            }
            return result;
        },
        valueOf : function(id){
            var element, value;
            if(id != null){
                element = document.getElementById(id);
                if(element != null && element != undefined){
                    value = element.value;
                } else {
                    console.error("Element with ID[" + id + "] not found");
                }
            } else {
                console.error("ID is null");
            }
            return value;
        }
    };
})();

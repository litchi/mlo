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
                    console.warn("Element with ID[" + id + "] not found");
                }
            } else {
                console.warn("ID is null");
            }
            return value;
        },
        setValue : function(id, value){
            var element;
            if(id != null){
                element = document.getElementById(id); 
                if(element != null && element != undefined){
                    element.value = value;
                } else {
                    console.warn("Element with ID[" + id + "] not found trying to set value to [" + value + "]");
                }
            } else {
                console.warn("ID is null trying to set value to [" + value + "]");
            } 
        },
        isFunction : function(func){
            return false === (func === void 0);
        },

        appendOption : function(dropDown, value, innerHTML){
            var option = document.createElement('option');
            option.setAttribute('value',value);
            option.innerHTML = innerHTML;
            dropDown.appendChild(option);
        },

        getFullDateTimeStr : function(myDate){
            var resultStr = myDate.getFullYear() +  '-' 
            + ('0' + (myDate.getMonth()+1)).slice(-2) + '-'
            + ('0' + myDate.getDate()).slice(-2) + 'T' 
            + ('0' + myDate.getHours()).slice(-2) + '-'
            + ('0' + myDate.getMinutes()).slice(-2);
            return resultStr;
        }
    };
})();

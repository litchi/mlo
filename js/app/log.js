var log = (function (){
    function getFunctionName(func) {
        if ( typeof func == 'function' || typeof func == 'object' ) {
            var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
        }
        return name && name[1];
    }
    return {
        logDatabaseNotOpenError : function (logEnable){
            if(logEnable){
                console.error("Error: Database needs to be opened before sql can be processed");
                throw ("Error: Database needs to be opened before sql can be processed");
            }
        },
        logSqlError : function (msg, e){
            console.error("------------------------------SQL Error Log Start------------------------------");
            console.error(msg)        
            console.error("Error Code: " + e.code);
            console.error("Error Msge: " + e.message);
            console.error("------------------------------SQL Error Log Stopp------------------------------\n");
        },
        logObjectData : function(name, obj, logEnable) {
            if(logEnable) {
                for(var key in obj) {
                    try{
                        var value = obj[key];
                        if(typeof value === 'object'){
                            console.debug(name + " : [" + key + "][" + value + "]"); 
                            log.logObjectData("\t" + key, value, logEnable);
                        } else {
                            console.debug(name + " : [" + key + "][" + value + "]"); 
                        }
                    }catch (e){}
                }
            }
        },
        logSqlStatement : function(sql, data, logEnable){
            if(logEnable){
                console.debug("SQL: [" + sql + "], Data: [" + data + "]");
            }
        },
        logDbInfo : function (name, displayname, version, logEnable){
            if(logEnable){
                console.info("Name         : " + name);
                console.info("Display name : " + displayname);
                console.info("Version      : " + version);
            }
        }
    };
})();

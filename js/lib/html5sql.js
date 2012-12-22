var html5sql = (function () {

    sqlProcessor = function (transaction, sql, data, finalSuccessCallback, finalFailureCallback) {
        if(html5sql.logDebug){
            console.debug("SQL: [" + sql + "], Data: [" + data + "]");
        }
        finalSuccessCallback = (finalSuccessCallback === void 0) ? function(){} : finalSuccessCallback;
        finalFailureCallback = (finalFailureCallback === void 0) ? function(){} : finalFailureCallback;
        successCallback = function (transaction, results) {
            var rowsArray = putResultOfSelectIntoArray(sql, results);
            if(html5sql.logDebug) {
                console.debug("Result array is " + rowsArray);
            }
            finalSuccessCallback(transaction, results, rowsArray);
        };
        failureCallback = function(transaction, error){
            if(html5sql.logErrors){
                console.error("Error: " + error.message + " while processing statment: " + sql);
            }
            finalFailureCallback(transaction, error);
        };   
        transaction.executeSql(sql, data, successCallback, failureCallback);
    },
    putResultOfSelectIntoArray = function (sql, sqlResultSet){
        var max, rowsArray = [];
        if(html5sql.putSelectResultsInArray && (new RegExp('^select\\s', 'i')).test(sql)){
            for(i = 0, max = sqlResultSet.rows.length; i < max; i++){
                rowsArray[i] = sqlResultSet.rows.item(i);
            }
        } else {
            rowsArray = null;
        }
        return rowsArray;
    }
    logDatabaseNotOpenError = function (){
        if(html5sql.logErrors){
            console.error("Error: Database needs to be opened before sql can be processed");
            throw ("Error: Database needs to be opened before sql can be processed");
        }
    }
    return {
        database: null, logInfo: true, logErrors: true, logDebug: true, putSelectResultsInArray: true,
        openDatabase: function (name, version, displayname, size, whenOpen) {
            whenOpen = (whenOpen === void 0) ? function(){} : whenOpen;
            html5sql.database = openDatabase(name, version, displayname, size, whenOpen);
            if(html5sql.logInfo){
                console.info("Name         : " + name);
                console.info("Display name : " + displayname);
                console.info("Version      : " + html5sql.database.version);
            }
        },

        process: function (sql, data, finalSuccessCallback, failureCallback) {
            if (html5sql.database) {
                html5sql.database.transaction(function (transaction) {
                    sqlProcessor(transaction, sql, data, finalSuccessCallback, failureCallback);
                });
            } else {
                logDatabaseNotOpenError();
                return false;
            }
        },

        changeVersion: function (oldVersion, newVersion, sql, finalSuccessCallback, failureCallback) {
            if (html5sql.database) {
                if(html5sql.database.version === oldVersion){
                    html5sql.database.changeVersion(oldVersion, newVersion, function (transaction) {
                        sqlProcessor(transaction, sql, finalSuccessCallback, failureCallback);
                    });
                }
            } else {
                logDatabaseNotOpenError();
                return false;
            }

        }
    };
})();

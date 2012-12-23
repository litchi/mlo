var html5sql = (function () {

    sqlMatch = function(pattern, sql){
        return (new RegExp(pattern, 'i')).test(sql);
    }

    isSelect = function(sql){ return sqlMatch('^select\\s', sql);}
    isInsert = function(sql){ return sqlMatch('^insert\\s', sql);}
    isUpdate = function(sql){ return sqlMatch('^update\\s', sql);}
    isDelete = function(sql){ return sqlMatch('^delete\\s', sql);}

    sqlProcessor = function (transaction, sql, data, finalSuccessCallback, finalFailureCallback) {
        log.logSqlStatement(sql,data, html5sql.logInfo);
        finalSuccessCallback = (finalSuccessCallback === void 0) ? function(){} : finalSuccessCallback;
        finalFailureCallback = (finalFailureCallback === void 0) ? function(){} : finalFailureCallback;
        successCallback = function (transaction, results) {
            var rowsArray = [];
            log.logObjectData("ResultSet", results, html5sql.logDebug);
            if(html5sql.putSelectResultsInArray && isSelect(sql)){
                rowsArray = putResultOfSelectIntoArray(sql, results);
            } else if(html5sql.putInsertIdInArray && isInsert(sql)){
                rowsArray[0] = results.insertId;
            }
            log.logObjectData("Result Array", rowsArray, html5sql.logDebug);
            finalSuccessCallback(transaction, results, rowsArray);
        };
        failureCallback = function(transaction, error){
            log.logObjectData("Error Message", error, html5sql.logInfo);
            finalFailureCallback(transaction, error);
        };   
        transaction.executeSql(sql, data, successCallback, failureCallback);
    },

    putResultOfSelectIntoArray = function (sql, sqlResultSet){
        var max, result = [];
        for(i = 0, max = sqlResultSet.rows.length; i < max; i++){
            obj = sqlResultSet.rows.item(i);
            result[i] = obj;
        }
        return result;
    }

    return {
        database: null, logInfo: true, logErrors: true, logDebug: true, 
        putSelectResultsInArray: true, putInsertIdInArray : true,
        openDatabase: function (name, version, displayname, size, whenOpen) {
            whenOpen = (whenOpen === void 0) ? function(){} : whenOpen;
            html5sql.database = openDatabase(name, version, displayname, size, whenOpen);
            logDbInfo(name, displayname, version, logInfo);
        },

        process: function (sql, data, finalSuccessCallback, failureCallback) {
            if (html5sql.database) {
                html5sql.database.transaction(function (transaction) {
                    sqlProcessor(transaction, sql, data, finalSuccessCallback, failureCallback);
                });
            } else {
                log.logDatabaseNotOpenError(html5sql.logErrors);
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
                log.logDatabaseNotOpenError(html5sql.logErrors);
                return false;
            }

        }
    };
})();

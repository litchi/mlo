var dataAccess = (function (){
    var appInfoDb, db_schema_version = ''; 

    sqlMatch = function(pattern, sql){
        return (new RegExp(pattern, 'i')).test(sql);
    }

    isSelect = function(sql){ return sqlMatch('^select\\s', sql);}
    isInsert = function(sql){ return sqlMatch('^insert\\s', sql);}
    isUpdate = function(sql){ return sqlMatch('^update\\s', sql);}
    isDelete = function(sql){ return sqlMatch('^delete\\s', sql);}

    sqlProcessor = function (transaction, sql, data, finalSuccessCallback, finalFailureCallback) {
        log.logSqlStatement(sql,data, dataAccess.logQuerySql);
        finalSuccessCallback = (finalSuccessCallback === void 0) ? function(){} : finalSuccessCallback;
        finalFailureCallback = (finalFailureCallback === void 0) ? function(){} : finalFailureCallback;
        successCallback = function (transaction, sqlResultSet) {
            var resultObjs = [];
            if(isSelect(sql)){
                resultObjs = dataAccess.sqlResultSetToArray(sqlResultSet);
            } else if(isInsert(sql)){
                resultObjs[0] = sqlResultSet.insertId;
            }
            log.logObjectData("Result Array", resultObjs, dataAccess.logQueryResult);
            finalSuccessCallback(transaction, sqlResultSet, resultObjs);
        };
        failureCallback = function(transaction, error){
            log.logSqlError("Error run SQL: [" + sql + "], data[" + data + "]", error, dataAccess.logError);
            finalFailureCallback(transaction, error);
        };   
        transaction.executeSql(sql, data, successCallback, failureCallback);
    }


    function runSQL(sql, data, successCallback, failureCallback){
        if(null == dataAccess.appDb){
            dataAccess.createDatabaseConnection();
            setTimeout(function(){
                dataAccess.appDb.transaction(function(tx){
                    sqlProcessor(tx, sql, data, successCallback, failureCallback);
                }, function(error){
                    log.logSqlError("Failed to run SQL[" + sql + "] with data[" + data + "]", error);
                }, function(){});
            }, 1000);
        } else {
            dataAccess.appDb.transaction(function(tx){
                sqlProcessor(tx, sql, data, successCallback, failureCallback);
            }, function(error){
                log.logSqlError("Failed to run SQL[" + sql + "] with data[" + data + "]", error);
            }, function(){});
        }
    }

    function openAppDb(){
        dataAccess.appDb = openDatabase(SQL.DB_NAME, db_schema_version, SQL.DB_DESCRIPTION, SQL.DB_SIZE, dataAccess.initAppDb);
        log.logDbInfo(SQL.DB_NAME, SQL.DB_DESCRIPTION, db_schema_version, dataAccess.logInfo);
        if(null == dataAccess.appDb){
            console.error("Failed to open application database");
        }
    }

    return {
        logInfo     : true,
        logError    : true,
        logDebug    : true,
        logQueryResult : false,
        logQuerySql : false,
        appDb : null,
        dropAllTables : function(tx){
            dataAccess.runSqlDirectly(tx, 'drop table task');
            dataAccess.runSqlDirectly(tx, 'drop table task_meta');
            dataAccess.runSqlDirectly(tx, 'drop table meta_type');
            dataAccess.runSqlDirectly(tx, 'drop table meta');
            dataAccess.runSqlDirectly(tx, 'drop table task_note');
        },

        initAppDb : function(db){
            db.transaction(function(tx){
                createTables(tx);
                dataAccess.runSqlDirectly(tx, 'alter table task add column reminder_on integer');                
                dataAccess.runSqlDirectly(tx, 'alter table task add column next_reminder_time integer');                
                dataAccess.runSqlDirectly(tx, 'CREATE VIEW task_view AS select task.id as task_id, task.name as task_name, task.status as task_status, task.reminder_on as task_reminder_on, task.next_reminder_time as task_reminder_time, meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from task join task_meta on task_meta.task_id = task.id join meta on task_meta.meta_id = meta.id join meta_type on meta_type.id = meta.meta_type_id');
                dataAccess.runSqlDirectly(tx, 'CREATE VIEW meta_view AS select meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from meta join meta_type on meta_type.id = meta.meta_type_id');
                loadSeedAndSampleData();
            }, function(error){
                log.logSqlError("Failed to create tables", error);
            }, function(){
                console.info("Successfully created tables");
            });
        },

        initAppInfoDb : function(db){
            db.transaction(function(tx){
                dataAccess.runSqlDirectly(tx, APP_SQL.APP_INFO.CREATE_TABLE);
            }, function(error){
                log.logSqlError("Failed to create app info table", error);
            }, function(){
                console.log("Successfully created app info table");
            });
        },

        runSqlDirectly : function(tx, sql, data, callback){
            if((null == data) || (undefined == data)){
                data = [];
            }
            tx.executeSql(sql, data, function(tx, result){
                log.logSqlStatement(sql,data, dataAccess.logQuerySql);
                if(u.isFunction(callback)){
                    callback(tx, result);
                }
            }, function(tx, error){
                log.logSqlError("SQL failed: [" + sql + "], data: [" + data + "]", error);
            });
        },

        sqlResultSetToArray : function (sqlResultSet){
            var max, result = [];
            for(i = 0, max = sqlResultSet.rows.length; i < max; i++){
                obj = sqlResultSet.rows.item(i);
                result[i] = obj;
            }
            return result;
        },

        createDatabaseConnection: function (){
            if(dataAccess.appDb === null){
                appInfoDb = openDatabase('xiangqian_liu_apps_info_db', '', 'App info for Liu Xiangqian\'s Applications', 1024, dataAccess.initAppInfoDb);
                setTimeout(function(){
                    appInfoDb.transaction(function(tx){
                        dataAccess.runSqlDirectly(tx, "select db_schema_version from app_info where app_id = ?", ['BB10GTD'], 
                            function(tx, result){
                                if((result != null) 
                                    && (result.rows != null)
                                && (1 == result.rows.length )
                                && (result.rows.item != null)
                                && (result.rows.item(0) != null)
                                && (result.rows.item(0)['db_schema_version'] != null)){
                                    db_schema_version = result.rows.item(0)['db_schema_version'];                
                                    console.info("DB Schema version for app[BB10GTD] is [" + db_schema_version + "]");
                                    openAppDb();
                                } else {
                                    console.info("DB Schema version for app[BB10GTD] not existing");
                                    appInfoDb.transaction(function(tx1){
                                        dataAccess.runSqlDirectly(
                                            tx1, 
                                            "insert into app_info(app_id, name, version, db_schema_version, additional_info) values (?, ?, ?, ?, ?)", 
                                            ['BB10GTD', 'Peaceful & Better Life App', '0.0.1', '','Peaceful & Better Life App']
                                        );
                                    }, function(error){
                                        log.logSqlError("Failed to insert app info for BB10GTD app", error);
                                    }, function(){
                                        console.log("Successfully insert app info for BB10GTD to app_info table");
                                        openAppDb();
                                    });
                                }
                            });
                    }, function(error){
                        log.logSqlError("Failed to query for db_schema_version for app[BB10GTD]", error);
                    });
                }, 100);
            }
        },

        task : {
            create: function(name, successCallback, failureCallback){
                runSQL(SQL.TASK.INSERT_BY_NAME, [name], successCallback, failureCallback);
            },
            delete: function(id, successCallback, failureCallback){
                runSQL(SQL.TASK.DELETE_BY_ID, [id], successCallback, failureCallback);
            },
            update: function(id, name, successCallback, failureCallback){
                runSQL(SQL.TASK.UPDATE_BY_ID, [name, id], successCallback, failureCallback);
            },
            updateStatus: function(id, statusKey, successCallback, failureCallback){
                runSQL(SQL.TASK.UPDATE_STATUS_BY_ID, [statusKey, id], successCallback, failureCallback);
            },
            getByMeta: function(metaTypeName, metaName, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_META_NAME,[metaName, metaTypeName, seedData.taskDoneStatus], successCallback, failureCallback);
            },
            getByMetaType: function(metaTypeName, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_META_TYPE,[metaTypeName, seedData.taskDoneStatus], successCallback, failureCallback);
            },
            getAll: function(successCallback, failureCallback) {
                runSQL(SQL.TASK.FILTER_BY_STATUS, [seedData.taskDoneStatus], successCallback, failureCallback);
            },
            getById: function(id, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_ID, [id], successCallback, failureCallback);
            },
            getByName: function(name, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_NAME, [name], successCallback, failureCallback);
            },
            getByIdAndName: function(id, name, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_ID_NAME , [id, name], successCallback, failureCallback);
            },
        },

        metaType : {
            create : function(name, description, successCallback, failureCallback) {
                runSQL(SQL.META_TYPE.INSERT_BY_NAME, [name, description], successCallback, failureCallback);            
            },        
            delete : function(id, successCallback, failureCallback) {
                runSQL(SQL.META_TYPE.DELETE_BY_ID, [id], successCallback, failureCallback);            
            },        
            update : function(id, name, description, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.UPDATE_BY_ID, [name, description, id], successCallback, failureCallback);
            },
            //Write Test case for this method.
            getAll : function(successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_ALL, [], successCallback, failureCallback);
            },
            getById : function(id, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_ID, [id], successCallback, failureCallback);
            },
            getByName : function(name, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_NAME, [name], successCallback, failureCallback);
            },
            getByIdAndName : function(id, name, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_ID_NAME , [id, name], successCallback, failureCallback);
            },
        },

        meta : {
            create : function(name, meta_type_id, description, successCallback, failureCallback){
                runSQL(SQL.META.INSERT_BY_NAME_TYPE, [name, meta_type_id, description], successCallback, failureCallback);
            },
            delete : function(id, successCallback, failureCallback){
                runSQL(SQL.META.DELETE_BY_ID,[id], successCallback, failureCallback);
            },
            update : function(id, name, description, successCallback, failureCallback){
                if(null == description){
                    runSQL(SQL.META.UPDATE_NAME_BY_ID, [name, id], successCallback, failureCallback);
                } else {
                    runSQL(SQL.META.UPDATE_BY_ID, [name, description, id], successCallback, failureCallback);
                }           
            },
            getById : function(id, successCallback, failureCallback){
                runSQL(SQL.META.SELECT_BY_ID, [id], successCallback, failureCallback);
            },
            //TODO Possible bug: if user creates a meta has the same name with Pre-defined, then there will be issue
            getByName : function(name, successCallback, failureCallback){
                runSQL(SQL.META.SELECT_BY_NAME, [name], successCallback, failureCallback);
            },
            getInBasketMeta: function(successCallback, failureCallback){
                dataAccess.meta.getByName(seedData.inBasketMetaName, successCallback, failureCallback);
            },
            getNextActionMeta: function(successCallback, failureCallback){
                dataAccess.meta.getByName(seedData.nextActionMetaName, successCallback, failureCallback);
            },
            getSomedayMeta: function(successCallback, failureCallback){
                dataAccess.meta.getByName(seedData.somedayMetaName, successCallback, failureCallback);
            },
            getByTypeId : function(metaTypeId, successCallback, failureCallback){
                runSQL(SQL.META.SELECT_BY_TYPE_ID, [metaTypeId], successCallback, failureCallback);
            },
            getByTypeName : function(metaTypeName, successCallback, failureCallback){
                dataAccess.metaType.getByName(metaTypeName, function(tx, results, arrays){ 
                    if(
                        arrays != null && 
                        arrays != undefined && 
                        arrays.length >= 0 && 
                        arrays[0] != undefined && 
                        arrays[0] != null
                    ){
                        metaTypeId = arrays[0][SQL.META_TYPE.COLS.ID];
                        getByTypeId(metaTypeId, successCallback, failureCallback);
                    } else {
                        console.error ("Meta Type with name [" + metaTypeName + "] not exists");
                    }
                }, function(tx, error) {
                    console.error("Error to get Meta of Type [" + metaTypeName + "]");
                });
            },
        },

        taskMeta : {
            create : function(taskId, metaId, successCallback, failureCallback){
                runSQL(SQL.TASK_META.INSERT, [taskId, metaId], successCallback, failureCallback);
            },       
            getTasksByMetaId : function(metaId, successCallback, failureCallback){
                runSQL(SQL.TASK_META.SELECT_TASK_BY_META_ID, [metaId], successCallback, failureCallback);
            },
            getMetasByTaskId: function(taskId, successCallback, failureCallback){
                runSQL(SQL.TASK_META.SELECT_META_BY_TASK_ID, [taskId], successCallback, failureCallback);
            },
            throwTaskToList : function(taskId, metaName, metaTypeName, successCallback, failureCallback){
                runSQL(SQL.TASK_META.THROW_TASK_TO_LIST, [taskId, metaName, metaTypeName], successCallback, failureCallback);
            },
            moveTaskToGtdList : function(taskId, metaName, successCallback, failureCallback){
                runSQL(SQL.TASK_META.DELETE_META_BY_TYPE, [taskId, seedData.gtdMetaTypeName], function(tx, result, objs){
                    runSQL(SQL.TASK_META.THROW_TASK_TO_LIST, [taskId, metaName, seedData.gtdMetaTypeName], successCallback, failureCallback);
                }, failureCallback);
            },
        },
    };
})();


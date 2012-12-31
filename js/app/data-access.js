
var dataAccess = (function (){
    var dbInited = false;

    function runSQL(sql, data, successCallback, failureCallback){
        dataAccess.createDatabaseConnection();
        html5sql.process(sql, data, successCallback, failureCallback);
    }

    return {
        logInfo: false,
        logErrors: true,
        createDatabaseConnection: function (){
            if(dbInited != true){
                if(html5sql.database === null){
                    html5sql.database = openDatabase('peaceful_better_life_xiangqian_liu', '0.0.3', 
                                                     'Local Database for Peaceful & Better Life App', 2*1024*1024);
                }
                dbInited = (html5sql.database != null);
            }
            return html5sql.database;
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
            markAsDone: function(id, successCallback, failureCallback){
                runSQL(SQL.TASK.UPDATE_STATUS_BY_ID, [seedData.taskDoneStatus, id], successCallback, failureCallback);
            },
            getByMeta: function(metaTypeName, metaName, successCallback, failureCallback){
                runSQL(SQL.TASK.SELECT_BY_META_NAME,[metaName, metaTypeName, seedData.taskDoneStatus], successCallback, failureCallback);
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
        },
    };
})();



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
        //TODO Add delete by name
            create: function(name, successCallback, failureCallback){
                runSQL(SQL.TASK.INSERT_BY_NAME, [name], successCallback, failureCallback);
            },
            delete: function(id, successCallback, failureCallback){
                runSQL(SQL.TASK.DELETE_BY_ID, [id], successCallback, failureCallback);
            },
            update: function(id, name, successCallback, failureCallback){
                runSQL(SQL.TASK.UPDATE_BY_ID, [name, id], successCallback, failureCallback);
            },
            getAll: function(successCallback, failureCallback) {
                runSQL(SQL.TASK.SELECT_ALL, [], successCallback, failureCallback);
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
            //TODO Add delete by name
            create: function(name, description, successCallback, failureCallback) {
                runSQL(SQL.META_TYPE.INSERT_BY_NAME, [name, description], successCallback, failureCallback);            
            },        
            delete: function(id, successCallback, failureCallback) {
                runSQL(SQL.META_TYPE.DELETE_BY_ID, [id], successCallback, failureCallback);            
            },        
            update: function(id, name, description, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.UPDATE_BY_ID, [name, description, id], successCallback, failureCallback);
            },
            getById: function(id, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_ID, [id], successCallback, failureCallback);
            },
            getByName: function(name, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_NAME, [name], successCallback, failureCallback);
            },
            getByIdAndName: function(id, name, successCallback, failureCallback){
                runSQL(SQL.META_TYPE.SELECT_BY_ID_NAME , [id, name], successCallback, failureCallback);
            },
        },

        meta : {
            create : function(name, meta_type_id, description, successCallback, failureCallback){
                runSQL(SQL.META.INSERT_BY_NAME_TYPE, [name, meta_type_id, description], successCallback, failureCallback);
            },
        },

    };
})();


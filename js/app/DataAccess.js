﻿/*jslint browser: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, uiConfig, openDatabase, AppSql, SeedSampleDataProvider*/
var DataAccess = (function () {
    "use strict";
    var appInfoDb, db_schema_version = '';

    function sqlMatch(pattern, sql) { return (new RegExp(pattern, 'i')).test(sql); }
    function isSelect(sql) { return sqlMatch('^select\\s', sql); }
    function isInsert(sql) { return sqlMatch('^insert\\s', sql); }
    function isUpdate(sql) { return sqlMatch('^update\\s', sql); }
    function isDelete(sql) { return sqlMatch('^delete\\s', sql); }

    function sqlProcessor(transaction, sql, data, finalSuccessCallback, finalFailureCallback) {
        var successCallback, failureCallback;
        log.logSqlStatement(sql, data, DataAccess.logQuerySql);
        finalSuccessCallback = (finalSuccessCallback === void 0) ? function () {} : finalSuccessCallback;
        finalFailureCallback = (finalFailureCallback === void 0) ? function () {} : finalFailureCallback;
        successCallback = function (transaction, sqlResultSet) {
            var resultObjs = [];
            if (isSelect(sql)) {
                resultObjs = DataAccess.sqlResultSetToArray(sqlResultSet);
            } else if (isInsert(sql)) {
                resultObjs[0] = sqlResultSet.insertId;
            }
            log.logObjectData("Result Array", resultObjs, DataAccess.logQueryResult);
            finalSuccessCallback(transaction, sqlResultSet, resultObjs);
        };
        failureCallback = function (transaction, error) {
            log.logSqlError("Error run SQL: [" + sql + "], data[" + data + "]", error, DataAccess.logError);
            finalFailureCallback(transaction, error);
        };
        transaction.executeSql(sql, data, successCallback, failureCallback);
    }

    function runSQL(sql, data, successCallback, failureCallback) {
        if (null === DataAccess.appDb) {
            DataAccess.createDatabaseConnection();
            setTimeout(function () {
                DataAccess.appDb.transaction(function (tx) {
                    sqlProcessor(tx, sql, data, successCallback, failureCallback);
                }, function (error) {
                    log.logSqlError("Failed to run SQL[" + sql + "] with data[" + data + "]", error);
                }, function () {});
            }, 1000);
        } else {
            DataAccess.appDb.transaction(function (tx) {
                sqlProcessor(tx, sql, data, successCallback, failureCallback);
            }, function (error) {
                log.logSqlError("Failed to run SQL[" + sql + "] with data[" + data + "]", error);
            }, function () {});
        }
    }

    function openAppDb() {
        DataAccess.appDb = openDatabase(Sql.DbName, db_schema_version, Sql.DbDescription, Sql.DbSize, DataAccess.initAppDb);
        log.logDbInfo(Sql.DbName, Sql.DbDescription, db_schema_version, DataAccess.logInfo);
        if (null === DataAccess.appDb) {
            console.error("Failed to open application database");
        }
    }

    function createTables(tx) {
        DataAccess.runSqlDirectly(tx, Sql.Task.CreateTable);
        DataAccess.runSqlDirectly(tx, Sql.MetaType.CreateTable);
        DataAccess.runSqlDirectly(tx, Sql.Meta.CreateTable);
        DataAccess.runSqlDirectly(tx, Sql.TaskMeta.CreateTable);
        DataAccess.runSqlDirectly(tx, Sql.TaskNote.CreateTable);
    }

    return {
        logInfo        : true,
        logError       : true,
        logDebug       : false,
        logQueryResult : false,
        logQuerySql    : false,
        appDb          : null,
        dropAllTables : function (tx) {
            DataAccess.runSqlDirectly(tx, 'drop table task');
            DataAccess.runSqlDirectly(tx, 'drop table task_meta');
            DataAccess.runSqlDirectly(tx, 'drop table meta_type');
            DataAccess.runSqlDirectly(tx, 'drop table meta');
            DataAccess.runSqlDirectly(tx, 'drop table task_note');
        },

        initAppDb : function (db) {
            db.transaction(function (tx) {
                createTables(tx);
                DataAccess.runSqlDirectly(tx, 'alter table task add column reminder_on integer');
                DataAccess.runSqlDirectly(tx, 'alter table task add column due_date integer');
                DataAccess.runSqlDirectly(tx, 'alter table meta add column ui_rank integer default 0');
                DataAccess.runSqlDirectly(tx, 'CREATE VIEW task_view AS select task.id as task_id, task.name as task_name, task.status as task_status, task.reminder_on as task_reminder_on, task.due_date as task_due_date, meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from task join task_meta on task_meta.task_id = task.id join meta on task_meta.meta_id = meta.id join meta_type on meta_type.id = meta.meta_type_id');
                DataAccess.runSqlDirectly(tx, 'CREATE VIEW meta_view AS select meta.id as meta_id, meta.name as meta_name, meta.description as meta_description, meta.ui_rank as meta_ui_rank, meta_type.id as meta_type_id, meta_type.name as meta_type_name, meta_type.description as meta_type_description, meta_type.internal as meta_type_internal from meta join meta_type on meta_type.id = meta.meta_type_id');
                SeedSampleDataProvider.loadSeedAndSampleData();
            }, function (error) {
                log.logSqlError("Failed to create tables", error);
            }, function () {
                console.info("Successfully created tables");
            });
        },

        initAppInfoDb : function (db) {
            db.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, AppSql.AppInfo.CreateTable);
            }, function (error) {
                log.logSqlError("Failed to create app info table", error);
            }, function () {
                console.log("Successfully created app info table");
            });
        },

        runSqlDirectly : function (tx, sql, data, callback) {
            if ((null === data) || (undefined === data)) {
                data = [];
            }
            tx.executeSql(sql, data, function (tx, result) {
                log.logSqlStatement(sql, data, DataAccess.logQuerySql);
                if (Util.isFunction(callback)) {
                    callback(tx, result);
                }
            }, function (tx, error) {
                log.logSqlError("SQL failed: [" + sql + "], data: [" + data + "]", error);
            });
        },

        sqlResultSetToArray : function (sqlResultSet) {
            var max, result = [], i, obj;
            for (i = 0, max = sqlResultSet.rows.length; i < max; i += 1) {
                obj = sqlResultSet.rows.item(i);
                result[i] = obj;
            }
            return result;
        },

        createDatabaseConnection: function () {
            if (DataAccess.appDb === null) {
                appInfoDb = openDatabase('xiangqian_liu_apps_info_db', '', 'App info for Liu Xiangqian\'s Applications', 1024, DataAccess.initAppInfoDb);
                setTimeout(function () {
                    appInfoDb.transaction(function (tx) {
                        DataAccess.runSqlDirectly(tx, "select db_schema_version from app_info where app_id = ?", ['BB10GTD'],
                            function (tx, result) {
                                if ((result !== null)
                                        && (result.rows !== null)
                                        && (1 === result.rows.length)
                                        && (result.rows.item !== null)
                                        && (result.rows.item(0) !== null)
                                        && (result.rows.item(0).db_schema_version !== null)) {
                                    db_schema_version = result.rows.item(0).db_schema_version;
                                    console.info("DB Schema version for app[BB10GTD] is [" + db_schema_version + "]");
                                    openAppDb();
                                } else {
                                    console.info("DB Schema version for app[BB10GTD] not existing");
                                    appInfoDb.transaction(function (tx1) {
                                        DataAccess.runSqlDirectly(
                                            tx1,
                                            "insert into app_info(app_id, name, version, db_schema_version, additional_info) values (?, ?, ?, ?, ?)",
                                            ['BB10GTD', 'Peaceful & Better Life App', '0.0.1', '', 'Peaceful & Better Life App']
                                        );
                                    }, function (error) {
                                        log.logSqlError("Failed to insert app info for BB10GTD app", error);
                                    }, function () {
                                        console.log("Successfully insert app info for BB10GTD to app_info table");
                                        openAppDb();
                                    });
                                }
                            });
                    }, function (error) {
                        log.logSqlError("Failed to query for db_schema_version for app[BB10GTD]", error);
                    });
                }, 100);
            }
        },

        task : {
            create: function (name, successCallback, failureCallback) {
                runSQL(Sql.Task.InsertByName, [name], successCallback, failureCallback);
            },
            deleteById: function (id, successCallback, failureCallback) {
                runSQL(Sql.Task.DeleteById, [id], successCallback, failureCallback);
            },
            update: function (id, name, successCallback, failureCallback) {
                runSQL(Sql.Task.UpdateById, [name, id], successCallback, failureCallback);
            },
            updateStatus: function (id, statusKey, successCallback, failureCallback) {
                runSQL(Sql.Task.UpdateStatusById, [statusKey, id], successCallback, failureCallback);
            },
            getByMeta: function (metaTypeName, metaName, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByMetaName, [metaName, metaTypeName, SeedData.TaskDoneStatus], successCallback, failureCallback);
            },
            getByMetaType: function (metaTypeName, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByMetaType, [metaTypeName, SeedData.TaskDoneStatus], successCallback, failureCallback);
            },
            getAll: function (successCallback, failureCallback) {
                runSQL(Sql.Task.FilterByStatus, [SeedData.TaskDoneStatus], successCallback, failureCallback);
            },
            getById: function (id, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectById, [id], successCallback, failureCallback);
            },
            getByName: function (name, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByName, [name], successCallback, failureCallback);
            },
            getByIdAndName: function (id, name, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByIdName, [id, name], successCallback, failureCallback);
            },
            getByDueMeta : function (dueMeta, successCallback, failureCallback) {
                var sql = Util.applySqlFilter(Sql.Task.DueFilterBaseSql, Sql.Task.DueFilterKey, Sql.Task.DueFilter[dueMeta]);
                runSQL(sql, [], successCallback, failureCallback);
            }
        },

        metaType : {
            create : function (name, description, successCallback, failureCallback) {
                runSQL(Sql.MetaType.InsertByName, [name, description], successCallback, failureCallback);
            },
            deleteById : function (id, successCallback, failureCallback) {
                runSQL(Sql.MetaType.DeleteById, [id], successCallback, failureCallback);
            },
            update : function (id, name, description, successCallback, failureCallback) {
                runSQL(Sql.MetaType.UpdateById, [name, description, id], successCallback, failureCallback);
            },
            //Write Test case for this method.
            getAll : function (successCallback, failureCallback) {
                runSQL(Sql.MetaType.SelectAll, [], successCallback, failureCallback);
            },
            getById : function (id, successCallback, failureCallback) {
                runSQL(Sql.MetaType.SelectById, [id], successCallback, failureCallback);
            },
            getByName : function (name, successCallback, failureCallback) {
                runSQL(Sql.MetaType.SelectByName, [name], successCallback, failureCallback);
            },
            getByIdAndName : function (id, name, successCallback, failureCallback) {
                runSQL(Sql.MetaType.SelectByIdName, [id, name], successCallback, failureCallback);
            }
        },

        meta : {
            create : function (name, meta_type_id, description, successCallback, failureCallback) {
                runSQL(Sql.Meta.Insert, [name, meta_type_id, description], successCallback, failureCallback);
            },
            deleteById : function (id, successCallback, failureCallback) {
                runSQL(Sql.Meta.DeleteById, [id], successCallback, failureCallback);
            },
            update : function (id, name, description, successCallback, failureCallback) {
                if (null === description) {
                    runSQL(Sql.Meta.UpdateNameById, [name, id], successCallback, failureCallback);
                } else {
                    runSQL(Sql.Meta.UpdateById, [name, description, id], successCallback, failureCallback);
                }
            },
            getById : function (id, successCallback, failureCallback) {
                runSQL(Sql.Meta.SelectById, [id], successCallback, failureCallback);
            },
            //TODO Possible bug: if user creates a meta has the same name with Pre-defined, then there will be issue
            getByName : function (name, successCallback, failureCallback) {
                runSQL(Sql.Meta.SelectByName, [name], successCallback, failureCallback);
            },
            getInBasketMeta: function (successCallback, failureCallback) {
                DataAccess.meta.getByName(SeedData.BasketMetaName, successCallback, failureCallback);
            },
            getNextActionMeta: function (successCallback, failureCallback) {
                DataAccess.meta.getByName(SeedData.NextActionMetaName, successCallback, failureCallback);
            },
            getSomedayMeta: function (successCallback, failureCallback) {
                DataAccess.meta.getByName(SeedData.SomedayMetaName, successCallback, failureCallback);
            },
            getByTypeId : function (metaTypeId, successCallback, failureCallback) {
                runSQL(Sql.Meta.SelectByTypeId, [metaTypeId], successCallback, failureCallback);
            },
            getByTypeName : function (metaTypeName, successCallback, failureCallback) {
                DataAccess.metaType.getByName(metaTypeName, function (tx, results, arrays) {
                    var metaTypeId;
                    if (arrays !== null &&
                            arrays !== undefined &&
                            arrays.length >= 0 &&
                            arrays[0] !== undefined &&
                            arrays[0] !== null
                            ) {
                        metaTypeId = arrays[0][Sql.MetaType.Cols.Id];
                        DataAccess.meta.getByTypeId(metaTypeId, successCallback, failureCallback);
                    } else {
                        console.error("Meta Type with name [" + metaTypeName + "] not exists");
                    }
                }, function (tx, error) {
                    console.error("Error to get Meta of Type [" + metaTypeName + "]");
                });
            }
        },

        taskMeta : {
            create : function (taskId, metaId, successCallback, failureCallback) {
                runSQL(Sql.TaskMeta.Insert, [taskId, metaId], successCallback, failureCallback);
            },
            getTasksByMetaId : function (metaId, successCallback, failureCallback) {
                runSQL(Sql.TaskMeta.SelectTaskByMetaId, [metaId], successCallback, failureCallback);
            },
            getMetasByTaskId: function (taskId, successCallback, failureCallback) {
                runSQL(Sql.TaskMeta.SelectMetaByTaskId, [taskId], successCallback, failureCallback);
            },
            throwTaskToList : function (taskId, metaName, metaTypeName, successCallback, failureCallback) {
                runSQL(Sql.TaskMeta.ThrowTaskToList, [taskId, metaName, metaTypeName], successCallback, failureCallback);
            },
            moveTaskToGtdList : function (taskId, metaName, successCallback, failureCallback) {
                runSQL(Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.GtdMetaTypeName], function (tx, result, objs) {
                    runSQL(Sql.TaskMeta.ThrowTaskToList, [taskId, metaName, SeedData.GtdMetaTypeName], successCallback, failureCallback);
                }, failureCallback);
            }
        }
    };
}());
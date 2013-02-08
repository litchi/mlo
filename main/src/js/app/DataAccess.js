/*jslint browser: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, uiConfig, openDatabase, AppSql, SeedSampleDataProvider, Migrator*/
var DataAccess = (function () {
    "use strict";
    var appInfoDb, db_schema_version = '', dbOpenCheckCount = 0,
        dbOpenCheckInterval = 10, dbOpenCheckMaxCount = 100,
        dbOpenRequestSend = 0;

    function sqlMatch(pattern, sql) { return (new RegExp(pattern, 'i')).test(sql); }
    function isSelect(sql) { return sqlMatch('^select\\s', sql); }
    function isInsert(sql) { return sqlMatch('^insert\\s', sql); }
    function isUpdate(sql) { return sqlMatch('^update\\s', sql); }
    function isDelete(sql) { return sqlMatch('^delete\\s', sql); }

    function shouldRollback(sql) {
        return false === isSelect(sql);
    }

    function openDatabaseIfNecessary() {
        if (0 === dbOpenRequestSend) {
            DataAccess.createDatabaseConnection();
            dbOpenRequestSend = 1;
        }
    }

    function runSQL(sql, data, successCallback, failureCallback) {
        if (Util.notEmpty(DataAccess.appDb)) {
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, sql, data, successCallback, failureCallback);
            });
        } else {
            openDatabaseIfNecessary();
            if (dbOpenCheckCount < dbOpenCheckMaxCount) {
                if (Util.notEmpty(DataAccess.appDb)) {
                    dbOpenCheckCount = 0;
                    DataAccess.appDb.transaction(function (tx) {
                        DataAccess.runSqlDirectly(tx, sql, data, successCallback, failureCallback);
                    });
                } else {
                    window.setTimeout(runSQL, dbOpenCheckInterval);
                    dbOpenCheckCount += 1;
                    console.info("Checked [%d]times, [%d] ms for app db open, still not ready", dbOpenCheckCount, dbOpenCheckCount * dbOpenCheckInterval);
                }
            } else {
                console.error("Waited %d ms but db still haven't been ready", dbOpenCheckCount * dbOpenCheckInterval);
            }
        }
    }

    function openAppDb() {
        DataAccess.appDb = openDatabase(Sql.DbName, db_schema_version, Sql.DbDescription, Sql.DbSize, DataAccess.initAppDb);
        log.logDbInfo(Sql.DbName, Sql.DbDescription, db_schema_version, DataAccess.logInfo);
        if (null === DataAccess.appDb) {
            console.error("Failed to open application database");
        } else {
            DataAccess.migrateSchema();
        }
    }

    return {
        logInfo           : true,
        logError          : true,
        logDebug          : true,
        logQueryResult    : false,
        logQuerySql       : true,
        appDb             : null,
        dbFirstTimeCreate : false,
        dropAllTables : function (tx) {
            DataAccess.runSqlForMigrate(tx, 'drop table if exists task');
            DataAccess.runSqlForMigrate(tx, 'drop table if exists task_meta');
            DataAccess.runSqlForMigrate(tx, 'drop table if exists meta_type');
            DataAccess.runSqlForMigrate(tx, 'drop table if exists meta');
            DataAccess.runSqlForMigrate(tx, 'drop table if exists task_note');
            DataAccess.runSqlForMigrate(tx, 'drop view if exists task_view');
            DataAccess.runSqlForMigrate(tx, 'drop view if exists meta_view');
        },

        createTables : function (tx) {
            DataAccess.runSqlForMigrate(tx, Sql.Task.FirstVersionTable);
            DataAccess.runSqlForMigrate(tx, Sql.MetaType.FirstVersionTable);
            DataAccess.runSqlForMigrate(tx, Sql.Meta.FirstVersionTable);
            DataAccess.runSqlForMigrate(tx, Sql.TaskMeta.FirstVersionTable);
            DataAccess.runSqlForMigrate(tx, Sql.TaskNote.FirstVersionTable);
        },

        initAppDb : function (db) {
            db.transaction(function (tx) {
                DataAccess.createTables(tx);
            }, function (error) {
                log.logSqlError("Failed to create tables", error);
            }, function () {
                console.info("Successfully created tables");
            });
        },

        initAppInfoDb : function (db) {
            db.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, AppSql.AppInfo.FirstVersionTable);
            }, function (error) {
                log.logSqlError("Failed to create app info table", error);
            }, function () {
                console.log("Successfully created app info table");
            });
        },

        migrateSchema : function () {
            var m = new Migrator(DataAccess.appDb);
            m.setDebugLevel(Migrator.DEBUG_HIGH);
            m.migration(1, function (t) {
                SeedSampleDataProvider.loadSeedData(t);
            });
            m.migration(2, function (t) {
                DataAccess.runSqlForMigrate(t, 'alter table task add column reminder_on integer');
                DataAccess.runSqlForMigrate(t, 'alter table task add column due_date integer');
            });
            m.migration(3, function (t) {
                DataAccess.runSqlForMigrate(t, 'alter table meta add column ui_rank integer default 0');
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 30 where name = 'Today'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 25 where name = 'Tomorrow'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 27 where name = 'Overdue'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 20 where name = 'Overdue Yesterday'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 15 where name = 'This Week'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 10 where name = 'Next Week'");
                DataAccess.runSqlForMigrate(t, "update meta set ui_rank = 05 where name = 'Done Yesterday'");
            });
            m.migration(4, function (t) {
                DataAccess.runSqlForMigrate(t, 'drop view if exists task_view');
                DataAccess.runSqlForMigrate(t, 'drop view if exists meta_view');
                DataAccess.runSqlForMigrate(t, 'CREATE VIEW task_view AS select task.id as task_id, task.name as task_name, task.status as task_status, task.reminder_on as task_reminder_on, task.due_date as task_due_date, meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from task join task_meta on task_meta.task_id = task.id join meta on task_meta.meta_id = meta.id join meta_type on meta_type.id = meta.meta_type_id');
                DataAccess.runSqlForMigrate(t, 'CREATE VIEW meta_view AS select meta.id as meta_id, meta.name as meta_name, meta.description as meta_description, meta.ui_rank as meta_ui_rank, meta_type.id as meta_type_id, meta_type.name as meta_type_name, meta_type.description as meta_type_description, meta_type.internal as meta_type_internal from meta join meta_type on meta_type.id = meta.meta_type_id');
            });
            if (DataAccess.dbFirstTimeCreate === true) {
                m.migration(5, function (t) {
                    DataAccess.dbFirstTimeCreate = false;
                    SeedSampleDataProvider.loadSampleData(t);
                });
            }
            m.execute();
        },

        runSqlForMigrate : function (tx, sql, data, successCallback) {
            if (Util.isEmpty(data)) {
                data = [];
            }
            tx.executeSql(sql, data, function (tx, result) {
                console.info("Successfully run migrating SQL[" + sql + "] with data[" + data + "]");
                log.logObjectData(result);
                if (Util.isFunction(successCallback)) {
                    successCallback(tx, result);
                }
            }, function (tx, error) {
                log.logSqlError("Error running migrating SQL[" + sql + "] with data[" + data + "]", error);
            });
        },

        runSqlDirectly : function (tx, sql, data, finalSuccessCallback, finalFailureCallback) {
            var successCallback, failureCallback, rollback;
            log.logSqlStatement(sql, data, DataAccess.logQuerySql);
            if ((null === data) || (undefined === data)) {
                data = [];
            }
            finalSuccessCallback = (!Util.isFunction(finalSuccessCallback)) ? function () {} : finalSuccessCallback;
            finalFailureCallback = (!Util.isFunction(finalFailureCallback)) ? function () {} : finalFailureCallback;
            successCallback = function (tx, sqlResultSet) {
                var resultObjs = [];
                if (isSelect(sql)) {
                    resultObjs = DataAccess.sqlResultSetToArray(sqlResultSet);
                } else if (isInsert(sql)) {
                    resultObjs[0] = sqlResultSet.insertId;
                }
                log.logObjectData("Result Array", resultObjs, DataAccess.logQueryResult);
                finalSuccessCallback(tx, sqlResultSet, resultObjs);
            };
            failureCallback = function (tx, error) {
                rollback = shouldRollback(sql) || finalFailureCallback(tx, error);
                log.logSqlError("Error run SQL: [" + sql + "], data[" + data + "], Rollback?[" + rollback + "]", error, DataAccess.logError);
            };
            tx.executeSql(sql, data, successCallback, failureCallback);
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
                        tx.executeSql("select db_schema_version from app_info where app_id = ?", ['BB10GTD'],
                            function (tx, result) {
                                if ((result !== null)
                                        && (result.rows !== null)
                                        && (1 === result.rows.length)
                                        && (result.rows.item !== null)
                                        && (result.rows.item(0) !== null)
                                        && (result.rows.item(0).db_schema_version !== null)) {
                                    db_schema_version = result.rows.item(0).db_schema_version;
                                    console.info("DB Schema version for app[BB10GTD] is [" + db_schema_version + "]");
                                    DataAccess.dbFirstTimeCreate = false;
                                    openAppDb();
                                } else {
                                    console.info("DB Schema version for app[BB10GTD] not existing");
                                    DataAccess.dbFirstTimeCreate = true;
                                    tx.executeSql(
                                        "insert into app_info(app_id, name, version, db_schema_version, additional_info) values (?, ?, ?, ?, ?)",
                                        ['BB10GTD', 'Peaceful & Better Life App', '0.0.1', '', 'Peaceful & Better Life App'],
                                        function (tx, result) {
                                            console.log("Successfully insert app info for BB10GTD to app_info table");
                                            openAppDb();
                                        },
                                        function (tx, error) {
                                            log.logSqlError("Failed to insert app info for BB10GTD app", error);
                                        }
                                    );
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
                DataAccess.appDb.transaction(function (tx) {
                    DataAccess.runSqlDirectly(tx, Sql.Task.DeleteById, [id]);
                    DataAccess.runSqlDirectly(tx, 'delete from task_meta where task_id = ?', [id], successCallback, failureCallback);
                });
            },
            update: function (id, name, successCallback, failureCallback) {
                runSQL(Sql.Task.UpdateById, [name, id], successCallback, failureCallback);
            },
            updateStatus: function (id, statusKey, successCallback, failureCallback) {
                runSQL(Sql.Task.UpdateStatusById, [statusKey, id], successCallback, failureCallback);
            },
            getByMeta: function (metaTypeName, metaName, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByMetaName, [metaName, metaTypeName, SeedData.TaskDoneStatus, SeedData.TaskDeletedStatus], successCallback, failureCallback);
            },
            getByStatus: function (statusKey, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByStatus, [statusKey], successCallback, failureCallback);
            },
            getByMetaType: function (metaTypeName, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectByMetaType, [metaTypeName, SeedData.TaskDoneStatus, SeedData.TaskDeletedStatus], successCallback, failureCallback);
            },
            getAll: function (successCallback, failureCallback) {
                runSQL(Sql.Task.FilterByStatus, [SeedData.TaskDoneStatus, SeedData.TaskDeletedStatus], successCallback, failureCallback);
            },
            getById: function (id, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectById, [id], successCallback, failureCallback);
            },
            getDueDate : function (id, successCallback, failureCallback) {
                runSQL(Sql.Task.SelectDueDate, [id], successCallback, failureCallback);
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
                runSQL(Sql.Meta.Insert, [name, meta_type_id, description, 0], successCallback, failureCallback);
            },
            deleteById : function (id, successCallback, failureCallback) {
                runSQL(Sql.Meta.DeleteById, [id], successCallback, failureCallback);
            },
            update : function (id, name, description, successCallback, failureCallback) {
                if (Util.isEmpty(description)) {
                    runSQL(Sql.Meta.UpdateNameById, [name, id], successCallback, failureCallback);
                } else {
                    runSQL(Sql.Meta.UpdateById, [name, description, id], successCallback, failureCallback);
                }
            },
            getById : function (id, successCallback, failureCallback) {
                runSQL(Sql.Meta.SelectById, [id], successCallback, failureCallback);
            },
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
                runSQL(Sql.Meta.SelectByTypeName, [metaTypeName], successCallback, failureCallback);
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
                DataAccess.appDb.transaction(function (tx) {
                    DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [SeedData.GtdMetaTypeName]);
                    DataAccess.runSqlDirectly(tx, Sql.TaskMeta.ThrowTaskToList, [taskId, metaName, SeedData.GtdMetaTypeName], successCallback, failureCallback);
                });
            }
        }
    };
}());

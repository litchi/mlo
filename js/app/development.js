/*jslint browser: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, SeedSampleDataProvider*/
var DevToolkit = (function () {
    "use strict";

    return {
        reCreateDatabase : function () {
            DataAccess.createDatabaseConnection();
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.dropAllTables(tx);
                DataAccess.createTables(tx);
                DataAccess.runSqlDirectly(tx, 'alter table task add column reminder_on integer');
                DataAccess.runSqlDirectly(tx, 'alter table task add column due_date integer');
                DataAccess.runSqlDirectly(tx, 'alter table meta add column ui_rank integer default 0');
                DataAccess.runSqlDirectly(tx, 'CREATE VIEW task_view AS select task.id as task_id, task.name as task_name, task.status as task_status, task.reminder_on as task_reminder_on, task.due_date as task_due_date, meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from task join task_meta on task_meta.task_id = task.id join meta on task_meta.meta_id = meta.id join meta_type on meta_type.id = meta.meta_type_id');
                DataAccess.runSqlDirectly(tx, 'CREATE VIEW meta_view AS select meta.id as meta_id, meta.name as meta_name, meta.description as meta_description, meta.ui_rank as meta_ui_rank, meta_type.id as meta_type_id, meta_type.name as meta_type_name, meta_type.description as meta_type_description, meta_type.internal as meta_type_internal from meta join meta_type on meta_type.id = meta.meta_type_id');
                SeedSampleDataProvider.loadSeedAndSampleData();
            }, function (error) {
                log.logSqlError("Error when reCreateDatabase", error);
            }, function () {
                console.info("Successfully drop and recreate all tables and import seed/sample data");
            });
        },

        printTable : function (tableName) {
            DataAccess.createDatabaseConnection();
            console.debug("\n-------------------------------- " + tableName + " --------------------------------");
            DataAccess.appDb.transaction(function (tx) {
                tx.executeSql('select * from ' + tableName, [], function (t, r) {
                    var i, max, obj;
                    for (i = 0, max = r.rows.length; i < max; i += 1) {
                        obj = r.rows.item(i);
                        console.debug(obj);
                    }
                    console.debug("-------------------------------- " + tableName + " --------------------------------\n");
                }, function (t, e) {
                    console.error("Failed to get data of table " + tableName + "Error code: " + e.code + ", Error msg: " + e.message);
                });
            });
        }
    };
}());

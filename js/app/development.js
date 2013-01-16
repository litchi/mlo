/*jslint browser: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, SeedSampleDataProvider*/
var DevToolkit = (function () {
    "use strict";

    return {
        reCreateDatabase : function () {
            DataAccess.createDatabaseConnection();
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, 'update _migrator_schema set version = 0');
                DataAccess.dropAllTables(tx);
                DataAccess.createTables(tx);
                DataAccess.dbFirstTimeCreate = true;
                DataAccess.migrateSchema();
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

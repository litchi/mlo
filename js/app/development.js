/*jslint browser: true*/
/*global Util, DataAccess, Sql, seedData, bb, log, console, UIConfig, openDatabase, AppSql*/
var DevToolkit = (function () {
    "use strict";

    return {
        reCreateDatabase : function () {
            DataAccess.createDatabaseConnection();
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.dropAllTables(tx);
            }, function (error) {
                console.error("Error to drop all tables, error code " + error.code + ", error msg: " + error.message);
            }, function () {
                DataAccess.initAppDb(DataAccess.appDb);
                console.debug("Successfully drop and recreate all tables and import seed data");
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

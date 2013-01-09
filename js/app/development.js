/*jslint browser: true*/
/*global u, dataAccess, SQL, seedData, bb, log, console, uiConfig, openDatabase, APP_SQL*/
"use strict";
dataAccess.createDatabaseConnection();

function reCreateDatabase() {
    dataAccess.appDb.transaction(function (tx) {
        dataAccess.dropAllTables(tx);
    }, function (error) {
        console.error("Error to drop all tables, error code " + error.code + ", error msg: " + error.message);
    }, function () {
        dataAccess.initAppDb(dataAccess.appDb);
        console.debug("Successfully drop and recreate all tables and import seed data");
    });
}

function printTable(tableName) {
    console.debug("\n-------------------------------- " + tableName + " --------------------------------");
    dataAccess.appDb.transaction(function (tx) {
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

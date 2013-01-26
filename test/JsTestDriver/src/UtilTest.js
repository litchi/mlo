/*jslint browser: true*/
/*global Util, DataAccess, Sql, SeedData, bb, log, console, uiConfig, openDatabase, AppSql, SeedSampleDataProvider, Migrator*/
var UtilTestCase = (function () {
    "use strict";
    UtilTestCase = TestCase("UtilTestCase");
    UtilTestCase.prototype.testStartWith = function () {
        var str = "abc", start = 'a';
        assertTrue("String 'abc' starts with a", Util.startsWith(str, start));
    };
}());


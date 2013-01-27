/*jslint browser: true*/
/*global TestCase, Util, DataAccess, Sql, SeedData, bb, log, console, uiConfig, openDatabase, AppSql, SeedSampleDataProvider, Migrator*/
var UtilTestCase = (function () {
    "use strict";
    UtilTestCase = TestCase("UtilTestCase");
    UtilTestCase.prototype.testStartWith = function () {
        var str = "abc", start = 'a';
        assertTrue("String 'abc' starts with a", Util.startsWith(str, start));
        start = 'bc';
        assertFalse("String 'abc' not start with bc", Util.startsWith(str, start));
        start = '';
        assertFalse("String 'abc' is not start with empty string", Util.startsWith(str, start));
        str = "";
        start = '';
        assertTrue("String '' is started with empty string", Util.startsWith(str, start));
        str = "I am a string";
        start = 'i AM A';
        assertFalse("string 'I am a string' is not started with 'i AM A'", Util.startsWith(str, start));
    };
}());


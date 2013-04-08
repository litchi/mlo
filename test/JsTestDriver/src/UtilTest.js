/*jslint browser: true*/
/*global TestCase, assertEquals, assertTrue, assertFalse, Util, DataAccess, Sql, SeedData, bb, log, console, uiConfig, openDatabase, AppSql, SeedSampleDataProvider, Migrator*/
var UtilTestCase = (function () {
    "use strict";
    UtilTestCase = new TestCase("UtilTestCase");
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

    UtilTestCase.prototype.testIsEmpty = function () {
        var str1 = null, str2, str3 = '', str4 = 'abc';
        assertTrue('isEmpty should return true for null', Util.isEmpty(str1));
        assertTrue('isEmpty should return true for undefined', Util.isEmpty(str2));
        assertTrue('isEmpty should return true for \'\'', Util.isEmpty(str3));
        assertFalse('isEmpty should return false for \'abc\'', Util.isEmpty(str4));
    };

    UtilTestCase.prototype.testNotEmpty = function () {
        var str1 = null, str2, str3 = '', str4 = 'abc';
        assertFalse('notEmpty should return true for null', Util.notEmpty(str1));
        assertFalse('notEmpty should return true for undefined', Util.notEmpty(str2));
        assertFalse('notEmpty should return true for \'\'', Util.notEmpty(str3));
        assertTrue('notEmpty should return false for \'abc\'', Util.notEmpty(str4));
    };

    UtilTestCase.prototype.testIsFunction = function () {
        var func1 = function () {}, func2 = 'abc', func3 = '', func4 = null, func5;
        assertTrue('isFunction should return true for \'function(){}\'', Util.isFunction(func1));
        assertTrue('isFunction should return true for annoymous function with no parameter', Util.isFunction(function () {}));
        assertTrue('isFunction should return true for annoymous function with 1 parameter', Util.isFunction(function (id) {}));
        assertTrue('isFunction should return true for annoymous function with 2 parameters', Util.isFunction(function (id, id1) {}));
        assertFalse('isFunction should return false for string \'abc\'', Util.isFunction(func2));
        assertFalse('isFunction should return false for empty string', Util.isFunction(func3));
        assertFalse('isFunction should return false for null', Util.isFunction(func4));
        assertFalse('isFunction should return false for undefined', Util.isFunction(func5));
    };

    UtilTestCase.prototype.testgetFullDateTimeStr = function () {
        var myDate = new Date();
        myDate.setYear(1900);
        myDate.setMonth(0);
        myDate.setDate(1);
        myDate.setHours(0);
        myDate.setMinutes(0);
        assertEquals('Full Date Time Str for 1900-1-1 0:0 should be 1900-01-01T00:00', '1900-01-01T00:00', Util.getFullDateTimeStr(myDate));
        myDate.setMonth(1);
        assertEquals('Full Date Time Str for 1900-2-1 0:0 should be 1900-02-01T00:00', '1900-02-01T00:00', Util.getFullDateTimeStr(myDate));
        myDate.setMonth(9);
        myDate.setDate(10);
        myDate.setHours(10);
        myDate.setMinutes(10);
        assertEquals('Full Date Time Str for 1900-10-10 10:10 should be 1900-10-10T10:10', '1900-10-10T10:10', Util.getFullDateTimeStr(myDate));
        myDate.setMonth(2);
        assertEquals('Full Date Time Str for 1900-3-10 10:10 should be 1900-3-10T10:10', '1900-03-10T10:10', Util.getFullDateTimeStr(myDate));
    };

    UtilTestCase.prototype.testGetPrettyDateStr = function () {
        var now = new Date(), myDate = new Date(),
            t = (('0' + now.getHours()).slice(-2)) + ':' + (('0' + now.getMinutes()).slice(-2));
        assertEquals('pretty date str for new Date()', 'Today ' + t, Util.getPrettyDateStr(myDate));
        myDate.setDate(now.getDate() - 1);
        assertEquals('pretty date str for yesterday', 'Yday ' + t, Util.getPrettyDateStr(myDate));
        myDate.setDate(now.getDate() + 1);
        assertEquals('pretty date str for tomorrow', 'Tmr ' + t, Util.getPrettyDateStr(myDate));
        myDate.setYear(1970);
        myDate.setDate(21);
        myDate.setMonth(2);
        assertEquals('Pretty date str for past date', "Mar 21, 1970 " + t, Util.getPrettyDateStr(myDate));
        myDate.setMonth(3);
        myDate.setFullYear(now.getFullYear());
        assertEquals('Pretty date str for future date with different month', "Apr 21 " + t, Util.getPrettyDateStr(myDate));
        myDate.setHours(1);
        myDate.setMinutes(9);
        assertEquals('Pretty date str for future date with one digit time', "Apr 21 01:09", Util.getPrettyDateStr(myDate));
        myDate.setHours(13);
        myDate.setMinutes(23);
        assertEquals('Pretty date str for future date with two digit time', "Apr 21 13:23", Util.getPrettyDateStr(myDate));
    };
}());

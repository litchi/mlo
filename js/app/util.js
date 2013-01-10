/*jslint browser: true*/
/*global u, dataAccess, SQL, seedData, bb, log, console, UIConfig, openDatabase, APP_SQL*/
//TODO Add unit test for utility
var Util = (function () {
    "use strict";
    return {
        endsWith : function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        startsWith : function (str, prefix) {
            var result;
            if (str === null && prefix === null) {
                result = true;
            } else if ((str === null && prefix !== null) || (str !== null && prefix === null)) {
                result = false;
            } else {
                result = str.slice(0, prefix.length) === prefix;
            }
            return result;
        },
        valueOf : function (id) {
            var element, value;
            if (id !== null) {
                element = document.getElementById(id);
                if (element !== null && element !== undefined) {
                    value = element.value;
                } else {
                    console.warn("Element with ID[" + id + "] not found");
                }
            } else {
                console.warn("ID is null");
            }
            return value;
        },
        setValue : function (id, value) {
            var element;
            if (id !== null) {
                element = document.getElementById(id);
                if (element !== null && element !== undefined) {
                    element.value = value;
                } else {
                    console.warn("Element with ID[" + id + "] not found trying to set value to [" + value + "]");
                }
            } else {
                console.warn("ID is null trying to set value to [" + value + "]");
            }
        },

        isFunction : function (func) {
            return (typeof func === 'function');
        },

        appendOption : function (dropDown, value, innerHTML) {
            var option = document.createElement('option');
            option.setAttribute('value', value);
            option.innerHTML = innerHTML;
            dropDown.appendChild(option);
        },

        getFullDateTimeStr : function (myDate) {
            var resultStr = myDate.getFullYear() + '-'
                    + ('0' + (myDate.getMonth() + 1)).slice(-2) + '-'
                    + ('0' + myDate.getDate()).slice(-2) + 'T'
                    + ('0' + myDate.getHours()).slice(-2) + '-'
                    + ('0' + myDate.getMinutes()).slice(-2);
            return resultStr;
        },

        getPrettyDateStr : function (myDate) {
            var d, t, now, resultStr;
            now = new Date();
            if (now.getFullYear() === myDate.getFullYear() && now.getMonth() === myDate.getMonth()) {
                if (now.getDate() === myDate.getDate()) {
                    d = 'Today ';
                } else if (1 === (myDate.getDate() - now.getDate())) {
                    d = 'Tomorrow ';
                } else if (-1 === (myDate.getDate() - now.getDate())) {
                    d = 'Yesterday ';
                } else {
                    d = (myDate.getMonth() + 1) + '/' + (myDate.getDate()) + ' ';
                }
            } else {
                d = myDate.getFullYear() + '/' + (myDate.getMonth() + 1) + '/' + (myDate.getDate()) + ' ';
            }
            t = (('0' + myDate.getHours()).slice(-2)) + ':' + (('0' + myDate.getMinutes()).slice(-2));
            resultStr =  d + t;
            return resultStr;
        },

        switchPanelWidth : function (groupWidth, taskWidth, taskLeft) {
            if (document.getElementById('group').style.width !== groupWidth) {
                document.getElementById('group').style.width = groupWidth;
                document.getElementById(UIConfig.detailListPanelElementId).style.width = taskWidth;
                document.getElementById(UIConfig.detailListPanelElementId).style.left = taskLeft + 'px';
            }
        }
    };

}());

/*jslint browser: true*/
/*global blackberry, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql*/
var Util = (function () {
    "use strict";
    return {
        
        isEmpty : function (str) {
            return (null === str || undefined === str || '' === str);
        },

        notEmpty : function (str) {
            return !Util.isEmpty(str);
        },

        endsWith : function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        startsWith : function (str, prefix) {
            var result;
            if ((str === null && prefix === null) || (str === '' && prefix === '')) {
                result = true;
            } else if (((str === null && prefix !== null) || (str === '' && prefix !== ''))
                        || ((str !== null && prefix === null) || (str !== '' && prefix === ''))) {
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
                    + ('0' + myDate.getHours()).slice(-2) + ':'
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

        showErrorToast : function (message, buttonText, onToastDismissed, onButtonSelected) {
            var toastId, dismissed, selected, options;
            dismissed = Util.isFunction(onToastDismissed) ? onToastDismissed :  function () {
                console.debug("show Error Toast[%s][%s][%s]", message, buttonText, onButtonSelected);
            };
            selected = Util.isFunction(onButtonSelected) ? onButtonSelected : function () {
                console.debug("show Error Toast[%s][%s][%s]", message, buttonText, onToastDismissed);
            };
            options = {
                buttonText : buttonText,
                dismissCallback : dismissed,
                buttonCallback : selected
            };
            toastId = blackberry.ui.toast.show(message, options);
        },

        switchPanelWidth : function (groupWidth, taskWidth, taskLeft) {
            if (document.getElementById('group').style.width !== groupWidth) {
                document.getElementById('group').style.width = groupWidth;
                document.getElementById(UIConfig.detailListPanelElementId).style.width = taskWidth;
                document.getElementById(UIConfig.detailListPanelElementId).style.left = taskLeft + 'px';
            }
        },

        applySqlFilter : function (baseSql, filterName, filterStatement) {
            var result = baseSql;
            if (null === baseSql || undefined === baseSql || '' === baseSql) {
                console.warn("Base Sql is [%s] when apply filter[%s], statement[%s]", baseSql, filterName, filterStatement);
            } else {
                result = baseSql.replace('%' + filterName + '%', filterStatement);
            }
            return result;
        },

        resizeTextarea : function (elem) {
            var contents = elem.value.split('\n'), newRows = 0, currentLine, currentRows = elem.rows, longLines = 0;
            if (!elem.initialRows) {
                elem.initialRows = 1;
            }
            for (currentLine = 0; currentLine < contents.length; currentLine += 1) {
                if (contents[currentLine].length > elem.cols) {
                    newRows += Math.floor(contents[currentLine].length / elem.cols);
                    longLines += 1;
                }
            }
            newRows = newRows + contents.length;
            if (newRows !== currentRows) {
                elem.rows = (newRows < elem.initialRows ? elem.initialRows : newRows);
            }
        },

        moveCaretToEnd : function (el) {
            if (typeof el.selectionStart === "number") {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else if (typeof el.createTextRange !== "undefined") {
                el.focus();
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
            }
        },

        refreshCurrentPage : function () {
            //TODO Upon bbui 0.9.7, this should work.
            //bb.reloadScreen();
            var metaTypeId = Util.valueOf('v_meta_type_id'),
                metaTypeName = Util.valueOf('v_meta_type_name'),
                metaId = Util.valueOf('v_meta_id'),
                metaName = Util.valueOf('v_meta_name');
            console.debug('[%s], [%s], [%s], [%s]', metaTypeId, metaTypeName, metaId, metaName);
            if (metaName === SeedData.NextActionMetaName ||
                    metaName === SeedData.BasketMetaName ||
                    metaName === SeedData.SomedayMetaName) {
                bb.pushScreen('task-list.html', metaName);
            } else {
                if (Util.notEmpty(metaName)) {
                    bb.pushScreen('master-detail.html', UIConfig.taskByPagePrefix, {'metaTypeName' : metaTypeName, 'metaName' : metaName});
                } else {
                    bb.pushScreen('master-detail.html', UIConfig.taskByPagePrefix, {'metaTypeName' : metaTypeName});
                }
            }
        },

        setCommonMetaFieldsOnPage : function (params) {
            if (Util.notEmpty(params)) {
                Util.setValue('v_meta_type_name', params.metaTypeName);
                Util.setValue('v_meta_type_id',   params.metaTypeId);
                Util.setValue('v_meta_name',      params.metaName);
                Util.setValue('v_meta_id',        params.metaId);
            } else {
                console.warn("Param is empty when prepareMetaData");
            }
        },

        timeToDateWithZone : function (second) {
            var localMs, result = null, tzo = new Date().getTimezoneOffset();
            if (Util.notEmpty(second)) {
                localMs = (second + tzo * 60) * 1000;
                result = new Date(localMs);
            } else {
                console.error("Time stamp[%s] passed to dbTimeStampToDate is empty", second);
            }
            return result;
        },

        setMetaDetailPageCaption : function (caption) {
            document.getElementById('edit-meta-title').setCaption(caption);
        }
    };

}());

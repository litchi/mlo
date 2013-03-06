/*jslint browser: true*/
/*global blackberry, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, UIActionBarController, $, jQuery, UITaskUtil*/
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

        showToast : function (message, buttonText, onToastDismissed, onButtonSelected) {
            var toastId, dismissed, selected, options;
            dismissed = Util.isFunction(onToastDismissed) ? onToastDismissed :  function () {
                console.debug("show Toast[%s][%s][%s]", message, buttonText, onButtonSelected);
            };
            selected = Util.isFunction(onButtonSelected) ? onButtonSelected : function () {
                console.debug("show Toast[%s][%s][%s]", message, buttonText, onToastDismissed);
            };
            options = {
                buttonText : buttonText,
                dismissCallback : dismissed,
                buttonCallback : selected
            };
            if (Util.notEmpty(blackberry.ui.toast)) {
                toastId = blackberry.ui.toast.show(message, options);
            }
        },

        expandDetailPanel : function (groupWidth, taskWidth, taskLeft) {
            if (document.getElementById('group').style.width !== groupWidth) {
                document.getElementById('group').style.width = groupWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.width = taskWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.left = taskLeft + 'px';
                if (taskLeft > '350') {
                    $(".master-title").css("max-width", "450px");
                } else {
                    $(".master-title").css("max-width", "159px");
                    $('#create-task-shortcut').css('width', '245px');
                }
                $('#group-space').innerText = '>';
            }
        },

        toggleCreateTaskShortcutDisplay : function () {
            var currentDisplay = $('#create-task-input-container').css('display');
            if ('none' === currentDisplay) {
                $('#create-task-input-container').css('display', 'block');
                $('#main-content-overlay').css('display', 'block');
                $('#ctsi').focus();
                $('#main-content-overlay').click(function () {
                    $('#create-task-input-container').css('display', 'none');
                    $('#main-content-overlay').css('display', 'none');
                });
                $('#ctsi').parent().css('border', '0px solid #000');
                $('#ctsi').parent().css('background', 'transparent');
            } else {
                $('#create-task-input-container').css('display', 'none');
                $('#main-content-overlay').css('display', 'none');
                $("#main-content-overlay").removeAttr('onclick');
            }
        },

        togglePanelWidth : function () {
            if (document.getElementById(UIConfig.detailListPanelElementId).style.left === UIConfig.rightPanelLargerLeftMargin + 'px') {
                document.getElementById('group').style.width = UIConfig.leftPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.width = UIConfig.rightPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.left = UIConfig.rightPanelSmallerLeftMargin + 'px';
                document.getElementById('group-space').innerText = '>';
                document.getElementById('create-task-shortcut').style.width = UIConfig.leftPanelWidth + 'px';
            } else {
                document.getElementById('group').style.width = UIConfig.rightPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.width = UIConfig.leftPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.left = UIConfig.rightPanelLargerLeftMargin + 'px';
                document.getElementById('group-space').innerText = '<';
                document.getElementById('create-task-shortcut').style.width = UIConfig.rightPanelWidth + 'px';
            }
            if (document.getElementById(UIConfig.detailListPanelElementId).style.left > '350') {
                $(".master-title").css("max-width", "450px");
            } else {
                $(".master-title").css("max-width", "159px");
            }
        },

        applySqlFilter : function (baseSql, filterName, filterStatement) {
            var result = baseSql;
            if (null === baseSql || undefined === baseSql || '' === baseSql) {
                console.warn("Base Sql is [%s] when apply filter[%s], statement[%s]",
                    baseSql, filterName, filterStatement);
            } else {
                result = baseSql.replace('%' + filterName + '%', filterStatement);
            }
            return result;
        },

        resizeTextarea : function (elem, charNumberOneLine) {
            var contents = elem.value.split('\n'), newRows = 0, currentLine,
                currentRows = elem.rows, longLines = 0;
            if (Util.notEmpty(event)
                    && Util.notEmpty(event.keyCode)
                    && Util.notEmpty($('#ctf'))
                    && Util.notEmpty($('#ctsi'))
                    && event.keyCode === 13) {
                Util.toggleCreateTaskShortcutDisplay();
                $('#ctf').submit();
                $('#ctsi').value('');
                $('#ctsi').blur();
            }
            if (!elem.initialRows) {
                elem.initialRows = 1;
            }
            for (currentLine = 0; currentLine < contents.length; currentLine += 1) {
                if (contents[currentLine].length > charNumberOneLine) {
                    newRows += Math.floor(contents[currentLine].length / charNumberOneLine);
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

        refreshCurrentPage : function (toastMsg) {
            //TODO Upon bbui 0.9.7, this should work.
            //bb.reloadScreen();
            var metaTypeId     = Util.valueOf('v_meta_type_id'),
                metaTypeName   = Util.valueOf('v_meta_type_name'),
                metaId         = Util.valueOf('v_meta_id'),
                metaName       = Util.valueOf('v_meta_name'),
                localToastMsg  = UIConfig.emptyString;
            console.debug('[%s], [%s], [%s], [%s]', metaTypeId, metaTypeName, metaId, metaName);
            if (Util.notEmpty(toastMsg)) {
                localToastMsg = toastMsg;
            }
            if (metaName === SeedData.NextActionMetaName ||
                    metaName === SeedData.BasketMetaName ||
                    metaName === SeedData.SomedayMetaName) {
                bb.pushScreen('task-list.html', metaName, {'toastMsg' : localToastMsg});
            } else {
                if (Util.notEmpty(metaName)) {
                    bb.pushScreen('task-list.html', UIConfig.taskByPagePrefix, {'metaTypeName' : metaTypeName, 'metaName' : metaName, 'toastMsg' : localToastMsg});
                } else {
                    bb.pushScreen('task-list.html', UIConfig.taskByPagePrefix, {'metaTypeName' : metaTypeName, 'toastMsg' : localToastMsg});
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

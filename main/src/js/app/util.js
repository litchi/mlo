/*jslint browser: true*/
/*global blackberry, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, UIActionBarController, $, jQuery, UITaskUtil*/
var Util = (function () {
    "use strict";

    function thirtyOneDayMonth(myDate) {
        return myDate.getMonth % 2 === 0;
    }

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

        getNameOfWeekday : function (myDate) {
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[myDate.getDay()];
        },

        getNameOfMonth : function (myDate) {
            var days = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return days[myDate.getMonth()];
        },

        getPrettyDateStr : function (myDate) {
            var d, t, now = new Date(), resultStr, weekPrefix, sep = ' ',
                dayDiff = myDate.getDate() - now.getDate(),
                monthDiff = myDate.getMonth() - now.getMonth();
            if (now.getFullYear() === myDate.getFullYear()) {
                if (monthDiff === 0) {
                    if (now.getDate() === myDate.getDate()) {
                        d = 'Today';
                    } else if (1 === dayDiff) {
                        d = 'Tomorrow';
                    } else if (-1 === dayDiff) {
                        d = 'Yesterday';
                    } else if ((0 === monthDiff && dayDiff <= 7 && dayDiff >= -7)) {
                        weekPrefix = (dayDiff < 0) ? 'Last' : 'Next';
                        d = myDate.getDate() + '/' + (myDate.getMonth() + 1) + ' (' + weekPrefix + sep + Util.getNameOfWeekday(myDate) + ')';
                    } else {
                        d = Util.getNameOfMonth(myDate) + sep + (myDate.getDate());
                    }
                } else {
                    if ((myDate.getMonth === 2 && monthDiff === -1 && dayDiff < 21 && dayDiff > 15) &&
                            (thirtyOneDayMonth(myDate) &&  monthDiff === -1 && dayDiff <= 24 && dayDiff >= 18) &&
                            (!thirtyOneDayMonth(myDate) && monthDiff === -1 && dayDiff <= 23 && dayDiff >= 17)) {
                        weekPrefix = 'Last';
                        d = weekPrefix + sep + Util.getNameOfWeekday(myDate);
                    } else if ((myDate.getMonth === 2 && monthDiff === 1 && dayDiff > -21 && dayDiff < -15) &&
                            (thirtyOneDayMonth(myDate) &&  monthDiff === 1 && dayDiff >= -24 && dayDiff <= -18) &&
                            (!thirtyOneDayMonth(myDate) && monthDiff === 1 && dayDiff >= -23 && dayDiff <= -17)) {
                        weekPrefix = 'Next';
                        d = weekPrefix + sep + Util.getNameOfWeekday(myDate);
                    } else {
                        d = Util.getNameOfMonth(myDate) + sep + (myDate.getDate());
                    }
                }
            } else {
                d = Util.getNameOfMonth(myDate) + sep + (myDate.getDate()) + ',' + sep + myDate.getFullYear();
            }
            t = (('0' + myDate.getHours()).slice(-2)) + ':' + (('0' + myDate.getMinutes()).slice(-2));
            resultStr =  d + sep + t;
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
                    $(".master-title").css("max-width", "119px");
                    $('#create-task-shortcut').css('width', UIConfig.leftPanelWidth + 'px');
                }
                $('#group-space').innerText = '>';
            }
        },

        toggleSearchTaskTaskShortcutDisplay : function () {
            Util.toggleShortcutDisplay($('#search-task-input-container'), $('#stsi'));
        },

        toggleCreateTaskShortcutDisplay : function () {
            Util.toggleShortcutDisplay($('#create-task-input-container'), $('#ctsi'));
        },

        toggleShortcutDisplay : function (containerDiv, inputDiv) {
            var currentDisplay = containerDiv.css('display');
            if ('none' === currentDisplay) {
                containerDiv.css('display', 'block');
                $('#main-content-overlay').css('display', 'block');
                inputDiv.focus();
                $('#main-content-overlay').click(function () {
                    containerDiv.css('display', 'none');
                    $('#main-content-overlay').css('display', 'none');
                });
                inputDiv.parent().css('border', '0px solid #000');
                inputDiv.parent().css('background', 'transparent');
            } else {
                containerDiv.css('display', 'none');
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
                $(".master-title").css("max-width", "119px");
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
                $('#ctsi').val($('#ctsi').val().trim());
                $('#ctf').submit();
                $('#ctsi').val(UIConfig.emptyString);
                $('#ctsi').blur();
                contents = UIConfig.emptyString;
                currentRows = 1;
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
            if ((metaName === SeedData.NextActionMetaName && metaTypeName  === SeedData.GtdMetaTypeName) ||
                    (metaName === SeedData.BasketMetaName && metaTypeName  === SeedData.GtdMetaTypeName) ||
                    (metaName === SeedData.SomedayMetaName && metaTypeName === SeedData.GtdMetaTypeName)) {
                bb.pushScreen('task-list.html', metaName, {
                    'metaTypeName' : metaTypeName,
                    'metaName'     : metaName,
                    'toastMsg'     : localToastMsg,
                    'actionbarId'  : UIConfig.taskByPagePrefix + '-' + metaTypeName
                });
            } else {
                if (Util.notEmpty(metaName) &&
                        metaName !== SeedData.NextActionMetaName &&
                        metaName !== SeedData.BasketMetaName &&
                        metaName !== SeedData.SomedayMetaName) {
                    bb.pushScreen('task-list.html', UIConfig.taskByPagePrefix, {
                        'metaTypeName' : metaTypeName,
                        'metaName'     : metaName,
                        'toastMsg'     : localToastMsg,
                        'actionbarId'  : UIConfig.taskByPagePrefix + '-' + metaTypeName
                    });
                } else {
                    bb.pushScreen('task-list.html', UIConfig.taskByPagePrefix, {
                        'metaTypeName' : metaTypeName,
                        'toastMsg'     : localToastMsg,
                        'actionbarId'  : UIConfig.taskByPagePrefix + '-' + metaTypeName
                    });
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
        },

        addLikeStrForKeyword : function (keyword) {
            return '%' + keyword + '%';
        },

        showSearchTitle : function (keyword) {
            $("#search-result-title").css('display', 'block');
            $("#search-result-title").html('Search Result <span id="search-keyword-title-span">' + keyword + '</span>');
            $("#detail-list-panel").css('height', '1020px');
        },

        hideSearchTitle : function () {
            $("#search-result-title").css('display', 'none');
            $("#detail-list-panel").css('height', '1130px');
            $('#stsi').val(UIConfig.emptyString);
            $("#stsi").blur();
        },

        createMetaSelectedIcon : function (metaId, iconClass) {
            var icon = document.createElement('img');
            icon.setAttribute('id', Util.genSelectedMetaMarkIconId(metaId));
            icon.setAttribute('class', iconClass);
            icon.setAttribute('src', './resources/image/remove-context.png');
            icon.setAttribute('width', '32px');
            icon.setAttribute('height', '32px');
            return icon;
        },

        genSelectedMetaMarkIconId : function (metaId) {
            return metaId + "_img";
        },

        copyInnerHTMLAndShowContainer : function (container, tempDiv) {
            Util.copyInnerHTML(container, tempDiv);
            container.style.display = 'block';
        },

        copyInnerHTML : function (container, tempDiv) {
            container.innerHTML = tempDiv.innerHTML;
        }
    };

}());

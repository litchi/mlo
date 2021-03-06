/*jslint browser: true*/
/*global moment, unescape, escape, blackberry, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, UIActionBarController, $, jQuery, UITaskUtil*/
var Util = (function () {
    "use strict";

    function getDetailPageIcon(iconResource) {
        return '<img src="./resources/image/' + iconResource + '" style="width:32px;height:32px;margin-top:13px;margin-right:5px;padding-left:4px;display:inline-block;float:left"/>';
    }

    Date.prototype.format = function (format) {
        var k, part,
            o = {
                "M+" : this.getMonth() + 1,
                "d+" : this.getDate(),
                "h+" : this.getHours(),
                "m+" : this.getMinutes(),
                "s+" : this.getSeconds(),
                "q+" : Math.floor((this.getMonth() + 3) / 3),
                "S"  : this.getMilliseconds()
            };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + UIConfig.emptyString).substr(4 - RegExp.$1.length));
        }
        for (k in o) {
            if (o.hasOwnProperty(k) && (new RegExp("(" + k + ")").test(format))) {
                //This part is strange, so comment out by now, part = RegExp.$1.length === 1 ? o[k] : o[k];
                part = o[k] + UIConfig.emptyString;
                format = format.replace(RegExp.$1, part.substr((o[k].valueOf()).length));
            }
        }
        return format;
    };

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
            } else if (((str === null && prefix !== null) || (str === '' && prefix !== '')) ||
                    ((str !== null && prefix === null) || (str !== '' && prefix === ''))) {
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
            var resultStr = myDate.getFullYear() + '-' +
                    ('0' + (myDate.getMonth() + 1)).slice(-2) + '-' +
                    ('0' + myDate.getDate()).slice(-2) + 'T' +
                    ('0' + myDate.getHours()).slice(-2) + ':' +
                    ('0' + myDate.getMinutes()).slice(-2);
            return resultStr;
        },


        /**
        * Converts a Unicode/UTF8 string to Base64.
        *
        * This function is a workaround because the atob and btoa browser functions that should convert between a binary string and a
        * Base64 encoded ASCII string blow up when faced with Unicode with a INVALID_CHARACTER_ERR: DOM Exception 5.
        *
        * http://ecmanaut.blogspot.ca/2006/07/encoding-decoding-utf8-in-javascript.html
        * http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
        *
        * @param str
        *            the Unicode string to base64 encode
        * @returns the base64 encoded Unicode string
        */
        utf8_to_b64 : function (str) {
            return window.btoa(unescape(encodeURIComponent(str)));
        },

        /**
        * Converts a Base64 string to Unicode/UTF8 string.
        *
        * This function is a workaround because the atob and btoa browser functions that should convert between a binary string and a
        * Base64 encoded ASCII string blow up when faced with Unicode with a INVALID_CHARACTER_ERR: DOM Exception 5.
        *
        * http://ecmanaut.blogspot.ca/2006/07/encoding-decoding-utf8-in-javascript.html
        * http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
        *
        * @param str
        *            the base64 Unicode encoded string
        * @returns the Unicode string
        */
        b64_to_utf8 : function (str) {
            return decodeURIComponent(escape(window.atob(str)));
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
            var m = moment(myDate);
            return m.calendar() + "(" + m.fromNow()  + ")";
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
                document.getElementById('group-space').innerHTML = UIConfig.rightArrow;
                document.getElementById('create-task-shortcut').style.width = UIConfig.leftPanelWidth + 'px';
            } else {
                document.getElementById('group').style.width = UIConfig.rightPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.width = UIConfig.leftPanelWidth + 'px';
                document.getElementById(UIConfig.detailListPanelElementId).style.left = UIConfig.rightPanelLargerLeftMargin + 'px';
                document.getElementById('group-space').innerHTML = UIConfig.leftArrow;
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
            if (Util.notEmpty(event) &&
                    Util.notEmpty(event.keyCode) &&
                    Util.notEmpty($('#ctf')) &&
                    Util.notEmpty($('#ctsi')) &&
                    event.keyCode === 13) {
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
            } else if (Util.notEmpty(el.createTextRange)) {
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

        isQ10 : function () {
            return bb.device.is720x720;
        },

        isZ10 : function () {
            return bb.device.is1280x768;
        },

        showSearchTitle : function (keyword) {
            var height;
            $("#search-result-title").css('display', 'block');
            $("#search-result-title").html('Search Result <span id="search-keyword-title-span">' + keyword + '</span>');
            if(Util.isQ10()) {
                height = '480px';
            } else if (Util.isZ10()) {
                height = '1020px';
            }
            $("#detail-list-panel").css('height', height);
        },

        hideSearchTitle : function () {
            var height;
            $("#search-result-title").css('display', 'none');
            if(Util.isQ10()) {
                height = '590px';
            } else if (Util.isZ10()) {
                height = '1130px';
            }
            $("#detail-list-panel").css('height', height);
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

        //TODO Display different icon based on whether it's an further alarm
        getReminderIconStr : function (isFurtherAlarm) {
            //inline style should be used since class="xxx" will be overrided by bbui
            return getDetailPageIcon('reminder-on.png');
        },

        getOverdueIconStr : function (isOverdue) {
            return isOverdue ? getDetailPageIcon('overdue-alert.png') : '';
        },

        getOverdueIconStrDetailPage : function (isOverdue) {
            return isOverdue ? '<img src="./resources/image/overdue-alert.png" style="width:32px;height:32px;margin-left: 10px;vertical-align: middle;">' : '';
        },

        getProjectIconStr: function () {
            return getDetailPageIcon('task-detail-project-icon.png');
        },

        getDueIconStr: function () {
            return getDetailPageIcon('task-detail-calendar-icon.png');
        },

        getContextIconStr: function () {
            return getDetailPageIcon('task-detail-context-icon.png');
        },

        getGTDListIconStr: function () {
            return getDetailPageIcon('task-detail-gtd-icon.png');
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
        },

        getRandomSmailFace : function () {
            var vNum = Math.round(Math.random() * (UIConfig.smiles.length - 1));
            return UIConfig.smiles[vNum];
        },

        getClearDateTimeInputIcon : function () {
            var img = document.createElement('img');
            img.setAttribute('src', "./resources/image/bullet_deny.png");
            img.setAttribute('class', 'inline-operation-icon');
            img.setAttribute('onclick', 'UITaskUtil.clearDueDateField()');
            return img;
        },

        getNotificationBody : function (taskId, taskName, dueDate) {
            var result = UIConfig.emptyString;
            result += taskName + "\n\n";
            result += 'Due on: ' + dueDate.format('MM/dd/yyyy hh:mm') + "\n\n";
            return result;
        },

        getGtdListTitleSpanClass : function (gtdList, titleSpanClass) {
            if (SeedData.BasketMetaName === gtdList) {
                titleSpanClass += ' title-basket';
            } else if (SeedData.NextActionMetaName === gtdList) {
                titleSpanClass += ' title-next-action';
            } else if (SeedData.SomedayMetaName === gtdList) {
                titleSpanClass += ' title-someday';
            }
            return titleSpanClass;
        }

    };

}());

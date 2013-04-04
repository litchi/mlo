/*jslint browser: true */
/*global blackberry, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UIActionBarController, $, JQuery*/
var webworksreadyFired = false;
var EventCallback = (function () {
    "use strict";

    function setActionBarSelected(actionBarId) {
        var actionBarDiv = document.getElementById(UIConfig.actionBarElementId),
            actionBarItem = document.getElementById(actionBarId);
        if (Util.notEmpty(actionBarId)) {
            if (actionBarId === UIConfig.screenIdField) {
                actionBarDiv.setSelectedTab(actionBarItem);
            } else {
                if(Util.notEmpty(document.getElementById(actionBarItem))){
                    actionBarDiv.setSelectedTab(actionBarItem, false);
                }
            }
        }
    }

    function setDevTabVisible() {
        var devTab = document.getElementById('development');
        if (!AppConfig.debugMode && Util.notEmpty(devTab)) {
            devTab.style.display = 'none';
        }
    }

    function onScreenReadyCallback(element, id) {
        if (null === DataAccess.appDb) {
            DataAccess.createDatabaseConnection();
        }
    }

    function showAndClearToastMsg(toastMsg, params) {
        if (Util.notEmpty(toastMsg)) {
            Util.showToast(toastMsg);
            params[UIConfig.paramToastMsg] = UIConfig.emptyString;
        }
    }

    function onDomReadyCallback(element, id, params) {
        var taskInfo, metaTypeName, metaId, metaTypeId, metaName, toastMsg, actionBarId;
        console.debug("Element: [%s], ID: [%s]", element, id);
        log.logObjectData("Parameters:", params, true);
        if (Util.notEmpty(params)) {
            if (Util.notEmpty(params[UIConfig.paramMetaTypeId])) {
                metaTypeId = params[UIConfig.paramMetaTypeId];
            }
            if (Util.notEmpty(params[UIConfig.paramTaskInfo])) {
                taskInfo = params[UIConfig.paramTaskInfo];
            }
            if (Util.notEmpty(params[UIConfig.paramMetaTypeName])) {
                metaTypeName = params[UIConfig.paramMetaTypeName];
            }
            if (Util.notEmpty(params[UIConfig.paramMetaName])) {
                metaName = params[UIConfig.paramMetaName];
            } else {
                metaName = Sql.FilterAllMeta;
            }
            if (Util.notEmpty(params[UIConfig.paramMetaId])) {
                metaId = params[UIConfig.paramMetaId];
            }
            if (Util.notEmpty(params[UIConfig.paramToastMsg])) {
                toastMsg = params[UIConfig.paramToastMsg];
            }
            if (Util.notEmpty(params[UIConfig.paramActionbarId])) {
                actionBarId = params[UIConfig.paramActionbarId];
            }
        }
        if (id !== null) {
            if (id === SeedData.BasketMetaName ||
                    id === SeedData.NextActionMetaName ||
                    id === SeedData.SomedayMetaName) {
                UIActionBarController.openTaskGroupByMetaPage(SeedData.GtdMetaTypeName, id);
            } else if (id === UIConfig.editTaskPagePrefix) {
                UIEditFormController.fillTaskToEditForm(taskInfo, params);
            } else if (id === UIConfig.taskByPagePrefix) {
                UIActionBarController.openTaskGroupByMetaPage(metaTypeName, metaName);
            } else if ((id === UIConfig.screenIdField) || (id === UIConfig.metaByPagePrefix)) {
                UIActionBarController.openMetaGroupByTypePage(metaTypeId);
            } else if (id === UIConfig.editMetaPagePrefix) {
                UIEditFormController.fillMetaToEditForm(metaId);
            } else if (id === UIConfig.createMetaPagePrefix) {
                UIListController.fillMetaToCreateForm(metaTypeId);
            } else if (id === SeedData.TaskDeletedStatus) {
                UIListController.fillTasksToGroupByStatusKey(id);
            } else if (id === 'setting') {
                actionBarId = 'setting';
                UIActionBarController.openSettingsPage();
            }
            setActionBarSelected(actionBarId);
            setDevTabVisible();
            showAndClearToastMsg(toastMsg, params);
        }
    }

    return {
        webworksReadyCallback : function (e) {
            //Init on bbUI should before any other code loads.  
            if (webworksreadyFired) {
                return;
            }
            webworksreadyFired = true;
            bb.init({
                actionBarDark: true,
                controlsDark: false,
                listsDark: false,
                bb10ForPlayBook: false,
                onscreenready: onScreenReadyCallback,
                ondomready: onDomReadyCallback
            });
            blackberry.event.addEventListener("invoked", EventCallback.onInvoke);
            bb.pushScreen('task-list.html', UIConfig.taskByPagePrefix, {
                'metaTypeName' : SeedData.GtdMetaTypeName,
                'metaName'     : SeedData.BasketMetaName,
                'actionbarId'  : UIConfig.taskByPagePrefix + "-GTD"
            });
        },

        loadCallback : function () {
            // Fire the webworksready event for PlayBook and BBOS
            if (navigator.userAgent.indexOf('Version/10.0') < 0) {
                var evt = document.createEvent('Events');
                evt.initEvent('webworksready', true, true);
                document.dispatchEvent(evt);
            }
        },

        onInvoke : function (invokeRequest) {
            var taskId;
            log.logObjectData("Invoke Request", invokeRequest, true);
            if (invokeRequest.action === UIConfig.openTaskDetailAction) {
                taskId = Util.b64_to_utf8(invokeRequest.data);
            }
        }

    };
}());

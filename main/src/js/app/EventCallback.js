/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController*/
var webworksreadyFired = false;
var EventCallback = (function () {
    "use strict";

    function setActionBarSelectStatus(screenId) {
        var actionBar = document.getElementById('action-bar'),
            tab = document.getElementById(screenId),
            devTab = document.getElementById('development');
        if (Util.notEmpty(tab)) {
            tab.setAttribute('data-bb-selected', 'true');
            bb.refresh();
        }
        if (!AppConfig.debugMode && undefined !== devTab) {
            devTab.hide();
        }
    }


    function onScreenReadyCallback(element, id) {
        if (null === DataAccess.appDb) {
            DataAccess.createDatabaseConnection();
        }
        setActionBarSelectStatus(id);
    }

    function onDomReadyCallback(element, id, params) {
        var taskId, metaTypeName, metaId, metaTypeId, toastMsg;
        console.debug("Element: [%s], ID: [%s]", element, id);
        log.logObjectData("Parameters:", params, true);
        if (Util.notEmpty(params)) {
            if (Util.notEmpty(params[UIConfig.paramMetaTypeId])) {
                metaTypeId = params[UIConfig.paramMetaTypeId];
            }
            if (Util.notEmpty(params[UIConfig.paramTaskId])) {
                taskId = params[UIConfig.paramTaskId];
            }
            if (Util.notEmpty(params[UIConfig.paramMetaTypeName])) {
                metaTypeName = params[UIConfig.paramMetaTypeName];
            }
            if (Util.notEmpty(params[UIConfig.paramMetaId])) {
                metaId = params[UIConfig.paramMetaId];
            }
            if (Util.notEmpty(params[UIConfig.paramToastMsg])) {
                toastMsg = params[UIConfig.paramToastMsg];
            }
        }
        if (id !== null) {
            if (id === SeedData.BasketMetaName) {
                UIListController.fillTasksToGroupByMetaInfo(SeedData.GtdMetaTypeName, id);
            } else if (id === UIConfig.editTaskPagePrefix) {
                UIEditFormController.fillTaskToEditForm(taskId, params);
            } else if (id === UIConfig.editMetaPagePrefix) {
                UIEditFormController.fillMetaToEditForm(metaId);
            } else if (id === UIConfig.createMetaPagePrefix) {
                UIListController.fillMetaToCreateForm(metaTypeId);
            }
            if (Util.notEmpty(toastMsg)) {
                Util.showToast(toastMsg);
            }
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
                actionBarDark: false,
                controlsDark: false,
                listsDark: false,
                bb10ForPlayBook: false,
                onscreenready: onScreenReadyCallback,
                ondomready: onDomReadyCallback
            });
            bb.pushScreen('task-list.html', SeedData.BasketMetaName);
        },

        loadCallback : function () {
            // Fire the webworksready event for PlayBook and BBOS
            if (navigator.userAgent.indexOf('Version/10.0') < 0) {
                var evt = document.createEvent('Events');
                evt.initEvent('webworksready', true, true);
                document.dispatchEvent(evt);
            }
        }
    };
}());

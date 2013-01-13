/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController*/
var webworksreadyFired = false;
var EventCallback = (function () {
    "use strict";

    function onScreenReadyCallback(element, id) {
        if (null === DataAccess.appDb) {
            DataAccess.createDatabaseConnection();
        }
    }

    function setActionBarSelectStatus(screenId) {
        var tab = document.getElementById(screenId),
            devTab = document.getElementById('development');
        if (Util.notEmpty(tab)) {
            bb.actionBar.highlightAction(tab);
        }
        if (true !== AppConfig.debugMode) {
            if (undefined !== devTab) {
                devTab.style.display = 'none';
            }
        }
    }

    function onDomReadyCallback(element, id, params) {
        var taskId, metaTypeName, metaId, metaTypeId, defaultMetaName = Sql.FilterAllMeta;
        console.debug("Element: [%s], ID: [%s]", element, id);
        log.logObjectData("Parameters:", params);
        if (id !== null) {
            setActionBarSelectStatus(id);
            if (id === SeedData.BasketMetaName || id === SeedData.NextActionMetaName || id === SeedData.SomedayMetaName) {
                UIListController.fillTasksToGroupByMetaInfo(SeedData.GtdMetaTypeName, id);
            } else if (Util.startsWith(id, UIConfig.editTaskPagePrefix)) {
                taskId = id.substring(UIConfig.editTaskPagePrefix.length);
                UIEditFormController.fillTaskToEditForm(taskId, params);
            } else if (Util.startsWith(id, UIConfig.taskByPagePrefix)) {
                metaTypeName = id.substring(UIConfig.taskByPagePrefix.length);
                UIListController.fillMetaListToPanelByTypeName(metaTypeName, UIConfig.taskByPagePrefix);
                if (Util.notEmpty(params) && Util.notEmpty(params.metaName)) {
                    defaultMetaName = params.metaName;
                }
                UIListController.fillTasksToGroupByMetaInfo(metaTypeName, defaultMetaName);
            } else if (id === 'fields') {
                UIListController.fillMetaTypeToPanel();
                UIListController.fillAllMetaToPanel(UIConfig.metaByPagePrefix);
            } else if (Util.startsWith(id, UIConfig.editMetaPagePrefix)) {
                metaId = id.substring(UIConfig.editMetaPagePrefix.length);
                UIEditFormController.fillMetaToEditForm(metaId);
            } else if (Util.startsWith(id, UIConfig.createMetaPagePrefix)) {
                metaTypeId = id.substring(UIConfig.createMetaPagePrefix.length);
                UIListController.fillMetaToCreateForm(metaTypeId);
            } else if (Util.startsWith(id, UIConfig.metaByPagePrefix)) {
                UIListController.fillMetaTypeToPanel();
                metaTypeId = id.substring(UIConfig.metaByPagePrefix.length);
                UIListController.fillMetaListToPanel(metaTypeId, UIConfig.metaByPagePrefix);
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

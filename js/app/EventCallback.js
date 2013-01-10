/*jslint browser: true */
/*global Util, DataAccess, Sql, seedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController*/
var EventCallback = (function () {
    "use strict";
    var webworksreadyFired = false;

    function onScreenReadyCallback(element, id) {
        if (null === DataAccess.appDb) {
            DataAccess.createDatabaseConnection();
        }
    }

    function setActionBarSelectStatus(screenId) {
        var tab = document.getElementById(screenId),
            devTab = document.getElementById('development');
        if (null !== tab &&
                undefined !== tab) {
            bb.actionBar.highlightAction(tab);
        }
        if (true !== AppConfig.debugMode) {
            if (undefined !== devTab) {
                devTab.style.display = 'none';
            }
        }
    }

    function onDomReadyCallback(element, id) {
        var taskId, metaTypeName, metaId, metaTypeId;
        if (id !== null) {
            setActionBarSelectStatus(id);
            if (id === seedData.inBasketMetaName || id === seedData.nextActionMetaName || id === seedData.somedayMetaName) {
                UIListController.fillTasksToGroupByMetaInfo(seedData.gtdMetaTypeName, id);
            } else if (Util.startsWith(id, UIConfig.editTaskPagePrefix)) {
                taskId = id.substring(UIConfig.editTaskPagePrefix.length);
                UIEditFormController.fillTaskToEditForm(taskId);
            } else if (Util.startsWith(id, UIConfig.taskByPagePrefix)) {
                metaTypeName = id.substring(UIConfig.taskByPagePrefix.length);
                UIListController.fillMetaListToPanelByTypeName(metaTypeName, UIConfig.taskByPagePrefix);
                UIListController.fillTasksToGroupByMetaInfo(metaTypeName, UIConfig.emptyString);
            } else if (id === 'fields') {
                UIListController.fillMetaTypeToPanel();
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
            //Pass no parameters.. [bb.init()] to do the default init;
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
            bb.pushScreen('task-list.html', seedData.inBasketMetaName);
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

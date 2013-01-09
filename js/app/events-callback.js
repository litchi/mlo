/*jslint browser: true */
/*global u, dataAccess, SQL, seedData, bb, log, console, uiConfig, openDatabase, APP_SQL, appConfig*/
"use strict";
var webworksreadyFired = false;

function loadCallback() {
    // Fire the webworksready event for PlayBook and BBOS
    if (navigator.userAgent.indexOf('Version/10.0') < 0) {
        var evt = document.createEvent('Events');
        evt.initEvent('webworksready', true, true);
        document.dispatchEvent(evt);
    }
}

function onScreenReadyCallback(element, id) {
    if (null === dataAccess.appDb) {
        dataAccess.createDatabaseConnection();
    }
}

function setActionBarSelectStatus(screenId) {
    var tab = document.getElementById(screenId),
        devTab = document.getElementById('development');
    if (undefined !== tab) {
        bb.actionBar.highlightAction(tab);
    }
    if (true !== appConfig.debugMode) {
        if (undefined !== devTab) {
            devTab.style.display = 'none';
        }
    }
}

function onDomReadyCallback(element, id) {
    var taskId, metaTypeName, metaId, metaTypeId;
    if (id !== null) {
        if (id === seedData.inBasketMetaName || id === seedData.nextActionMetaName || id === seedData.somedayMetaName) {
            fillTasksToGroupByMetaInfo(seedData.gtdMetaTypeName, id);
        } else if (u.startsWith(id, uiConfig.editTaskPagePrefix)) {
            taskId = id.substring(uiConfig.editTaskPagePrefix.length);
            fillTaskToEditForm(taskId);
        } else if (u.startsWith(id, uiConfig.taskByPagePrefix)) {
            metaTypeName = id.substring(uiConfig.taskByPagePrefix.length);
            fillMetaListToPanelByTypeName(metaTypeName, uiConfig.taskByPagePrefix);
            fillTasksToGroupByMetaInfo(metaTypeName, uiConfig.emptyString);
        } else if (id === 'fields') {
            fillMetaTypeToPanel();
        } else if (u.startsWith(id, uiConfig.editMetaPagePrefix)) {
            metaId = id.substring(uiConfig.editMetaPagePrefix.length);
            fillMetaToEditForm(metaId);
        } else if (u.startsWith(id, uiConfig.createMetaPagePrefix)) {
            metaTypeId = id.substring(uiConfig.createMetaPagePrefix.length);
            fillMetaToCreateForm(metaTypeId);
        } else if (u.startsWith(id, uiConfig.metaByPagePrefix)) {
            fillMetaTypeToPanel();
            metaTypeId = id.substring(uiConfig.metaByPagePrefix.length);
            fillMetaListToPanel(metaTypeId, uiConfig.metaByPagePrefix);
        }
        setActionBarSelectStatus(id);
    }
}

function webworksReadyCallback(e) {
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
}

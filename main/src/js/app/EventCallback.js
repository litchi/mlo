/*jslint browser: true */
/*global UIInvokeTarget, blackberry, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UIActionBarController, UITaskReminderUtil, $, JQuery*/
var gWebworksreadyFired = false, gReminders = {};
var EventCallback = (function () {
    "use strict";

    function initAllExistingReminders() {
        var reminderTime;
        DataAccess.task.getAllWithReminder(function (tx, result, resultObj) {
            var taskId, taskName, reminderDate, dueDate;
            if (null !== resultObj) {
                Object.keys(resultObj).forEach(function (key) {
                    taskId = resultObj[key].task_id;
                    taskName = resultObj[key].task_name;
                    reminderDate = resultObj[key].task_reminder_date;
                    dueDate = resultObj[key].task_due_date;
                    UITaskReminderUtil.createUIBNotification(taskId, taskName, new Date(dueDate * 1000), new Date(reminderDate * 1000));
                });
            } else {
                console.warn("There's no task with reminder date exists");
            }
        }, function (tx, error) {
            log.logSqlError("Error to get all tasks with reminder", error);
        });
    }

    function setActionBarSelected(actionBarId) {
        var actionBarDiv = document.getElementById(UIConfig.actionBarElementId),
            actionBarItem = document.getElementById(actionBarId);
        if (Util.notEmpty(actionBarId)) {
            if (actionBarId === UIConfig.screenIdField) {
                actionBarDiv.setSelectedTab(actionBarItem);
            } else {
                if (Util.notEmpty(document.getElementById(actionBarItem))) {
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
            } else if (id === UIConfig.taskWithOperPagePrefix) {
                UIInvokeTarget.pageProcesser(taskInfo);
            }
            setActionBarSelected(actionBarId);
            setDevTabVisible();
            showAndClearToastMsg(toastMsg, params);
        }
    }

    return {
        webworksReadyCallback : function (e) {
            //Init on bbUI should before any other code loads.  
            if (gWebworksreadyFired) {
                return;
            }
            gWebworksreadyFired = true;
            bb.init({
                actionBarDark: true,
                controlsDark: false,
                listsDark: false,
                bb10ForPlayBook: false,
                onscreenready: onScreenReadyCallback,
                ondomready: onDomReadyCallback
            });
            initAllExistingReminders();
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
                bb.pushScreen('invoke-target.html', UIConfig.taskWithOperPagePrefix, {
                    'taskInfo' : {id: taskId}
                })
            }
        }

    };
}());

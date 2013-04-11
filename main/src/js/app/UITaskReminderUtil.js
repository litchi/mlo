/*jslint browser: true */
/*global gReminders, Notification, UIConfig, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UIMetaUtil*/
var UITaskReminderUtil = (function () {
    "use strict";
    var selectedReminderIds = {};

    //TODO change to a mapping table implementation to reduce code size
    //like this: offset[SeedData.OneMinMetaName] = 60000
    //And then: new Date(dueDate.getTime(0 - xxx))
    function getReminderDate(metaId, metaName, dueDate) {
        var result;
        if (metaName === SeedData.OffMetaName) {
            result = null;
        } else if (metaName === SeedData.WhenDueMetaName) {
            result = dueDate;
        } else if (metaName === SeedData.OneMinMetaName) {
            result = new Date(dueDate.getTime() - 60000);
        } else if (metaName === SeedData.FiveMinsMetaName) {
            result = new Date(dueDate.getTime() - 300000);
        } else if (metaName === SeedData.FifteenMinsMetaName) {
            result = new Date(dueDate.getTime() - 900000);
        } else if (metaName === SeedData.ThirtyMinsMetaName) {
            result = new Date(dueDate.getTime() - 1800000);
        } else if (metaName === SeedData.OneHourMetaName) {
            result = new Date(dueDate.getTime() - 3600000);
        } else if (metaName === SeedData.TwoHoursMetaName) {
            result = new Date(dueDate.getTime() - 7200000);
        } else if (metaName === SeedData.OneDayMetaName) {
            result = new Date(dueDate.getTime() - 86400000);
        }
        return result;
    }

    function removeExistingSelected() {
        var key, pElem, cElem;
        for (key in selectedReminderIds) {
            if (selectedReminderIds.hasOwnProperty(key)) {
                pElem = document.getElementById(key);
                if (Util.notEmpty(pElem)) {
                    cElem = document.getElementById(Util.genSelectedMetaMarkIconId(key));
                    if (Util.notEmpty(cElem)) {
                        pElem.removeChild(cElem);
                    }
                    pElem.setAttribute('class', 'meta reminder');
                    pElem.setAttribute('onclick', 'UITaskReminderUtil.selectReminder("' + key + '", "' + pElem.innerText + '")');
                }
            }
        }
        selectedReminderIds = {};
    }

    function getCurrentReminderMetaId() {
        var key;
        for (key in selectedReminderIds) {
            if (selectedReminderIds.hasOwnProperty(key)) {
                return key;
            }
        }
    }

    function getReminderCodeId(taskId) {
        return 'reminder_' + taskId;
    }

    function clearExistingReminder(taskId) {
        var reminderCodeId = getReminderCodeId(taskId),
            existingReminder = gReminders[reminderCodeId];
        if (Util.notEmpty(existingReminder)) {
            clearTimeout(existingReminder);
            delete gReminders[reminderCodeId];
        }
    }

    return {

        removeUIBNotification : function (taskId) {
            clearExistingReminder(taskId);
        },

        createUIBNotification : function (taskId, taskName, dueDate, reminderDate) {
            var reminderCodeId = getReminderCodeId(taskId),
                existingReminder = gReminders[reminderCodeId],
                title = UIConfig.notificationTitle,
                options = {
                    body         : Util.getNotificationBody(taskId, taskName, dueDate),
                    tag          : UIConfig.notificationPrefix + 'task.' + taskId,
                  //target       : UIConfig.openTaskDetailTarget,
                    targetAction : UIConfig.openTaskDetailAction,
                    payload      : Util.utf8_to_b64(taskId),
                    onshow       : function () {
                        console.log("The notification was created successfully!");
                    },
                    onerror     : function () {
                        console.log("The notification could not be created!");
                    }
                },
                offset = reminderDate.getTime() - new Date().getTime();
            if (offset > 0) {
                clearExistingReminder(taskId);
                gReminders[reminderCodeId] = setTimeout(function () {
                    return new Notification(title, options);
                }, offset);
            }
        },

        unSelectClickCallback : function (metaId, metaName) {
            return 'UITaskReminderUtil.unSelectReminder("' + metaId + '", "' + metaName + '")';
        },

        selectClickCallback : function (metaId, metaName) {
            return 'UITaskReminderUtil.selectReminder("' + metaId + '", "' + metaName + '")';
        },

        selectReminder : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            removeExistingSelected();
            selectedReminderIds[metaId] = metaName;
            span.setAttribute('class', 'selectedMeta selectedReminder');
            span.setAttribute('onclick', UITaskReminderUtil.unSelectClickCallback(metaId, metaName));
            if (Util.isEmpty(icon)) {
                icon = Util.createMetaSelectedIcon(metaId, 'deleteIcon');
            } else {
                icon.style.display = 'inline-block';
            }
            span.appendChild(icon);
        },

        unSelectReminder : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            delete selectedReminderIds[metaId];
            if (Util.notEmpty(icon)) {
                icon.style.display = 'none';
            }
            span.setAttribute('class', 'meta reminder');
            span.setAttribute('onclick', UITaskReminderUtil.selectClickCallback(metaId, metaName));
        },

        prepareReminderData : function (tx, taskId, reminderMetaName, due) {
            var i, max,
                reminderPanel = document.getElementById('edit-page-sub-panel-reminder'),
                reminderContainer = document.getElementById('reminderContainer'),
                tempDiv = document.createElement('div');
            if (Util.notEmpty(reminderContainer)) {
                reminderContainer.style.display = 'none';
                if (Util.isEmpty(reminderMetaName)) {
                    reminderMetaName = SeedData.OffMetaName;
                }
                DataAccess.runSqlDirectly(tx,
                    'select meta_id, meta_name from meta_view where meta_type_name = ? order by meta_ui_rank desc',
                    [SeedData.ReminderMetaTypeName],
                    function (tx, result, obj) {
                        var metaId, metaName, finalCallback;
                        if (null !== result && null !== result.rows && null !== result.rows.item) {
                            for (i = 0, max = result.rows.length; i < max; i += 1) {
                                metaId = result.rows.item(i).meta_id;
                                metaName = result.rows.item(i).meta_name;
                                if (i !== max - 1) {
                                    finalCallback = null;
                                } else {
                                    if (Util.notEmpty(due)) {
                                        finalCallback = Util.copyInnerHTMLAndShowContainer;
                                        reminderPanel.style.display = 'block';
                                    } else {
                                        finalCallback = Util.copyInnerHTML;
                                    }
                                }
                                UIMetaUtil.createMetaSpan(reminderContainer, tempDiv,
                                    metaId, metaName, [reminderMetaName], selectedReminderIds,
                                    UITaskReminderUtil.unSelectClickCallback,
                                    UITaskReminderUtil.selectClickCallback,
                                    finalCallback);
                            }
                        }
                    });
            } else {
                console.warn("Reminder Container is null");
            }
        },

        saveReminderInfo : function (tx, taskId, taskName, dueDate) {
            var metaName, reminderDate,
                metaId = getCurrentReminderMetaId(),
                myDate = Util.timeToDateWithZone(new Date(dueDate).getTime() / 1000);
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName,
                [taskId, SeedData.ReminderMetaTypeName]);
            UIMetaUtil.saveTaskMetaToDb(tx, taskId, selectedReminderIds);
            if (Util.notEmpty(dueDate)) {
                if (Util.notEmpty(metaId)) {
                    metaName = selectedReminderIds[metaId];
                    reminderDate = getReminderDate(metaId, metaName, myDate);
                }
                if (Util.notEmpty(reminderDate)) {
                    DataAccess.runSqlDirectly(tx, "update task set reminder_date = ? where id = ?",
                        [reminderDate.getTime() / 1000, taskId]);
                    UITaskReminderUtil.createUIBNotification(taskId, taskName, myDate, reminderDate);
                } else {
                    UITaskReminderUtil.removeUIBNotification(taskId);
                }
            } else {
                DataAccess.runSqlDirectly(tx, "update task set reminder_date = ? where id = ?", [null, taskId]);
            }
        },

        switchReminderPanelDisplay : function (dueDate) {
            var reminderContainer = document.getElementById('reminderContainer'),
                reminderPanel = document.getElementById('edit-page-sub-panel-reminder');
            if (Util.notEmpty(dueDate)
                    && Util.notEmpty(reminderPanel)
                    && Util.notEmpty(reminderContainer)
                    && (reminderPanel.style.display !== 'block' || reminderContainer.style.display !== 'block')) {
                reminderPanel.style.display = 'block';
                reminderContainer.style.display = 'block';
            } else if (Util.isEmpty(dueDate)
                    && (reminderPanel.style.display !== 'none' || reminderContainer.style.display !== 'none')) {
                reminderPanel.style.display = 'none';
                reminderContainer.style.display = 'none';
            }
        }

    };

}());

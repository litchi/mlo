/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UIMetaUtil*/
var UITaskReminderUtil = (function () {
    "use strict";
    var selectedReminderIds = {};

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
    }

    return {

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

        prepareReminderData : function (taskId, due) {
            var i, max,
                reminderPanel = document.getElementById('edit-page-sub-panel-reminder'),
                reminderContainer = document.getElementById('reminderContainer'),
                tempDiv = document.createElement('div');
            if (Util.notEmpty(reminderContainer)) {
                reminderContainer.style.display = 'none';
                DataAccess.appDb.transaction(function (tx) {
                    DataAccess.runSqlDirectly(
                        tx,
                        'select meta_id, meta_name from meta_view where meta_type_name = ? order by meta_ui_rank desc',
                        [SeedData.ReminderMetaTypeName],
                        function (tx, result, obj) {
                            if (null !== result && null !== result.rows && null !== result.rows.item) {
                                for (i = 0, max = result.rows.length; i < max; i += 1) {
                                    if (i !== max - 1) {
                                        UIMetaUtil.createMetaSpan(reminderContainer, tx, tempDiv, taskId,
                                            result.rows.item(i).meta_id, result.rows.item(i).meta_name, selectedReminderIds,
                                            UITaskReminderUtil.unSelectClickCallback, UITaskReminderUtil.selectClickCallback);
                                    } else {
                                        if (Util.notEmpty(due)) {
                                            UIMetaUtil.createMetaSpan(reminderContainer, tx, tempDiv, taskId,
                                                result.rows.item(i).meta_id, result.rows.item(i).meta_name, selectedReminderIds,
                                                UITaskReminderUtil.unSelectClickCallback, UITaskReminderUtil.selectClickCallback, Util.copyInnerHTMLAndShowContainer);
                                            reminderPanel.style.display = 'block';
                                        } else {
                                            UIMetaUtil.createMetaSpan(reminderContainer, tx, tempDiv, taskId,
                                                result.rows.item(i).meta_id, result.rows.item(i).meta_name, selectedReminderIds,
                                                UITaskReminderUtil.unSelectClickCallback, UITaskReminderUtil.selectClickCallback, Util.copyInnerHTML);
                                        }
                                    }
                                }
                            }
                        }
                    );
                });
            } else {
                console.warn("Reminder Container is null");
            }
        },

        saveReminderInfo : function (tx, taskId) {
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ReminderMetaTypeName]);
        },

        switchReminderPanelDisplay : function (dueDate) {
            var reminderContainer = document.getElementById('reminderContainer'),
                reminderPanel = document.getElementById('edit-page-sub-panel-reminder');
            if (Util.notEmpty(dueDate) && Util.notEmpty(reminderPanel) && Util.notEmpty(reminderContainer)) {
                reminderPanel.style.display = 'block';
                reminderContainer.style.display = 'block';
            } else if (Util.isEmpty(dueDate)) {
                reminderPanel.style.display = 'none';
                reminderContainer.style.display = 'none';
            }
        }

    };

}());

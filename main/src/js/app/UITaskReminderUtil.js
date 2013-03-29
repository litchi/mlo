/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController*/
var UITaskReminderUtil = (function () {
    "use strict";
    var selectedReminderIds = {};

    function createReminderSelectedIcon(metaId) {
        var icon = document.createElement('img');
        icon.setAttribute('id', Util.genSelectedMetaMarkIconId(metaId));
        icon.setAttribute('class', 'selectedIcon');
        icon.setAttribute('src', './resources/image/remove-context.png');
        icon.setAttribute('width', '32px');
        icon.setAttribute('height', '32px');
        return icon;
    }

    function createReminderSpan(container, tx, tempDiv, taskId, metaId, metaName, callback) {
        var span, count, icon;
        DataAccess.runSqlDirectly(
            tx,
            'select count(*) as c from task_view where task_id = ? and meta_id = ?',
            [taskId, metaId],
            function (tx, result, objs) {
                if (null !== result && null !== result.rows && null !== result.rows.item) {
                    span = document.createElement('span');
                    span.setAttribute('id', metaId);
                    count = result.rows.item(0).c;
                    if (count >= 1) {
                        span.setAttribute('class', 'selectedReminder');
                        span.setAttribute('onclick', 'UITaskReminderUtil.unSelectReminder("' + metaId + '", "' + metaName + '")');
                        selectedReminderIds[metaId] = metaName;
                        icon = createReminderSelectedIcon(metaId);
                    } else {
                        span.setAttribute('class', 'reminder');
                        span.setAttribute('onclick', 'UITaskReminderUtil.selectReminder("' + metaId + '", "' + metaName + '")');
                    }
                    span.innerText = metaName;
                    if (Util.notEmpty(icon)) {
                        span.appendChild(icon);
                    }
                    tempDiv.appendChild(span);
                    if (Util.isFunction(callback)) {
                        callback(container, tempDiv);
                    }
                }
            }
        );
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
                    pElem.setAttribute('class', 'reminder');
                    pElem.setAttribute('onclick', 'UITaskReminderUtil.selectReminder("' + key + '", "' + pElem.innerText + '")');
                }
            }
        }
    }

    return {

        selectReminder : function (metaId, metaName) {
            var icon = document.getElementById(Util.genSelectedMetaMarkIconId(metaId)),
                span = document.getElementById(metaId);
            removeExistingSelected();
            selectedReminderIds[metaId] = metaName;
            span.setAttribute('class', 'selectedReminder');
            span.setAttribute('onclick', 'UITaskReminderUtil.unSelectReminder("' + metaId + '", "' + metaName + '")');
            if (Util.isEmpty(icon)) {
                icon = createReminderSelectedIcon(metaId);
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
            span.setAttribute('class', 'reminder');
            span.setAttribute('onclick', 'UITaskReminderUtil.selectReminder("' + metaId + '", "' + metaName + '")');
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
                                        createReminderSpan(reminderContainer, tx, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name);
                                    } else {
                                        if (Util.notEmpty(due)) {
                                            createReminderSpan(reminderContainer, tx, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name, Util.copyInnerHTMLAndShowContainer);
                                            reminderPanel.style.display = 'block';
                                        } else {
                                            createReminderSpan(reminderContainer, tx, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name, Util.copyInnerHTML);
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

        //FIXME To be implemented!!!
        saveReminderInfo : function (tx, taskId) {
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

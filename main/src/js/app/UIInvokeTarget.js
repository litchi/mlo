/*jslint browser: true */
/*jshint unused: false */
/*global moment, UITaskUtil, TaskModel, blackberry, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UIActionBarController, UITaskReminderUtil, $, JQuery*/
var UIInvokeTarget = (function () {
    "use strict";

    function adjustContainerDisplay(container) {
        container.removeAttribute('onclick');
        $("#task-operation-list").css('display', 'block');
    }

    function revertTaskStatusToNew(taskId) {
        UITaskUtil.updateTaskStatus(taskId, SeedData.TaskNewStatus,
            function (taskId) {
                Util.showToast(UIConfig.msgForTaskStatusRestore + SeedData.TaskNewStatus,
                    UIConfig.emptyString,
                    function () {
                        bb.popScreen();
                    }, UIConfig.nothing);
            });
    }

    return {
        pageProcesser : function (taskInfo) {
            var taskId = taskInfo.id;
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, 'select task_name, meta_name, meta_type_name, task_reminder_date, task_due_date from task_view where task_id = ?', [taskId],
                    function (tx, result, objs) {
                        var metaCount, metaIndex, contexts = [], project = null, taskObj,
                            metaTypeName = null, taskDueDate = null, obj, item, gtdList, taskName,
                            displayReminderIcon = false, reminderMetaName, taskReminderDate,
                            container = document.getElementById(UIConfig.viewTaskDetailElementId);
                        metaCount = result.rows.length;
                        for (metaIndex = 0; metaIndex < metaCount; metaIndex += 1) {
                            obj = result.rows.item(metaIndex);
                            metaTypeName = obj.meta_type_name;
                            //An array is used to store context since there might be more than one context assigned to one task
                            if (SeedData.ContextMetaTypeName === metaTypeName) {
                                contexts.push(obj.meta_name);
                            } else if (SeedData.ProjectMetaTypeName === metaTypeName) {
                                project = obj.meta_name;
                            } else if (SeedData.ReminderMetaTypeName === metaTypeName &&
                                Util.notEmpty(obj.task_due_date) &&
                                Util.notEmpty(obj.task_reminder_date) &&
                                obj.meta_name !== SeedData.OffMetaName) {
                                displayReminderIcon = true;
                                reminderMetaName = obj.meta_name;
                            } else if ((Util.isEmpty(gtdList)) && SeedData.GtdMetaTypeName === metaTypeName) {
                                gtdList = obj.meta_name;
                            }
                            //Only get once task due date since it's the same for all the result set
                            if (Util.isEmpty(taskDueDate)) {
                                taskDueDate = obj.task_due_date;
                            }
                            if (Util.isEmpty(taskReminderDate)) {
                                taskReminderDate = obj.task_reminder_date;
                            }
                            if (Util.isEmpty(taskName)) {
                                taskName = obj.task_name;
                            }
                        }
                        if (null === taskDueDate) {
                            DataAccess.runSqlDirectly(tx,
                                'select due_date, reminder_date from task where id = ?', [taskId],
                                function (tx, result, objs) {
                                    taskDueDate = result.rows.item(0).due_date;
                                    taskReminderDate = result.rows.item(0).reminder_date;
                                    taskObj = TaskModel.constructTaskObj(taskId, taskName, gtdList, project, contexts,
                                        taskDueDate, reminderMetaName, taskReminderDate,
                                        displayReminderIcon);
                                    UITaskUtil.createTaskDetailView(container, taskObj);
                                    adjustContainerDisplay(container);
                                    $('#task-id').val(taskId);
                                });
                        } else {
                            taskObj = TaskModel.constructTaskObj(taskId, taskName, gtdList, project, contexts,
                                                                 taskDueDate, reminderMetaName, taskReminderDate,
                                                                 displayReminderIcon);
                            UITaskUtil.createTaskDetailView(container, taskObj);
                            adjustContainerDisplay(container);
                            $('#task-id').val(taskId);
                        }
                    });
            });
        },

        showPostponeList : function () {
            $("#task-postpone-list").css('display', 'block');
            $("#task-operation-list").css('display', 'none');
        },

        markTaskAsDone : function (taskId) {
            UITaskUtil.markTaskAsDone(taskId, function (taskId) {
                Util.showToast(UIConfig.msgForTaskStatusUpdatePref + SeedData.TaskDoneStatus,
                    UIConfig.msgUndo,
                    function () {
                        bb.popScreen();
                    }, function () {
                        revertTaskStatusToNew(taskId);
                    });
            });
        },

        moveTaskToTrash : function (taskId) {
            UITaskUtil.moveTaskToTrash(taskId, function (taskId) {
                Util.showToast(UIConfig.msgForTaskMoveToTrash, UIConfig.msgUndo,
                    function () {
                        bb.popScreen();
                    },
                    function () {
                        revertTaskStatusToNew(taskId);
                    });
            });
        },

        postponeTask : function (taskId, type, quantity) {
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx,
                    'select due_date, reminder_date from task where id = ?',
                    [taskId], function (tx, result, objs) {
                        if (Util.notEmpty(objs) && objs.length > 0) {
                            var newDueMoment, newReminderMoment,
                                newDueDate, newReminderDate,
                                dueDate = objs[0].due_date,
                                reminderDate = objs[0].reminder_date,
                                dueMoment = moment.unix(dueDate),
                                reminderMoment = moment.unix(reminderDate);
                            newDueMoment = dueMoment.add(type, quantity);
                            newReminderMoment = reminderMoment.add(type, quantity);
                            newDueDate = newDueMoment.toDate();
                            newReminderDate = newReminderMoment.toDate();
                            DataAccess.runSqlDirectly(tx,
                                'update task set reminder_date = ?, due_date = ? where id = ?',
                                [
                                    newReminderDate.getTime() / 1000,
                                    newDueDate.getTime() / 1000,
                                    taskId
                                ],
                                function(tx, result, objs) {
                                    type = type.substr(0, type.length - 1) + '(s)';
                                    Util.showToast('Task Postponed by ' + quantity + ' ' + type);
                                    UITaskReminderUtil.createUIBNotification(
                                        taskId, $("#view-task-detail-title").text(),
                                        newDueDate, newReminderDate);
                                    bb.popScreen();
                                });
                        }
                    });

            });
        },

        closePage : function () {
            bb.popScreen();
        }

    };
}());

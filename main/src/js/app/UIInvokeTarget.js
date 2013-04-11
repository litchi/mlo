/*jslint browser: true */
/*global UITaskUtil, TaskModel, blackberry, Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UIActionBarController, UITaskReminderUtil, $, JQuery*/
var UIInvokeTarget = (function () {
    "use strict";

    function adjustContainerDisplay(container) {
        container.removeAttribute('onclick');
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
                            } else if (SeedData.ReminderMetaTypeName === metaTypeName
                                        && Util.notEmpty(obj.task_due_date)
                                        && Util.notEmpty(obj.task_reminder_date)
                                        && obj.meta_name !== SeedData.OffMetaName) {
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
                                });
                        } else {
                            taskObj = TaskModel.constructTaskObj(taskId, taskName, gtdList, project, contexts,
                                taskDueDate, reminderMetaName, taskReminderDate,
                                displayReminderIcon);
                            UITaskUtil.createTaskDetailView(container, taskObj);
                            adjustContainerDisplay(container);
                        }
                    });
            });
        }
    };
}());

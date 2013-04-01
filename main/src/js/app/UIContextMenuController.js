/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController, UIActionBarController, UITaskUtil, UIMetaUtil*/

var UIContextMenuController = (function () {
    "use strict";

    function postponeToNextDay(oldDueDate) {
        var newDate = oldDueDate;
        newDate.setDate(oldDueDate.getDate() + 1);
        return newDate;
    }

    function postponeToToday(currentDate, oldDueDate) {
        var newDate = currentDate;
        newDate.setDate(currentDate.getDate());
        newDate.setHours(oldDueDate.getHours());
        newDate.setMinutes(oldDueDate.getMinutes());
        newDate.setSeconds(oldDueDate.getSeconds());
        return newDate;
    }

    function postponeToTodayDefaultTime(currentDate) {
        var newDueDate = currentDate;
        newDueDate.setDate(currentDate.getDate());
        newDueDate.setHours(10);
        newDueDate.setMinutes(0);
        newDueDate.setSeconds(0);
        return newDueDate;
    }

    function postponeTaskInternal() {
        var selectedItem, selectedId, currDueDateTimestamp, newDueDate,
            currentDate = new Date(),
            context = document.getElementById('task-operation-context-menu');
        selectedItem  = context.menu.selected;
        if (!selectedItem) {
            console.warn("Selected Item is null");
            return;
        }
        selectedId = selectedItem.selected.id;
        if (null === selectedId) {
            console.warn("Selected Id is null");
            return;
        }
        DataAccess.task.getDueDate(selectedId, function (tx, result, rows) {
            if (Util.isEmpty(rows)) {
                console.error('Task with id[%s] not found', selectedId);
                return;
            }
            currDueDateTimestamp = rows[0][Sql.Task.Cols.DueDate];
            if (Util.notEmpty(currDueDateTimestamp)) {
                var localDueDate = new Date(currDueDateTimestamp * 1000);
                if ((localDueDate.getTime() > currentDate.getTime() ||
                        (localDueDate.getDate() === currentDate.getDate() &&
                            localDueDate.getMonth() === currentDate.getMonth() &&
                            localDueDate.getFullYear() === currentDate.getFullYear()))) {
                    newDueDate = postponeToNextDay(localDueDate);
                } else {
                    newDueDate = postponeToToday(currentDate, localDueDate);
                }
            } else {
                newDueDate = postponeToTodayDefaultTime(currentDate);
            }
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, "update task set due_date = ? where id = ?", [newDueDate.getTime() / 1000, selectedId],
                    function (tx, result, objs) {
                        Util.refreshCurrentPage("Task postponed to " + Util.getPrettyDateStr(newDueDate));
                    });
            });
        }, function (tx, error) {
            log.logSqlError("Failed to postpone task[" + selectedId + "] to the next day", error);
        });
    }

    function updateTaskStatus(statusKey, successCallback) {
        var selectedItem, selectedId,
            context = document.getElementById('task-operation-context-menu');
        selectedItem  = context.menu.selected;
        if (selectedItem) {
            selectedId = selectedItem.selected.id;
            if (selectedId !== null) {
                DataAccess.task.updateStatus(selectedId, statusKey,
                    function (tx, result, rows) {
                        if (Util.isFunction(successCallback)) {
                            successCallback(selectedId);
                        }
                    }, function (tx, error) {
                        log.logSqlError("Failed to update status to [" + statusKey + "] for task[" + selectedId + "]", error);
                    });
            }
        }
    }

    //Fixme Actually it's not move but copy, need to fix this.
    function moveTaskToGtdList(metaName) {
        var selectedItem, selectedId,
            context = document.getElementById('task-operation-context-menu');
        selectedItem  = context.menu.selected;
        if (selectedItem) {
            selectedId = selectedItem.selected.id;
            if (selectedId !== null) {
                DataAccess.taskMeta.moveTaskToGtdList(selectedId, metaName,
                    function (tx3, result3, rows3) {
                        var currentMetaName = Util.valueOf('v_meta_name');
                        if (currentMetaName === SeedData.BasketMetaName || currentMetaName === SeedData.NextActionMetaName || currentMetaName === SeedData.SomedayMetaName) {
                            document.getElementById('task-' + selectedId).remove();
                        }
                        Util.showToast(UIConfig.msgForTaskMovePref + metaName);
                    },
                    function (tx3, error3) {
                        console.error("Failed to create task meta for task[" + selectedId + "], meta[" + metaName + "]");
                    });
            }
        }
    }

    return {

        moveTaskToTrash : function () {
            var selectedItem, selectedId,
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected.id;
                if (selectedId !== null) {
                    DataAccess.task.updateStatus(selectedId, SeedData.TaskDeletedStatus,
                        function (tx, result, rows) {
                            UIListController.removeTaskFromList(selectedId);
                            Util.showToast(UIConfig.msgForTaskMoveToTrash, UIConfig.msgUndo, UIConfig.nothing,
                                function () {
                                });
                        }, function (tx, error) {
                            log.logSqlError("Failed to delete task[" + selectedId + "]", error);
                        });
                }
            }
        },

        deleteTaskById : function (id) {
            DataAccess.task.updateStatus(id, SeedData.TaskDeletedStatus,
                function (tx, result, rows) {
                    bb.popScreen();
                }, function (tx, error) {
                    log.logSqlError("Failed to delete task[" + id + "]", error);
                });
        },

        editTask : function () {
            var selectedItem, selectedTaskInfo,
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            console.log(selectedItem);
            if (selectedItem) {
                selectedTaskInfo = selectedItem.selected;
                console.log(selectedTaskInfo);
                if (selectedTaskInfo !== null) {
                    bb.pushScreen('edit-task.html', UIConfig.editTaskPagePrefix,
                        {
                            'taskInfo'     : selectedTaskInfo,
                            'metaTypeId'   : Util.valueOf('v_meta_type_id'),
                            'metaTypeName' : Util.valueOf('v_meta_type_name'),
                            'metaId'       : Util.valueOf('v_meta_id'),
                            'metaName'     : Util.valueOf('v_meta_name')
                        });
                }
            }
        },

        editMeta : function () {
            var selectedItem, selectedId,
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    bb.pushScreen('edit-meta.html', UIConfig.editMetaPagePrefix, {'metaId' : selectedId});
                }
            }
        },

        deleteMeta : function () {
            var selectedItem, selectedId,
                savedMetaTypeId, savedName, savedDescription, savedUIRank,
                metaTypeName = Util.valueOf('v_meta_type_name'),
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    DataAccess.appDb.transaction(function (tx) {
                        DataAccess.runSqlDirectly(tx, "select meta_type_id, name, description, ui_rank from meta where id = ?", [selectedId],
                            function (tx, result, objs) {
                                if (Util.notEmpty(objs) && objs.length > 0) {
                                    savedMetaTypeId = objs[0].meta_type_id;
                                    savedName = objs[0].name;
                                    savedDescription = objs[0].description;
                                    savedUIRank = objs[0].ui_rank;
                                }
                            });
                    });
                    DataAccess.meta.deleteById(selectedId, function (tx, result, rows) {
                        document.getElementById(UIMetaUtil.getMetaUiId(selectedId)).remove();
                        Util.showToast(metaTypeName + " " + savedName + " Deleted", UIConfig.msgUndo, UIConfig.nothing,
                            function () {
                                DataAccess.appDb.transaction(function (tx) {
                                    DataAccess.runSqlDirectly(tx, Sql.Meta.InsertById, [selectedId, savedName, savedMetaTypeId, savedDescription, savedUIRank],
                                        function (tx, result, objs) {
                                            UIListController.fillMetaListMarkTypeAsSelected(savedMetaTypeId);
                                            var toastMsg = "Deletion of " + metaTypeName + " " + savedName + " reverted";
                                            Util.showToast(toastMsg);
                                        });
                                });
                            });
                    }, function (tx, error) {
                        log.logSqlError("Failed to delete meta[" + selectedId + "]", error);
                    });
                }
            }
        },

        emptyTrash : function () {
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, "select id from task where status = ?", [SeedData.TaskDeletedStatus],
                    function (tx, result, objs) {
                        var i = 0;
                        for (i = 0; i < objs.length; i += 1) {
                            DataAccess.runSqlDirectly(tx, "delete from task where id = ?", [objs[i].id]);
                            DataAccess.runSqlDirectly(tx, "delete from task_meta where task_id = ?", [objs[i].id]);
                        }
                        document.getElementById(UIConfig.detailListElementId).clear();
                        Util.showToast(UIConfig.msgForTrashBoxClean);
                    });
            });
        },

        restoreTaskFromTrash : function () {
            updateTaskStatus(SeedData.TaskNewStatus, function (taskId) {
                document.getElementById('task-' + taskId).remove();
                Util.showToast(UIConfig.msgForTaskRestore);
            });
        },

        markTaskAsDone : function () {
            updateTaskStatus(SeedData.TaskDoneStatus, function (taskId) {
                document.getElementById('task-' + taskId).style.textDecoration = 'line-through';
                Util.showToast(UIConfig.msgForTaskStatusUpdatePref + SeedData.TaskDoneStatus, UIConfig.msgUndo,
                    UIConfig.nothing, function () {
                        DataAccess.task.updateStatus(taskId, SeedData.TaskNewStatus,
                            function (tx, result, rows) {
                                document.getElementById('task-' + taskId).style.textDecoration = 'none';
                                Util.showToast(UIConfig.msgForTaskStatusRestore + SeedData.TaskNewStatus);
                            }, function (tx, error) {
                                log.logSqlError("Failed to update status to [" + SeedData.TaskNewStatus + "] for task[" + taskId + "]", error);
                            });
                    });
            });
        },

        markTaskAsNew : function () {
            updateTaskStatus(SeedData.TaskNewStatus, function (taskId) {
                document.getElementById('task-' + taskId).style.textDecoration = 'none';
                Util.showToast(UIConfig.msgForTaskStatusUpdatePref + SeedData.TaskNewStatus);
            });
        },

        postponeTask         : function () { postponeTaskInternal(); },
        moveTaskToNextAction : function () { moveTaskToGtdList(SeedData.NextActionMetaName); },
        moveTaskToSomeday    : function () { moveTaskToGtdList(SeedData.SomedayMetaName); },
        moveTaskToInBasket   : function () { moveTaskToGtdList(SeedData.BasketMetaName); }
    };
}());

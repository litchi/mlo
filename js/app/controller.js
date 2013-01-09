/*jslint browser: true */
/*global u, dataAccess, SQL, seedData, bb, log, console, uiConfig*/
"use strict";
function createTask(name, metaId) {
    var taskId, project = null, metaTypeName, metaName, context = null;
    dataAccess.task.create(name, function (tx, result, rows) {
        taskId = result.insertId;
        dataAccess.appDb.transaction(function (transaction) {
            transaction.executeSql(
                "insert into task_meta (id, task_id, meta_id) values (null, ?, ?)",
                [taskId, metaId],
                function (tx1, r2) {
                    metaTypeName = u.valueOf('v_meta_type_name');
                    metaName = u.valueOf('v_meta_name');
                    if (metaTypeName === seedData.projectMetaTypeName) {
                        project = metaName;
                    } else if (metaTypeName === seedData.contextMetaTypeName) {
                        context = [metaName];
                    }
                    addTaskToList(taskId, name, project, context, null);
                    u.setValue('ctsi', uiConfig.emptyString);
                },
                function (tx1, e) {
                    log.logSqlError("Failed to add task[" + taskId + "] to in basket", e);
                }
            );
        });
    }, function (tx, e1) {
        log.logSqlError("Failed creating task[" + name + "]", e1);
    });
    return false;
}

function deleteTask() {
    var selectedItem, selectedId,
        context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            dataAccess.task.deleteById(selectedId, function (tx, result, rows) {
                document.getElementById('task-' + selectedId).remove();
                if (0 === document.getElementById(uiConfig.detailListElementId).getItems().length) {
                    document.getElementById(uiConfig.detailListElementId).innerHTML = uiConfig.msgForNoTask;
                }
            }, function (tx, error) {
                log.logSqlError("Failed to delete task[" + selectedId + "]", error);
            });
        }
    }
}

function deleteTaskById(id) {
    dataAccess.task.deleteById(id, function (tx, result, rows) {
        bb.popScreen();
    }, function (tx, error) {
        log.logSqlError("Failed to delete task[" + id + "]", error);
    });
}

//TODO Optimize code and remove duplicates
function editTask() {
    var selectedItem, selectedId,
        context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            bb.pushScreen('edit-task.html', uiConfig.editTaskPagePrefix + selectedId, {'taskId' : selectedId});
        }
    }
}

function editMeta() {
    var selectedItem, selectedId,
        context = document.getElementById('meta-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            bb.pushScreen('edit-meta.html', uiConfig.editMetaPagePrefix + selectedId, {'metaId' : selectedId});
        }
    }
}

function saveMeta(id, name, meta_type_id, description) {
    if (id !== null && id !== undefined && id !== uiConfig.emptyString) {//If update a meta
        dataAccess.meta.update(id, name, description, function (tx, result, rows) {
            bb.pushScreen('meta-by-type.html', uiConfig.metaByPagePrefix + meta_type_id);
        }, function (tx, error) {
            //TODO Change all those to sprintf(http://www.diveintojavascript.com/projects/javascript-sprintf)
            log.logSqlError("Failed to update meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
        });
    } else {
        dataAccess.meta.create(name, meta_type_id, description, function (tx, result, rows) {
            bb.pushScreen('meta-by-type.html', uiConfig.metaByPagePrefix + meta_type_id);
        }, function (tx, error) {
            log.logSqlError("Failed to create meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
        });
    }
}

function deleteMeta() {
    var selectedItem, selectedId,
        context = document.getElementById('meta-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            dataAccess.meta.deleteById(selectedId, function (tx, result, rows) {
                document.getElementById('meta-' + selectedId).remove();
            }, function (tx, error) {
                log.logSqlError("Failed to delete meta[" + selectedId + "]", error);
            });
        }
    }
}

function updateTaskStatus(statusKey, textDecoration) {
    var selectedItem, selectedId,
        context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            //TODO Change to set style class 
            dataAccess.task.updateStatus(selectedId, statusKey, function (tx, result, rows) {
                document.getElementById('task-' + selectedId).style.textDecoration = textDecoration;
            }, function (tx, error) {
                log.logSqlError("Failed to update status to [" + statusKey + "] for task[" + selectedId + "]", error);
            });
        }
    }
}

function moveTaskToGtdList(metaName) {
    var selectedItem, selectedId,
        context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if (selectedId !== null) {
            //TODO Generate the context menu dynamically based on current task status
            dataAccess.taskMeta.moveTaskToGtdList(selectedId, metaName,
                function (tx3, result3, rows3) {
                    var metaTypeName = u.valueOf('v_meta_type_name');
                    if (metaTypeName !== seedData.projectMetaTypeName && metaTypeName !== seedData.contextMetaTypeName) {
                        document.getElementById('task-' + selectedId).remove();
                    }
                },
                function (tx3, error3) {
                    console.error("Failed to create task meta for task[" + selectedId + "], meta[" + metaName + "]");
                });
        }
    }
}

function markTaskAsDone() {
    updateTaskStatus(seedData.taskDoneStatus, 'line-through');
}
function markTaskAsNew() {
    updateTaskStatus(seedData.taskNewStatus, 'none');
}

function moveTaskToNextAction() {
    moveTaskToGtdList(seedData.nextActionMetaName);
}
function moveTaskToSomeday() {
    moveTaskToGtdList(seedData.somedayMetaName);
}
function moveTaskToInBasket() {
    moveTaskToGtdList(seedData.inBasketMetaName);
}

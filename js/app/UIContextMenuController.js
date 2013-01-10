/*jslint browser: true */
/*global Util, DataAccess, Sql, seedData, bb, log, console, UIConfig, openDatabase, AppSql, AppConfig, UIListController, UIEditFormController*/

var UIContextMenuController = (function () {
    "use strict";

    function updateTaskStatus(statusKey, textDecoration) {
        var selectedItem, selectedId,
            context = document.getElementById('task-operation-context-menu');
        selectedItem  = context.menu.selected;
        if (selectedItem) {
            selectedId = selectedItem.selected;
            if (selectedId !== null) {
                //TODO Change to set style class 
                DataAccess.task.updateStatus(selectedId, statusKey, function (tx, result, rows) {
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
                DataAccess.taskMeta.moveTaskToGtdList(selectedId, metaName,
                    function (tx3, result3, rows3) {
                        var metaTypeName = Util.valueOf('v_meta_type_name');
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

    return {
        createTask : function (name, metaId) {
            var taskId, project = null, metaTypeName, metaName, context = null;
            DataAccess.task.create(name, function (tx, result, rows) {
                taskId = result.insertId;
                DataAccess.appDb.transaction(function (transaction) {
                    transaction.executeSql(
                        "insert into task_meta (id, task_id, meta_id) values (null, ?, ?)",
                        [taskId, metaId],
                        function (tx1, r2) {
                            metaTypeName = Util.valueOf('v_meta_type_name');
                            metaName = Util.valueOf('v_meta_name');
                            if (metaTypeName === seedData.projectMetaTypeName) {
                                project = metaName;
                            } else if (metaTypeName === seedData.contextMetaTypeName) {
                                context = [metaName];
                            }
                            UIListController.addTaskToList(taskId, name, project, context, null);
                            Util.setValue('ctsi', UIConfig.emptyString);
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
        },

        deleteTask : function () {
            var selectedItem, selectedId,
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    DataAccess.task.deleteById(selectedId, function (tx, result, rows) {
                        document.getElementById('task-' + selectedId).remove();
                        if (0 === document.getElementById(UIConfig.detailListElementId).getItems().length) {
                            document.getElementById(UIConfig.detailListElementId).innerHTML = UIConfig.msgForNoTask;
                        }
                    }, function (tx, error) {
                        log.logSqlError("Failed to delete task[" + selectedId + "]", error);
                    });
                }
            }
        },

        deleteTaskById : function (id) {
            DataAccess.task.deleteById(id, function (tx, result, rows) {
                bb.popScreen();
            }, function (tx, error) {
                log.logSqlError("Failed to delete task[" + id + "]", error);
            });
        },

        //TODO Optimize code and remove duplicates
        editTask : function () {
            var selectedItem, selectedId,
                context = document.getElementById('task-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    bb.pushScreen('edit-task.html', UIConfig.editTaskPagePrefix + selectedId, {'taskId' : selectedId});
                }
            }
        },

        editMeta : function () {
            var selectedItem, selectedId,
                context = document.getElementById('meta-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    bb.pushScreen('edit-meta.html', UIConfig.editMetaPagePrefix + selectedId, {'metaId' : selectedId});
                }
            }
        },

        saveMeta : function (id, name, meta_type_id, description) {
            var placeholder;
            if (UIConfig.emptyString === name) {
                if (seedData.projectMetaTypeName === Util.valueOf('meta_type_name')) {
                    placeholder = 'Please fill in project name';
                } else if (seedData.contextMetaTypeName === Util.valueOf('meta_type_name')) {
                    placeholder = 'Please fill in context name';
                }
                document.getElementById('meta_name').setAttribute('placeholder', placeholder);
                return;
            }
            if (id !== null && id !== undefined && id !== UIConfig.emptyString) {//If update a meta
                DataAccess.meta.update(id, name, description, function (tx, result, rows) {
                    bb.pushScreen('meta-by-type.html', UIConfig.metaByPagePrefix + meta_type_id);
                }, function (tx, error) {
                    //TODO Change all those to sprintf(http://www.diveintojavascript.com/projects/javascript-sprintf)
                    log.logSqlError("Failed to update meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
                });
            } else {
                DataAccess.meta.create(name, meta_type_id, description, function (tx, result, rows) {
                    bb.pushScreen('meta-by-type.html', UIConfig.metaByPagePrefix + meta_type_id);
                }, function (tx, error) {
                    log.logSqlError("Failed to create meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
                });
            }
        },

        deleteMeta : function () {
            var selectedItem, selectedId,
                context = document.getElementById('meta-operation-context-menu');
            selectedItem  = context.menu.selected;
            if (selectedItem) {
                selectedId = selectedItem.selected;
                if (selectedId !== null) {
                    DataAccess.meta.deleteById(selectedId, function (tx, result, rows) {
                        document.getElementById('meta-' + selectedId).remove();
                    }, function (tx, error) {
                        log.logSqlError("Failed to delete meta[" + selectedId + "]", error);
                    });
                }
            }
        },

        markTaskAsDone       : function () { updateTaskStatus(seedData.taskDoneStatus, 'line-through'); },
        markTaskAsNew        : function () { updateTaskStatus(seedData.taskNewStatus, 'none'); },
        moveTaskToNextAction : function () { moveTaskToGtdList(seedData.nextActionMetaName); },
        moveTaskToSomeday    : function () { moveTaskToGtdList(seedData.somedayMetaName); },
        moveTaskToInBasket   : function () { moveTaskToGtdList(seedData.inBasketMetaName); }
    };
}());

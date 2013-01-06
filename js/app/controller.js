function createTask(name, metaId){
    var taskId; 
    dataAccess.task.create(name, function(tx, result, rows){
        taskId = result.insertId;
        dataAccess.appDb.transaction(function(transaction){
            transaction.executeSql(
                "insert into task_meta (id, task_id, meta_id) values (null, ?, ?)", 
                [taskId, metaId],
                function(tx1, r2){
                    addTaskToList(taskId, name, null, null);
                    u.setValue('ctsi', uiConfig.emptyString);
                }, 
                function(tx1, e){
                    log.logSqlError("Failed to add task[" + taskId + "] to in basket", e);
                }
            );
        });
    }, function(tx, e1) {
        log.logSqlError("Failed creating task[" + name + "]", e1);
    });
    return false;
}

function deleteTask(){
    var selectedItem, selectedId,
    context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
            dataAccess.task.delete(selectedId, function(tx, result, rows){
                document.getElementById('task-' + selectedId).remove();
                if(document.getElementById(uiConfig.detailListElementId).getItems().length == 0){
                    document.getElementById(uiConfig.detailListElementId).innerHTML = uiConfig.msgForNoTask;
                }
            }, function(tx, error) {
                log.logSqlError("Failed to delete task[" + selectedId + "]", error);
            });
        }
    }
}

function deleteTaskById(id){
    dataAccess.task.delete(id, function(tx, result, rows){
        bb.popScreen();
    }, function(tx, error) {
        log.logSqlError("Failed to delete task[" + id + "]", error);
    });
}

//TODO Optimize code and remove duplicates
function editTask(){
    var selectedItem, selectedId,
    context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
            bb.pushScreen('edit-task.html', uiConfig.editTaskPagePrefix + selectedId, {'taskId' : selectedId}); 
        }
    }
}

function editMeta(){
    var selectedItem, selectedId,
    context = document.getElementById('meta-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
            bb.pushScreen('edit-meta.html', uiConfig.editMetaPagePrefix + selectedId, {'metaId' : selectedId}); 
        }
    }
}

function saveTask(id, name, projectId){
    dataAccess.task.update(id, name, function(tx, result, rows){
        //Set Reminder
        reminderOn = document.getElementById('is-reminder-on').getChecked();
        if(reminderOn){
            var dueDate = u.valueOf('due-date'), dueTime = u.valueOf('due-time');
            var myDate = new Date(dueDate + " " + dueTime).getTime();
            var currDate = new Date().getTime();
            if(myDate > currDate){ 
                var reminderAfter = myDate - currDate;
                console.log("Reminder after: " + reminderAfter);
                dataAccess.appDb.transaction(function(transaction){
                    transaction.executeSql("update task set next_reminder_time = ? where taskId = ?", [myDate, taskId], 
                        function(tx, result) {
                            //Set reminder, add to system notificatin hub.
                        });
                });
            }
        }

        //1. Delete the old one
        dataAccess.appDb.transaction(function(tx1){
            tx1.executeSql(
                "delete from task_meta where task_id = ? and meta_id = (select meta_id from meta_view where meta_type_name = ?)", 
                [id, seedData.projectMetaTypeName], 
                function(tx, result) {
                    //2. Insert the new one
                    dataAccess.appDb.transaction(function(tx2){
                        tx2.executeSql(
                            'insert into task_meta (id, task_id, meta_id) values(null, ?, ?)', 
                            [id, projectId],
                            function(tx, result){
                                console.debug("Successfully change project id to %s for task [%s,%s]", projectId, id, name);
                            }, function(tx, error){
                                log.logSqlError("Failed to update project id to %s for task[%s, %s]", projectId, id, name);
                            }
                        );
                    });
                }, function(tx, error){
                    log.logSqlError("Failed to delete project meta for task[%s, %s]", id, name);
                }
            );
        });
        //TODO get back the context
        bb.popScreen();
    }, function(tx, error) {
        log.logSqlError("Failed to update task[" + id + "][" + name + "]", error);
    });
}

function saveMeta(id, name, meta_type_id, description){
    if(id != null && id != undefined && id != ''){//If update a meta
        dataAccess.meta.update(id, name, description, function(tx, result, rows){
            bb.pushScreen('meta-by-type.html',uiConfig.metaByPagePrefix + meta_type_id);
        }, function(tx, error) {
        //TODO Change all those to sprintf(http://www.diveintojavascript.com/projects/javascript-sprintf)
            log.logSqlError("Failed to update meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
        });
    } else {
        dataAccess.meta.create(name, meta_type_id, description, function(tx, result, rows){
            bb.pushScreen('meta-by-type.html',uiConfig.metaByPagePrefix + meta_type_id);
        }, function(tx, error) {
            log.logSqlError("Failed to create meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
        });
    }
}

function deleteMeta(){
    var selectedItem, selectedId,
    context = document.getElementById('meta-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
            dataAccess.meta.delete(selectedId, function(tx, result, rows){
                document.getElementById('meta-' + selectedId).remove();
            }, function(tx, error) {
                log.logSqlError("Failed to delete meta[" + selectedId + "]", error);
            });
        }
    }
}

function markTaskAsDone(){
    updateTaskStatus(seedData.taskDoneStatus, 'line-through');
}
function markTaskAsNew(){
    updateTaskStatus(seedData.taskNewStatus, 'none');
}

function updateTaskStatus(statusKey, textDecoration){
    var selectedItem, selectedId,
    context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
            //TODO Change to set style class 
            dataAccess.task.updateStatus(selectedId, statusKey, function(tx, result, rows) {
                document.getElementById('task-' + selectedId).style.textDecoration = textDecoration;
            }, function(tx, error) {
                log.logSqlError("Failed to update status to [" + statusKey + "] for task[" + selectedId + "]", error);
            });
        }
    }
}

function moveTaskToNextAction(){
    moveTaskToGtdList(seedData.nextActionMetaName);
}
function moveTaskToSomeday(){
    moveTaskToGtdList(seedData.somedayMetaName);
}
function moveTaskToInBasket(){
    moveTaskToGtdList(seedData.inBasketMetaName);
}
function moveTaskToGtdList(metaName){
    var selectedItem, selectedId,
    context = document.getElementById('task-operation-context-menu');
    selectedItem  = context.menu.selected;
    if (selectedItem) {
        selectedId = selectedItem.selected;
        if(selectedId != null){
        //TODO Generate the context menu dynamically based on current task status
            dataAccess.taskMeta.moveTaskToGtdList(
                selectedId, metaName, function(tx3, result3, rows3) {
                    document.getElementById('task-' + selectedId).remove();
                }, 
                function(tx3, error3){
                    console.error("Failed to create task meta for task[" + result.insertId + "], meta[" + meta_id + "]");
                }
            );
        }
    }
}

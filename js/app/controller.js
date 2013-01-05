function createTask(name){
    var taskId, r = false, count = 0, interval, runned = false;
    dataAccess.task.create(name, function(tx, result, rows){
        taskId = result.insertId;
        r = true;
        dataAccess.appDb.transaction(function(transaction){
            transaction.executeSql(
                "INSERT INTO task_meta (id, task_id, meta_id) select null, ?, id from meta where name = ? and meta_type_id = (select id from meta_type where name = ?)", 
                [taskId, 'In Basket', 'GTD'],
                function(tx1, r){
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

function saveTask(id, name){
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
                    transaction.executeSql("delete from task_reminder where task_id = ?", [taskId]);
                    transaction.executeSql("insert into task_reminder (id, task_id, next_reminder_time) values(null, ?, ?)", [taskId, myDate], 
                    function(tx1, result) {
                        //Set reminder, add to system notificatin hub.
                        setTimeout(function(){
                            customDialog(name);
                        }, reminderAfter);
                    });
                });
            }
        }
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

function customDialog(taskName) {
    try {
        var buttons = ["Close the reminder"];
            var ops = {title : "Peaceful & Better Life's Reminder", size : "large", position : "middleCenter"};
            blackberry.ui.dialog.customAskAsync(taskName, buttons, function(index){
                console.debug("Index " + index + " Selected for customDialog");
            }, ops);
    } catch(e) {
        console.error("Exception in customDialog: " + e);
    }
}

function createTask(name){
    var taskId, r = false, count = 0, interval, runned = false;
    dataAccess.task.create(name, function(tx, result, rows){
        taskId = result.insertId;
        r = true;
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
    interval = setInterval(function(){
            metaName = u.valueOf('v_meta_name'), 
            metaTypeName = u.valueOf('v_meta_type_name');
        count = count + 1;
        if((count >= 10) || (true === runned)){
            clearInterval(interval);
        }
        if(r == true && taskId != null && taskId != undefined){
            runned = true;
            dataAccess.taskMeta.throwTaskToList(
                taskId, metaName, metaTypeName, function(tx3, result3, rows3) {
                }, 
                function(tx3, error3){
                    console.error("Failed to create task meta for task[" + result.insertId + "], meta[" + meta_id + "]");
                }
            );
            addTaskToList(taskId, name, null, null);
        }
        clearInterval(interval);
    }, 100);
    u.setValue('ctsi', uiConfig.emptyString);
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
                setTimeout(function(){
                    if(document.getElementById(uiConfig.detailListElementId).getItems().length == 0){
                        document.getElementById(uiConfig.detailListElementId).innerHTML = uiConfig.msgForNoTask;
                    }
                }, 100);
            }, function(tx, error) {
                bb.pushScreen("error.html", "error-page"); 
            });
        }
    }
}

function deleteTaskById(id){
    dataAccess.task.delete(id, function(tx, result, rows){
        bb.popScreen();
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
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
        bb.popScreen();
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
}

function saveMeta(id, name, meta_type_id, description){
    if(id != null && id != undefined && id != ''){//If update a meta
        dataAccess.meta.update(id, name, description, function(tx, result, rows){
            bb.pushScreen('meta-by-type.html',uiConfig.metaByPagePrefix + meta_type_id);
        }, function(tx, error) {
            bb.pushScreen("error.html", "error-page"); 
        });
    } else {
        dataAccess.meta.create(name, meta_type_id, description, function(tx, result, rows){
            bb.pushScreen('meta-by-type.html',uiConfig.metaByPagePrefix + meta_type_id);
        }, function(tx, error) {
            bb.pushScreen("error.html", "error-page"); 
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
                bb.pushScreen("error.html", "error-page"); 
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
                bb.pushScreen("error.html", "error-page"); 
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

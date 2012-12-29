function createTask(title){
    dataAccess.task.create(title, function(tx, result, rows){
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
}

function deleteTask(){
    var selectedItem, selectedId,
    context = document.getElementById('task-operation-context-menu');
    console.debug(context);
    selectedItem  = context.menu.selected;
    console.debug(selectedItem);
    if (selectedItem) {
        selectedId = selectedItem.selected;
        console.debug(selectedId);
        if(selectedId != null){
            dataAccess.task.delete(selectedId, function(tx, result, rows){
                document.getElementById('task-' + selectedId).remove();
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
    console.debug(context);
    selectedItem  = context.menu.selected;
    console.debug(selectedItem);
    if (selectedItem) {
        selectedId = selectedItem.selected;
        console.debug(selectedId);
        if(selectedId != null){
            bb.pushScreen('edit-task.html', uiConfig.editTaskPagePrefix + selectedId, {'taskId' : selectedId}); 
        }
    }
}

function editMeta(){
    var selectedItem, selectedId,
    context = document.getElementById('meta-operation-context-menu');
    console.debug(context);
    selectedItem  = context.menu.selected;
    console.debug(selectedItem);
    if (selectedItem) {
        selectedId = selectedItem.selected;
        console.debug(selectedId);
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

function saveMeta(id, name, description){
    dataAccess.meta.update(id, name, description, function(tx, result, rows){
        bb.popScreen();
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
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

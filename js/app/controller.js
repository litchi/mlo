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
                document.getElementById(selectedId).remove();
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
            bb.pushScreen('edit-task.html', 'edit-task-' + selectedId, {'taskId' : selectedId}); 
        }
    }
}

function saveTask(id, title){
    dataAccess.task.update(id, title, function(tx, result, rows){
        bb.popScreen();
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
}

function switchMetaEditLink(){
    var items, item, 
    currentLink = document.getElementById('edit-meta-link').innerText;
    console.log(currentLink);
    metaList = document.getElementById('meta-list');
    items = metaList.getItems();
    metaList.clear();
    for(var key in items){
        item = items[key];
        item.innerText = null;
        if(currentLink == 'Edit'){
            console.log("I am here");
            item.setAttribute('data-bb-title', item.getTitle() + " >");
            item.onclick = function(){
                bb.pushScreen('edit-project.html', 'edit-project');
            };
            document.getElementById('edit-meta-link').innerText = 'Cancel';
        }
        if(currentLink == 'Cancel'){
            title = item.getTitle();
            item.setAttribute('data-bb-title', title.substring(0, title.length - 4));
            item.onclick = function(){
                adjustTaskGroupWidth(uiConfig.leftPanelWidth, uiConfig.rightPanelWidth, uiConfig.rightPanelSmallerLeftMargin);
            };
            document.getElementById('edit-meta-link').innerText = 'Edit';
        }
        metaList.appendItem(item);
    }
    metaList.refresh();
}

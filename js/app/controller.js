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

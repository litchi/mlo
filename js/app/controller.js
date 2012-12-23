function createTaskShortcut(title){
    dataAccess.task.create(title, function(tx, result, rows){
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
    addTaskToList(title);
}

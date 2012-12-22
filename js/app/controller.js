function createTaskShortcut(title){
    dataAccess.task.create(title, function(tx, result, rows){
        bb.pushScreen("task-list.html",'task-list', {'appendTask' : rows[0][ID_COLUMN_NAME]});
    }, function(tx, error) {
        bb.pushScreen("error.html", "error-page"); 
    });
}

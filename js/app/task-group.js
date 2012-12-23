function adjustTaskGroupWidth(groupWidth,taskWidth,taskLeft) {
    document.getElementById('group').style.width=groupWidth;
    document.getElementById('task-list').style.width=taskWidth;
    document.getElementById('task-list').style.left=taskLeft + 'px';
}

function addTaskToList (id, title, project, tags) {
    var item, taskList;
    item = createItemElement(id, title, project, tags);
    taskList = document.getElementById('task-list');
    taskList.appendItem(item, taskList[0]);
}

function addAllTaskToList () {
    dataAccess.task.getAll(function(transaction, results, arrays){
        for(var key in arrays){   
            title = arrays[key][TASK_COLUMNS.TITLE];
            id    = arrays[key][TASK_COLUMNS.ID];
            console.log("Task id: " + id + ", title: " + title);
            addTaskToList(id, title, "Project", "@中文 @Call @Tag2");    
        }
    }, function(transaction, error){
        console.log("Error getting task with ID " + taskId);    
    });
}

function createItemElement(id, title, project, tags) {
    var item = document.createElement('div');
    item.setAttribute('data-bb-type','item');
    item.setAttribute('data-bb-style','stretch');
    item.onclick = function() {
        document.getElementById('task-operation-context-menu').menu.show({title:'Edit Task',description: title, selected:this});
    };    
    if(id != null){
        item.setAttribute('id', id);
    }
    if(project != null){
        item.setAttribute('data-bb-accent-text', project);
    }
    if (title != null) {                     
        item.setAttribute('title', title);
        item.setAttribute('data-bb-title',title);
    }
    if (tags != null) {
        item.innerHTML = tags;
    }
    return item;
}

function listAllTasks () {
    dataAccess.task.getAll(function(transaction, results, arrays){
    });
}

function dialogCallBack(index){
    alert(index);
}
function customDialog(task_title) {
    try {
        var buttons = ["Done!", "Postpone :(", "Open Task"];
            var ops = {title : "Peaceful & Better Life's Reminder", size : "large", position : "middleCenter"};
            blackberry.ui.dialog.customAskAsync(task_title, buttons, dialogCallBack, ops);
    } catch(e) {
        console.log("Exception in customDialog: " + e);
    }
}

function adjustTaskGroupWidth(groupWidth,taskWidth,taskLeft) {
    document.getElementById('group').style.width=groupWidth;
    document.getElementById('task-list').style.width=taskWidth;
    document.getElementById('task-list').style.left=taskLeft + 'px';
}

function addTaskToUI (taskId) {
    // Create the element just like you would in a normal screen declaration
    dataAccess.task.getById(taskId), function(transaction, results, arrays){
        var taskTitle = arrays[0][TASK_COLUMNS.TITLE];
        var list = document.createElement('div');
        list.setAttribute('data-bb-type','item');
        list.setAttribute('data-bb-title', taskTitle);
        list.onclick = function() {
            document.getElementById('task-operation-context-menu').menu.show({title:'Task',description: taskTitle,selected:this});"
        };
        list = bb.item.style(list);
        // Insert it into the screen and update the scroller
        document.getElementById('task-list').appendChild(list);
        bb.refresh();
    }
}

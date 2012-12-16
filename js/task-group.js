function adjustTaskGroupWidth(groupWidth,taskWidth,taskLeft) {
    document.getElementById('group').style.width=groupWidth;
    document.getElementById('task-list').style.width=taskWidth;
    document.getElementById('task-list').style.left=taskLeft + 'px';
}

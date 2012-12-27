var webworksreadyFired = false;

function loadCallback(){
    // Fire the webworksready event for PlayBook and BBOS
    if (navigator.userAgent.indexOf('Version/10.0') < 0) {
        var evt = document.createEvent('Events');
        evt.initEvent('webworksready', true, true);
        document.dispatchEvent(evt);
    }
}

function webworksReadyCallback(e){
    //Init on bbUI should before any other code loads.  
    //Pass no parameters.. [bb.init()] to do the default init;
    if (webworksreadyFired) return;
    webworksreadyFired = true;
    bb.init({
        actionBarDark: true,
        controlsDark: true,
        listsDark: false,
        bb10ForPlayBook: false,
        onscreenready: onScreenReadyCallback,
        ondomready: onDomReadyCallback
    });
    bb.pushScreen('task-list.html', 'next-action');
}

function onScreenReadyCallback(element, id){
}

function onDomReadyCallback(element, id){
    var editTaskPrefix = 'edit-task-';
    if(id != null){
        if(id === 'inbox' || id === 'next-action'){
            addAllTaskToList(); 
        }
        if(id.slice(0, editTaskPrefix.length) == editTaskPrefix){
            taskId = id.substring(editTaskPrefix.length);
            fillTaskToEditForm(taskId);
        }
    }
}

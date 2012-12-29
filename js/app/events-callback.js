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
    if(id != null){
        if(id === 'inbox' || id === 'next-action'){
            addAllTaskToList(); 
        } else if(id.slice(0, uiConfig.editTaskPagePrefix.length) == uiConfig.editTaskPagePrefix){
            taskId = id.substring(uiConfig.editTaskPagePrefix.length);
            fillTaskToEditForm(taskId);
        } else if(id.slice(0, uiConfig.taskByPagePrefix.length) == uiConfig.taskByPagePrefix){
            metaTypeName = id.substring(uiConfig.taskByPagePrefix.length);
            fillMetaListToPanel(metaTypeName, uiConfig.taskByPagePrefix);
            fillTasksToPanel(metaTypeName, uiConfig.taskByPagePrefix);
        } else if(id === 'dimensions'){
            //TODO Move 'context', 'project' to a constant and make sure all reference refer to one definition
            fillMetaTypeToPanel();
            fillMetaListToPanel('context', uiConfig.metaByPagePrefix);
        } else if(id.slice(0, uiConfig.editMetaPagePrefix.length) == uiConfig.editMetaPagePrefix){
            metaId = id.substring(uiConfig.editMetaPagePrefix.length);
            fillMetaToEditForm(metaId);
        }
    }
}

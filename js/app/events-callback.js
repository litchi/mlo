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
        } else if(u.startsWith(id, uiConfig.editTaskPagePrefix)){
            taskId = id.substring(uiConfig.editTaskPagePrefix.length);
            fillTaskToEditForm(taskId);
        } else if(u.startsWith(id, uiConfig.taskByPagePrefix)){
            metaTypeName = id.substring(uiConfig.taskByPagePrefix.length);
            //TODO Change to id, required additional change on actionbar.html
            fillMetaListToPanelByTypeName(metaTypeName, uiConfig.taskByPagePrefix);
            fillTasksToPanel(metaTypeName, uiConfig.taskByPagePrefix);
        } else if(id === 'dimensions'){
            fillMetaTypeToPanel();
            //Set a default
            //fillMetaListToPanel('context', uiConfig.metaByPagePrefix);
        } else if(u.startsWith(id, uiConfig.editMetaPagePrefix)){
            metaId = id.substring(uiConfig.editMetaPagePrefix.length);
            fillMetaToEditForm(metaId);
        } else if(u.startsWith(id, uiConfig.createMetaPagePrefix)){
            metaTypeId = id.substring(uiConfig.createMetaPagePrefix.length);
            fillMetaToCreateForm(metaTypeId);
        } else if(u.startsWith(id, uiConfig.metaByPagePrefix)){
            fillMetaTypeToPanel();
            metaTypeId = id.substring(uiConfig.metaByPagePrefix.length);
            fillMetaListToPanel(metaTypeId, uiConfig.metaByPagePrefix);
        }
    }
}

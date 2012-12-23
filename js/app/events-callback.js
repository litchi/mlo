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
    // You must call init on bbUI before any other code loads.  
    // If you want default functionality simply don't pass any parameters.. bb.init();
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
    console.debug("Element: " + element + ", id: " + id);
    if(id === 'inbox' || id === 'next-action'){
        addAllTaskToList(); 
    }
}

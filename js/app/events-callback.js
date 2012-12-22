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
    bb.init({
        onscreenready: onScreenReadyCallback(element, id),
        ondomready: onDomReadyCallback(element, id)
    });
    bb.pushScreen('task-list.html', 'main');
}

function onScreenReadyCallback(element, id){

}

function onDomReadyCallback(element, id){

}

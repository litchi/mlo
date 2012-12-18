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

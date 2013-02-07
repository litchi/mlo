/*jslint browser: true*/
var UIConfig = (function () {
    "use strict";
    return {
        emptyString                 : '',
        leftPanelWidth              : '32%',
        rightPanelWidth             : '68%',
        rightPanelSmallerLeftMargin : '245',
        rightPanelLargerLeftMargin  : '515',
        editTaskPagePrefix          : 'edit-task',
        metaByPagePrefix            : 'meta-by',
        taskByPagePrefix            : 'task-by',
        editMetaPagePrefix          : 'edit-meta',
        createMetaPagePrefix        : 'create-meta',
        detailListElementId         : 'detail-list',
        detailListPanelElementId    : 'detail',
        msgForNoTask                : '<div class="msg-for-no-task">Wow, great, all tasks are done, go and stay with your family or friends.</div>',
        msgForSuccessfulTaskUpdate  : 'Task successfully updated',
        msgForTaskStatusUpdatePref  : 'Task marked as ',
        msgForTaskMovePref          : 'Task moved to list ',
        msgForTaskMoveToTrash       : 'Task moved to trash',
        msgForTrashBoxClean         : 'Trash Box Cleaned',
        msgForTaskRestore           : 'Task Restored from Tash Box',
        msgUndo                     : 'Undo',
        paramMetaTypeName           : 'metaTypeName',
        paramMetaTypeId             : 'metaTypeId',
        paramMetaName               : 'metaName',
        paramMetaId                 : 'metaId',
        paramTaskId                 : 'taskId',
        paramToastMsg               : 'toastMsg',
        screenIdField               : 'fields',
        taskContextMenu : [
            'mark_task_as_done',
            'postpone_task',
            'edit_task',
            'move_task_to_next_action',
            'move_task_to_basket',
            'move_task_to_someday',
            'mark_task_as_new',
            'move_task_to_trash'
        ],
        metaContextMenu : [
            'edit_meta',
            'delete_meta'
        ],
        trashBoxContextMenu : [
            'restore_task',
            'empty_trash'
        ],
        nothing : function () {}
    };

}());

var AppConfig = (function () {
    "use strict";
    return {
        debugMode : true
    };
}());

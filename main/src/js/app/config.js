/*jslint browser: true es5: true*/
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
        msgForTaskStatusRestore     : 'Task Status Reverted to ',
        msgUndo                     : 'Undo',
        msgTaskContextMenuTitle     : 'Task',
        paramMetaTypeName           : 'metaTypeName',
        paramMetaTypeId             : 'metaTypeId',
        paramMetaName               : 'metaName',
        paramMetaId                 : 'metaId',
        paramTaskId                 : 'taskId',
        paramToastMsg               : 'toastMsg',
        screenIdField               : 'fields',
        singleDisplayMode           : 'single',
        masterDetailDisplayMode     : 'masterDetail',
        taskContextMenu : [
            'view_task',
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

var UIFragments = (function () {
    "use strict";
    return {
        singleTaskList       : '<div data-bb-images="none" data-bb-type="image-list" id="detail-list"> </div>',
        masterDetailTaskList : '\
        <div id="group">\
            <div id="group-title"\
                onclick="Util.switchPanelWidth(UIConfig.rightPanelWidth, UIConfig.leftPanelWidth, UIConfig.rightPanelLargerLeftMargin);">\
                <span id="group-title-text"></span>\
                <span id="group-title-add-new-link" onclick="bb.pushScreen(\'edit-meta.html\', UIConfig.createMetaPagePrefix , {\'metaTypeId\' : Util.valueOf(\'v_meta_type_id\')})"></span>\
            </div>\
            <div data-bb-type="scroll-panel" id="group-list-panel">\
                <div id="group-list" data-bb-type="image-list" data-bb-images="none" ></div>\
                <div id="group-space" onclick="Util.switchPanelWidth(UIConfig.rightPanelWidth, UIConfig.leftPanelWidth, UIConfig.rightPanelLargerLeftMargin);"></div>\
            </div>\
        </div>\
        <div id="detail" onclick="Util.switchPanelWidth(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin)">\
            <div id="detail-title">\
                <span id="detail-title-text"></span>\
                <span id="detail-add-new-link" onclick="bb.pushScreen(\'edit-meta.html\', UIConfig.createMetaPagePrefix, {\'metaTypeId\' : Util.valueOf(\'v_meta_type_id\')})"></span>\
            </div>\
            <div data-bb-type="scroll-panel" id="detail-list-panel">\
                <div data-bb-images="none" data-bb-type="image-list" id="detail-list" data-bb-image-effect="fade">\
                </div>\
            </div>\
        </div>'
    };
}());

var AppConfig = (function () {
    "use strict";
    return {
        debugMode : false
    };
}());

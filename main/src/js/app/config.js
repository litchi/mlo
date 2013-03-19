/*jslint browser: true es5: true*/
var UIConfig = (function () {
    "use strict";
    return {
        emptyString                 : '',
        leftPanelWidth              : '205',
        rightPanelWidth             : '563',
        rightPanelSmallerLeftMargin : '205',
        rightPanelLargerLeftMargin  : '555',
        editTaskPagePrefix          : 'edit-task',
        metaByPagePrefix            : 'meta-by',
        taskByPagePrefix            : 'task-by',
        editMetaPagePrefix          : 'edit-meta',
        createMetaPagePrefix        : 'create-meta',
        detailListElementId         : 'detail-list',
        detailListPanelElementId    : 'detail',
        viewTaskDetailElementId     : 'view-task-detail',
        viewTaskTitleElementId      : 'view-task-detail-title',
        viewTaskProjectElementId    : 'view-task-detail-project',
        viewTaskDueElementId        : 'view-task-detail-due',
        viewTaskContextElementId    : 'view-task-detail-context',
        viewTaskNotesElementId      : 'view-task-detail-notes',
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
        masterDetailTaskList : '<div id="group">' +
                '<div data-bb-type="scroll-panel" id="group-list-panel">' +
                    '<div id="group-list" data-bb-type="image-list" data-bb-images="none" ></div>' +
                '</div>' +
                '<div id="group-space" onclick="Util.togglePanelWidth();"></div>' +
            '</div>' +
            '<div id="create-task-shortcut">' +
                '<img id="create-task-shortcut-add" src="resources/image/bullet_add.png" onclick="Util.toggleCreateTaskShortcutDisplay();"/>' +
                '<img id="create-task-shortcut-search" src="resources/image/search.png" onclick="Util.toggleSearchTaskTaskShortcutDisplay();"/>' +
            '</div>' +
            '<div id="detail" onclick="Util.expandDetailPanel(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin)">' +
                '<div id="search-result-title"></div>' +
                '<div data-bb-type="scroll-panel" id="detail-list-panel">' +
                    '<div data-bb-images="none" data-bb-type="image-list" id="detail-list" data-bb-image-effect="fade">' +
                    '</div>' +
                '</div>' +
            '</div>',
    };
}());

var AppConfig = (function () {
    "use strict";
    return {
        debugMode : false
    };
}());

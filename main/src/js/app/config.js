/*jslint browser: true es5: true*/
/*global moment */
var UIConfig = (function () {
    "use strict";
    return {
        notificationPrefix          : 'cc.mindlikewater.',
        openTaskDetailTarget        : 'cc.mindlikewater.invoke.open.task.detail',
        openTaskDetailAction        : 'bb.action.OPEN',
        notificationTitle           : 'Task Due Reminder',
        emptyString                 : '',
        OKString                    : 'OK',
        leftPanelWidth              : '205',
        rightPanelWidth             : '563',
        rightPanelSmallerLeftMargin : '205',
        rightPanelLargerLeftMargin  : '555',
        editTaskPagePrefix          : 'edit-task',
        metaByPagePrefix            : 'meta-by',
        taskByPagePrefix            : 'task-by',
        editMetaPagePrefix          : 'edit-meta',
        taskWithOperPagePrefix      : 'task-detail-with-oper',
        createMetaPagePrefix        : 'create-meta',
        detailListElementId         : 'detail-list',
        actionBarElementId          : 'action-bar',
        detailListPanelElementId    : 'detail',
        viewTaskDetailElementId     : 'view-task-detail',
        viewTaskTitleElementId      : 'view-task-detail-title',
        viewTaskProjectElementId    : 'view-task-detail-project',
        viewTaskDueElementId        : 'view-task-detail-due',
        viewTaskContextElementId    : 'view-task-detail-context',
        viewTaskNotesElementId      : 'view-task-detail-notes',
        msgForNoTask                : '<div class="msg-for-no-task">Wow, great, all tasks are done, you can take a break now.</div>',
	msgForMetaListDefaultPage   : '<div class="msg-for-default-meta-list">Please select project or context on the left to edit them.</div>',
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
        paramTaskInfo               : 'taskInfo',
        paramToastMsg               : 'toastMsg',
        paramActionbarId            : 'actionbarId',
        screenIdField               : 'fields',
        singleDisplayMode           : 'single',
        masterDetailDisplayMode     : 'masterDetail',
        noProjectDisplayOption      : 'No Project',
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
        trashBoxContextMenu : [
            'restore_task',
            'empty_trash'
        ],
        smiles : [':-)', ':o)', ':c)', ':^)', ':>'],
	leftArrow : "<div class='group_space_icon_left'>&nbsp; </div>",
	rightArrow : "<div class='group_space_icon_right'>&nbsp; </div>",
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
                '<div id="create-task-shortcut-add" onclick="Util.toggleCreateTaskShortcutDisplay();"/>CREATE TASK</div>' +
                '<div id="create-task-shortcut-search" onclick="Util.toggleSearchTaskTaskShortcutDisplay();"/>SEARCH TASK</div>' +
            '</div>' +
            '<div id="detail" onclick="Util.expandDetailPanel(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin)">' +
                '<div id="search-result-title"></div>' +
                '<div data-bb-type="scroll-panel" id="detail-list-panel">' +
                    '<div data-bb-images="none" data-bb-type="image-list" id="detail-list" data-bb-image-effect="fade">' +
                    '</div>' +
                '</div>' +
            '</div>'
    };
}());

var AppConfig = (function () {
    "use strict";
    return {
        debugMode : true
    };
}());

moment.lang('en', {
    calendar : {
        lastDay : '[Yday at] LT',
        sameDay : '[Today at] LT',
        nextDay : '[Tmr at] LT',
        lastWeek : '[last] dddd [at] LT',
        nextWeek : 'dddd [at] LT',
        sameElse : 'L'
    },
    weekdays : [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
    ]
});

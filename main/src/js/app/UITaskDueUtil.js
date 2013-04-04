/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController*/
var UITaskDueUtil = (function () {
    "use strict";
    return {
        prepareDueData : function (tx, taskId, dueDate) {
            var dateStr;
            if (null !== dueDate) {
                dateStr = Util.getFullDateTimeStr(new Date(dueDate * 1000));
                Util.setValue('due-date', dateStr);
            } else {
                Util.setValue('due-date', null);
            }
        },

        saveDueInfo : function (tx, taskId, dueDate) {
            var dueToSave = null,
                myDate = Util.timeToDateWithZone(new Date(dueDate).getTime() / 1000);
            if (Util.notEmpty(dueDate)) {
                dueToSave = myDate.getTime() / 1000;
            }
            DataAccess.runSqlDirectly(tx, "update task set due_date = ? where id = ?", [dueToSave, taskId]);
        }
    };
}());

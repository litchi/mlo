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

        saveDueInfo : function (tx, taskId) {
            var dueDate = Util.valueOf('due-date'),
                dueToSave = null,
                myDate = Util.timeToDateWithZone(new Date(dueDate).getTime() / 1000);
            if (Util.notEmpty(dueDate)) {
                dueToSave = myDate.getTime() / 1000;
            } else {
                DataAccess.runSqlDirectly(tx, "update task set reminder_date = ? where id = ?", [null, taskId]);
            }
            DataAccess.runSqlDirectly(tx, "update task set due_date = ? where id = ?", [dueToSave, taskId]);
        }
    };
}());

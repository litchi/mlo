/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController*/
var UITaskDueUtil = (function () {
    "use strict";
    return {
        prepareDueData : function (taskId, due) {
            var dateStr;
            if (null !== due) {
                dateStr = Util.getFullDateTimeStr(new Date(due * 1000));
                Util.setValue('due-date', dateStr);
            }
        },

        saveDueInfo : function (tx, taskId) {
            var dueDate = Util.valueOf('due-date'),
                myDate = Util.timeToDateWithZone(new Date(dueDate).getTime() / 1000);
            if (Util.notEmpty(dueDate)) {
                DataAccess.runSqlDirectly(tx,
                    //FIXME Should also save the reminder date into database.
                    "update task set due_date = ? where id = ?", [myDate.getTime() / 1000, taskId],
                    function (tx, result, objs) {
                    });
            }
        }
    };
}());

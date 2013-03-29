/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UITaskReminderUtil*/
var UITaskProjectUtil = (function () {
    "use strict";
    return {
        prepareProjectData : function () {
            var projectSelect = document.createElement('select'), i, max, obj;
            projectSelect.setAttribute('id', SeedData.ProjectMetaTypeName);
            projectSelect.setAttribute('data-bb-label', '');
            Util.appendOption(projectSelect, 0, 'No Project');
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(
                    tx,
                    "select meta_id, meta_name from meta_view where meta_type_name = ?",
                    [SeedData.ProjectMetaTypeName],
                    function (tx, result, objs) {
                        if (undefined !== projectSelect && null !== result.rows && result.rows.length > 0) {
                            for (i = 0, max = result.rows.length; i < max; i += 1) {
                                obj = result.rows.item(i);
                                if (null !== obj) {
                                    Util.appendOption(projectSelect, obj.meta_id, obj.meta_name);
                                }
                            }
                        }
                        projectSelect = bb.dropdown.style(projectSelect);
                        document.getElementById('projectContainer').appendChild(projectSelect);
                    }
                );
            });
        },

        setDefaultProjectForTask : function (taskId) {
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(
                    tx,
                    "select distinct meta_name from task_view where task_id = ? and meta_type_name = ?",
                    [taskId, SeedData.ProjectMetaTypeName],
                    function (tx, result, objs) {
                        if (null !== result && null !== result.rows && result.rows.length > 0 &&
                                null !== result.rows && null !== result.rows.item && null !== result.rows.item(0) &&
                                null !== result.rows.item(0).meta_name) {
                            document.getElementById(SeedData.ProjectMetaTypeName).setSelectedText(result.rows.item(0).meta_name);
                        }
                    }
                );
            });
        },

        saveProjectInfo : function (tx, taskId, projectId) {
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ProjectMetaTypeName]);
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, [taskId, projectId]);
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteTaskFromList, [taskId, SeedData.BasketMetaName, SeedData.GtdMetaTypeName]);
        }

    };
}());

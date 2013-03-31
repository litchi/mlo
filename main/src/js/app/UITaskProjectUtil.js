/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UITaskReminderUtil, $, JQuery*/
var UITaskProjectUtil = (function () {
    "use strict";
    return {
        prepareProjectData : function (tx, taskId, currentProj, allProjects) {
            var i, max, obj, projectSelect = document.createElement('select');
            currentProj = (Util.isEmpty(currentProj)) ? UIConfig.noProjectDisplayOption : currentProj;
            projectSelect.setAttribute('id', SeedData.ProjectMetaTypeName);
            projectSelect.setAttribute('data-bb-label', '');
            Util.appendOption(projectSelect, 0, UIConfig.noProjectDisplayOption);
            if (Util.notEmpty(allProjects) && allProjects.length > 0) {
                max = allProjects.length;
                for (i = 0; i < max; i += 1) {
                    obj = allProjects[i];
                    if (Util.notEmpty(obj)) {
                        Util.appendOption(projectSelect, obj.meta_id, obj.meta_name);
                    }
                }
            }
            projectSelect = bb.dropdown.style(projectSelect);
            document.getElementById('projectContainer').appendChild(projectSelect);
            bb.refresh();
            document.getElementById(SeedData.ProjectMetaTypeName).setSelectedText(currentProj);
        },

        saveProjectInfo : function (tx, taskId, projectId) {
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ProjectMetaTypeName]);
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, [taskId, projectId]);
            DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteTaskFromList, [taskId, SeedData.BasketMetaName, SeedData.GtdMetaTypeName]);
        }

    };
}());

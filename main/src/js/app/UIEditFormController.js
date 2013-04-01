/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController, UIActionBarController, UITaskReminderUtil, UITaskContextUtil, UITaskProjectUtil, UITaskDueUtil, UITaskUtil, $, JQuery*/
var UIEditFormController = (function () {
    "use strict";

    return {
        cancelTaskEdit : function () {
            Util.refreshCurrentPage(null);
        },

        cancelMetaEdit : function () {
            var metaTypeId = Util.valueOf('meta_type_id');
            bb.pushScreen('task-list.html', UIConfig.metaByPagePrefix, {
                'metaTypeId'   : metaTypeId,
                'actionbarId'  : UIConfig.screenIdField
            });
        },

        saveMeta : function (id, name, meta_type_id, description) {
            var placeholder, metaTypeName = Util.valueOf('meta_type_name');
            if (UIConfig.emptyString === name) {
                if (SeedData.ProjectMetaTypeName === Util.valueOf('meta_type_name')) {
                    placeholder = 'Please fill in project name';
                } else if (SeedData.ContextMetaTypeName === Util.valueOf('meta_type_name')) {
                    placeholder = 'Please fill in context name';
                }
                document.getElementById('meta_name').setAttribute('placeholder', placeholder);
            } else {
                DataAccess.appDb.transaction(function (tx) {
                    DataAccess.runSqlDirectly(tx,
                        Sql.Meta.SelectByNameTypeId,
                        [meta_type_id, name],
                        function (tx, result, objs) {
                            if ((1 === result.rows.length) && (result.rows.item(0).id.toString() !== id)) {
                                document.getElementById('error-msg').innerText = metaTypeName + ' name "' + name + '" has already been taken, please use another one';
                                document.getElementById('error-panel').style.display = 'block';
                            } else {
                                if (id !== null && id !== undefined && id !== UIConfig.emptyString) {
                                    DataAccess.meta.update(id, name, description, function (tx, result, rows) {
                                        bb.pushScreen('task-list.html', UIConfig.metaByPagePrefix, {
                                            'metaTypeId'  : meta_type_id,
                                            'actionbarId' : UIConfig.screenIdField,
                                            'toastMsg'    : metaTypeName + " " + name + " updated"
                                        });
                                    }, function (tx, error) {
                                        log.logSqlError("Failed to update meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
                                    });
                                } else {
                                    DataAccess.meta.create(name, meta_type_id, description, function (tx, result, rows) {
                                        bb.pushScreen('task-list.html', UIConfig.metaByPagePrefix, {
                                            'metaTypeId'  : meta_type_id,
                                            'actionbarId' : UIConfig.screenIdField,
                                            'toastMsg'    : metaTypeName + " " + name + " created"
                                        });
                                    }, function (tx, error) {
                                        log.logSqlError("Failed to create meta[" + id + "][" + name + "][" + meta_type_id + "][" + description + "]", error);
                                    });
                                }
                            }
                        });
                });
            }
        },

        updateTask : function (id, name, projectId) {
            if (UIConfig.emptyString === name) {
                document.getElementById('task-name').setAttribute('placeholder', 'Please fill in task name');
                return;
            }
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, Sql.Task.UpdateById, [name, id]);
                UITaskDueUtil.saveDueInfo(tx, id);
                UITaskReminderUtil.saveReminderInfo(tx, id);
                //FIXME If project id is zero, then we should delete the task-project link in task_meta table.
                if (projectId !== '0') {
                    UITaskProjectUtil.saveProjectInfo(tx, id, projectId);
                }
                UITaskContextUtil.saveContextPopScreen(tx, id);
            }, function (error) {
                log.logSqlError("Failed to update task[" + id + "][Name: " + name + "][projectId: " + projectId + "]", error);
            });
        },

        //TODO Write docs for all the public methods.
        fillTaskToEditForm : function (taskInfo, params) {
            var obj, option, due,
                taskId           = taskInfo.id,
                taskName         = taskInfo.name,
                taskProject      = taskInfo.project,
                taskContexts     = taskInfo.contexts,
                dueDate          = taskInfo.dueDate,
                reminderMetaName = taskInfo.reminderMetaName;
            //This transaction is created here to make all the methods 
            //share the same transaction for performance consideration
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx,
                    "select meta_id, meta_name from meta_view where meta_type_name = ?",
                    [SeedData.ProjectMetaTypeName],
                    function (tx, result, allProjects) {
                        UITaskUtil.setTaskNameTextarea(taskId, taskName);
                        UITaskProjectUtil.prepareProjectData(tx, taskId, taskProject, allProjects);
                        UITaskDueUtil.prepareDueData(tx, taskId, dueDate);
                        UITaskContextUtil.prepareContextData(tx, taskId, taskContexts);
                        UITaskReminderUtil.prepareReminderData(tx, taskId, reminderMetaName, dueDate);
                        Util.setCommonMetaFieldsOnPage(params);
                        Util.setValue('task-id', taskId);
                        $('#due-date').parent().append(Util.getClearDateTimeInputIcon());
                        $('#due-date').parent().blur(function () {
                            UITaskReminderUtil.switchReminderPanelDisplay(this.value);
                        });
                        bb.refresh();
                    });
            });
        },

        fillMetaToEditForm : function (id) {
            if (id !== null && id !== undefined) {
                DataAccess.meta.getById(id, function (tx, results, arrays) {
                    log.logObjectData("Meta", arrays[0], DataAccess.logQueryResult);
                    Util.setValue(Sql.Meta.Cols.Id, arrays[0][Sql.Meta.Cols.Id]);
                    Util.setValue('meta_name', arrays[0][Sql.Meta.Cols.Name]);
                    Util.setValue(Sql.Meta.Cols.Description, arrays[0][Sql.Meta.Cols.Description]);
                    DataAccess.metaType.getById(arrays[0][Sql.Meta.Cols.MetaTypeId], function (tx, result, objs) {
                        var metaTypeName = objs[0][Sql.MetaType.Cols.Name], metaTypeId = objs[0][Sql.MetaType.Cols.Id];
                        Util.setMetaDetailPageCaption('Edit ' + metaTypeName);
                        Util.setValue('meta_type_id', metaTypeId);
                        Util.setValue('meta_type_name', metaTypeName);
                    });
                }, function (tx, error) {
                    log.logSqlError("Error getting meta with id[" + id + "]", error);
                });
            }
        }
    };
}());

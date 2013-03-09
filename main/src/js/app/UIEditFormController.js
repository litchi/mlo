/*jslint browser: true */
/*global Util, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIEditFormController*/
var UIEditFormController = (function () {
    "use strict";
    var selectedContextIds = {};

    function prepareProjectData() {
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
    }

    function prepareDueData(reminderOn, due) {
        var dateStr, reminderOnInput = document.getElementById('is-reminder-on');
        if (undefined !== reminderOnInput) {
            reminderOnInput.setChecked((1 === reminderOn));
        }
        if (null !== due) {
            dateStr = Util.getFullDateTimeStr(new Date(due * 1000));
            Util.setValue('due-date', dateStr);
        }
    }

    function setDefaultProjectForTask(taskId) {
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
    }

    function genContextDeleteIconId(metaId) {
        return metaId + "_img";
    }

    function createContextDeleteIcon(metaId) {
        var icon = document.createElement('img');
        icon.setAttribute('id', genContextDeleteIconId(metaId));
        icon.setAttribute('class', 'deleteIcon');
        icon.setAttribute('src', './resources/image/remove-context.png');
        return icon;
    }

    function createContextSpan(container, tempDiv, taskId, metaId, metaName, callback) {
        var span, count, icon;
        DataAccess.appDb.transaction(function (tx) {
            DataAccess.runSqlDirectly(
                tx,
                'select count(*) as c from task_view where task_id = ? and meta_id = ?',
                [taskId, metaId],
                function (tx, result, objs) {
                    if (null !== result && null !== result.rows && null !== result.rows.item) {
                        span = document.createElement('span');
                        span.setAttribute('id', metaId);
                        count = result.rows.item(0).c;
                        if (count >= 1) {
                            span.setAttribute('class', 'selectedContext');
                            span.setAttribute('onclick', 'UIEditFormController.unSelectContext("' + metaId + '", "' + metaName + '")');
                            selectedContextIds[metaId] = metaName;
                            icon = createContextDeleteIcon(metaId);
                        } else {
                            span.setAttribute('class', 'context');
                            span.setAttribute('onclick', 'UIEditFormController.selectContext("' + metaId + '", "' + metaName + '")');
                        }
                        span.innerText = metaName;
                        if (Util.notEmpty(icon)) {
                            span.appendChild(icon);
                        }
                        tempDiv.appendChild(span);
                        if (Util.isFunction(callback)) {
                            callback(container, tempDiv);
                        }
                    }
                }
            );
        });
    }

    function showContextContainer(contextContainer, tempDiv) {
        contextContainer.innerHTML = tempDiv.innerHTML;
        contextContainer.style.display = 'block';
    }

    function prepareContextData(taskId) {
        var contextContainer = document.getElementById('contextContainer'), i, max, tempDiv = document.createElement('div');
        contextContainer.style.display = 'none';
        DataAccess.appDb.transaction(function (tx) {
            DataAccess.runSqlDirectly(
                tx,
                'select meta_id, meta_name from meta_view where meta_type_name = ?',
                [SeedData.ContextMetaTypeName],
                function (tx, result, obj) {
                    if (null !== result && null !== result.rows && null !== result.rows.item) {
                        for (i = 0, max = result.rows.length; i < max; i += 1) {
                            if (i === max - 1) {
                                createContextSpan(contextContainer, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name);
                            } else {
                                createContextSpan(contextContainer, tempDiv, taskId, result.rows.item(i).meta_id, result.rows.item(i).meta_name, showContextContainer);
                            }
                        }
                    }
                }
            );
        });
    }

    function saveContextToDb(tx, taskId) {
        var id, val, data;
        for (id in selectedContextIds) {
            if (selectedContextIds.hasOwnProperty(id)) {
                val = selectedContextIds[id];
                data = [taskId, id];
                log.logSqlStatement(Sql.TaskMeta.Insert, data, DataAccess.logQuerySql);
                DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, data);
            }
        }
    }

    function saveContextPopScreen(tx, taskId) {
        DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ContextMetaTypeName]);
        saveContextToDb(tx, taskId);
        Util.refreshCurrentPage(UIConfig.msgForSuccessfulTaskUpdate);
    }

    function setReminder(taskId, reminderTime) {
        var currTime = new Date().getTime(), reminderAfter;
        if (reminderTime > currTime) {
            reminderAfter = reminderTime - currTime;
            console.log("Reminder after: " + reminderAfter);
        }
    }

    function saveDueInfo(tx, taskId) {
        var reminderOn = document.getElementById('is-reminder-on').getChecked(),
            dueDate = Util.valueOf('due-date'),
            reminderOnInt = (reminderOn === true) ? 1 : 0,
            myDate = Util.timeToDateWithZone(new Date(dueDate).getTime() / 1000);
        DataAccess.runSqlDirectly(tx,
            "update task set due_date = ?, reminder_on = ? where id = ?", [myDate.getTime() / 1000, reminderOnInt, taskId],
            function (tx, result, objs) {
                if (reminderOn) {
                    setReminder(taskId, dueDate);
                }
            });
    }

    function saveProjectInfo(tx, taskId, projectId) {
        DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteByMetaTypeName, [taskId, SeedData.ProjectMetaTypeName]);
        DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, [taskId, projectId]);
        DataAccess.runSqlDirectly(tx, Sql.TaskMeta.DeleteTaskFromList, [taskId, SeedData.BasketMetaName, SeedData.GtdMetaTypeName]);
    }

    function setTaskNameTextarea(id, taskName) {
        var elem;
        if (Util.notEmpty(taskName)) {
            elem = document.getElementById('task-name');
            elem.setAttribute('cols', '28');
            elem.innerHTML = taskName;
            Util.resizeTextarea(elem, 27);
            //This behaivor is very annoying so comment out at this moment.
            //elem.focus();
            //Util.moveCaretToEnd(elem);
        } else {
            console.warn('Task Name for [%s] is [%s](empty ?)', id, taskName);
        }
    }

    return {

        updateTask : function (id, name, projectId) {
            if (UIConfig.emptyString === name) {
                document.getElementById('task-name').setAttribute('placeholder', 'Please fill in task name');
                return;
            }
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, Sql.Task.UpdateById, [name, id]);
                saveDueInfo(tx, id);
                if (projectId !== '0') {
                    saveProjectInfo(tx, id, projectId);
                }
                saveContextPopScreen(tx, id);
            }, function (error) {
                log.logSqlError("Failed to update task[" + id + "][Name: " + name + "][projectId: " + projectId + "]", error);
            });
        },

        selectContext : function (metaId, metaName) {
            var icon = document.getElementById(genContextDeleteIconId(metaId)),
                span = document.getElementById(metaId);
            selectedContextIds[metaId] = metaName;
            span.setAttribute('class', 'selectedContext');
            span.setAttribute('onclick', 'UIEditFormController.unSelectContext("' + metaId + '", "' + metaName + '")');
            if (Util.isEmpty(icon)) {
                icon = createContextDeleteIcon(metaId);
            } else {
                icon.style.display = 'inline-block';
            }
            span.appendChild(icon);
        },

        unSelectContext : function (metaId, metaName) {
            var icon = document.getElementById(genContextDeleteIconId(metaId)),
                span = document.getElementById(metaId);
            delete selectedContextIds[metaId];
            if (Util.notEmpty(icon)) {
                icon.style.display = 'none';
            }
            span.setAttribute('class', 'context');
            span.setAttribute('onclick', 'UIEditFormController.selectContext("' + metaId + '", "' + metaName + '")');
        },

        fillTaskToEditForm : function (id, params) {
            var obj, option, reminderOn, due;
            DataAccess.task.getById(id, function (tx, result, arrays) {
                var taskName = arrays[0][Sql.Task.Cols.Name];
                setTaskNameTextarea(id, taskName);
                prepareProjectData();
                setDefaultProjectForTask(id);
                reminderOn = arrays[0][Sql.Task.Cols.ReminderOn];
                due = arrays[0][Sql.Task.Cols.DueDate];
                prepareDueData(reminderOn, due);
                prepareContextData(id);
                Util.setCommonMetaFieldsOnPage(params);
                Util.setValue('task-id', id);
                bb.refresh();
            }, function (tx, error) {
                log.logSqlError("Error filling task[" + id + "] to edit form", error);
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

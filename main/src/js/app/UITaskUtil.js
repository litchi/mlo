/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util, $, jQuery, UIListController, UIMetaUtil*/
var UITaskUtil = (function () {
    "use strict";

    function createSearchMetaElement(keyword) {
        var item = document.createElement('div');
        item.setAttribute('data-bb-type', 'item');
        item.setAttribute('data-bb-style', 'stretch');
        item.setAttribute('title', '<span class="default-master-detail master-title">' + keyword + '</span>');
        item.setAttribute('data-bb-title',  '<span class="default-master-detail master-title">' + keyword + '</span>');
        item.setAttribute('id', keyword);
        item.setAttribute(
            'onclick',
            "UIListController.fillSearchResultAndMarkGroup('" + keyword + "');"
        );
        return item;
    }

    function createTaskInternal(name, metaId, toBasket) {
        var taskList = document.getElementById(UIConfig.detailListElementId),
            metaTypeNameLabel = 'list',
            metaNameActual = UIConfig.emptyString,
            taskId,
            metaTypeName,
            metaName,
            project = null,
            context = null;
        DataAccess.appDb.transaction(function (tx) {
            DataAccess.runSqlDirectly(tx, Sql.Task.InsertByName, [name],
                function (tx, result, objs) {
                    taskId = result.insertId;
                    DataAccess.runSqlDirectly(tx, Sql.TaskMeta.Insert, [taskId, metaId],
                        function (tx, r2, objs2) {
                            metaTypeName = Util.valueOf('v_meta_type_name');
                            metaName = Util.valueOf('v_meta_name');
                            if (Util.notEmpty(metaName)) {
                                if (metaTypeName === SeedData.ProjectMetaTypeName) {
                                    project = metaName;
                                    metaTypeNameLabel = 'project';
                                } else if (metaTypeName === SeedData.ContextMetaTypeName) {
                                    context = [metaName];
                                    metaTypeNameLabel = 'context';
                                }
                            }
                            if ((metaTypeName === SeedData.GtdMetaTypeName || metaName !== SeedData.BasketMetaName) && (metaTypeName !== SeedData.DueMetaTypeName)) {
                                UIListController.addTaskToList(taskList, taskId, name, project, context, null);
                                metaNameActual = metaName;
                            } else {
                                metaNameActual = SeedData.BasketMetaName;
                            }
                            Util.setValue('ctsi', UIConfig.emptyString);
                            Util.showToast('Task created to ' + metaTypeNameLabel + ' ' + metaNameActual, 'Undo', null, function () {
                                DataAccess.task.updateStatus(taskId, SeedData.TaskDeletedStatus,
                                    function (tx, result, rows) {
                                        UIListController.removeTaskFromList(taskId);
                                        Util.showToast("Undo task creation successfully");
                                    }, function (tx, error) {
                                        log.logSqlError("Failed to delete task[" + taskId + "]", error);
                                    });
                            });
                        });
                });
        }, function (tx, e1) {
            log.logSqlError("Failed creating task[" + name + "]", e1);
        });
    }

    function setFieldInTaskDetailPopup(value, element, mode) {
        if (Util.notEmpty(value)) {
            if (mode === 'html') {
                element.innerHTML = value;
            } else {
                element.innerText = value;
            }
            element.className = 'view-task-detail-sub-field';
            element.style.display = 'block';
        } else {
            element.className = '';
            element.style.display = 'none';
        }
    }

    return {

        decorateTaskNumber : function (list, key) {
            var taskNumber = 0;
            if (Util.notEmpty(list) && list.hasOwnProperty(key)) {
                taskNumber = list[key];
            }
            if (Util.isEmpty(taskNumber) || (0 === taskNumber)) {
                return '<span class="list-task-number-zero">:-)</span>';
            }
            return '<span class="list-task-number">' + taskNumber + '</span>';
        },

        getTaskNumberOfMetaType : function (metaTypeName, callback) {
            var result = 0, key, metaName, sql, params;
            if (SeedData.DueMetaTypeName === metaTypeName) {
                sql = "select count(distinct(task_id)) as task_number from task_view where task_due_date is not null and task_status != ? and task_status != ?";
                params = [SeedData.TaskDeletedStatus, SeedData.TaskDoneStatus];
            } else {
                sql = "select count(distinct(task_id)) as task_number from task_view where meta_type_name = ? and task_status != ? and task_status != ?";
                params = [metaTypeName, SeedData.TaskDeletedStatus, SeedData.TaskDoneStatus];
            }
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, sql, params, function (tx, resultset, objs) {
                    var key;
                    for (key in objs) {
                        if (objs.hasOwnProperty(key)) {
                            result = objs[key].task_number;
                        }
                    }
                    if (Util.isFunction(callback)) {
                        callback(result);
                    }
                });
            }, function (tx, error) {
                log.logSqlError("Error getting number of tasks", error);
            });
        },

        getGroupedTaskNumber : function (metaTypeName, callback) {
            var result = [], num, key, metaName, sql, params;
            if (SeedData.DueMetaTypeName === metaTypeName) {
                sql =  "select" +
                    "(select count(distinct(id)) from task as Today where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now') and status != 'Done' and status != 'Deleted') as 'Today'," +
                    "(select count(distinct(id)) from task as Tomorrow where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','+1 day') and status != 'Done' and status != 'Deleted') as 'Tomorrow'," +
                    "(select count(distinct(id)) from task as 'This Week' where strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now') and status != 'Done' and status != 'Deleted') as 'This Week'," +
                    "(select count(distinct(id)) from task as 'Next Week' where strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now', '+7 days') and status != 'Done' and status != 'Deleted') as 'Next Week'," +
                    "(select count(distinct(id)) from task as 'Done Yesterday' where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status = 'Done') as 'Done Yesterday'," +
                    "(select count(distinct(id)) from task as 'Overdue Yesterday' where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status != 'Done' and status != 'Deleted') as 'Overdue Yesterday'," +
                    "(select count(distinct(id)) from task as 'Overdue' where strftime('%Y-%m-%d %H:%M:%S', due_date, 'unixepoch') < datetime('now') and status != 'Done' and status != 'Deleted') as 'Overdue'";
                params = [];
            } else {
                sql = "select count(distinct(task_id)) as task_number, meta_name from task_view where meta_type_name = ? and task_status != ? and task_status != ? group by meta_name";
                params = [metaTypeName, SeedData.TaskDeletedStatus, SeedData.TaskDoneStatus];
            }
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, sql, params, function (tx, resultset, objs) {
                    var key, i, max, obj;
                    if (SeedData.DueMetaTypeName !== metaTypeName) {
                        for (key in objs) {
                            if (objs.hasOwnProperty(key)) {
                                num = objs[key].task_number;
                                metaName = objs[key].meta_name;
                                result[metaName] = num;
                            }
                        }
                    } else {
                        for (i = 0, max = resultset.rows.length; i < max; i += 1) {
                            result = resultset.rows.item(i);
                        }
                    }
                    if (Util.isFunction(callback)) {
                        callback(result);
                    }
                });
            }, function (tx, error) {
                log.logSqlError("Error getting number of tasks", error);
            });
        },

        createTaskItemElement : function (id, name, project, contexts, dueDate, displayReminderIcon) {
            var innerContent = UIConfig.emptyString, item = document.createElement('div'),
                contextCount, i, dueClass, localDueDate, contextClass;
            item.setAttribute('data-bb-type', 'item');
            item.setAttribute('data-bb-style', 'stretch');
            if (id !== null) {
                item.setAttribute('id', 'task-' + id);
                if (name !== null) {
                    item.setAttribute('title', '<span class="detail-title">' + name + '</span>');
                    item.setAttribute('data-bb-title', '<span class="detail-title">' + name + '</span>');
                }
                if (project !== null) {
                    innerContent = "\n<span class='list-project'>p:" + project + "</span>";
                }
                if (contexts !== null && contexts.length > 0) {
                    contextCount = contexts.length;
                    for (i = 0; i < contextCount; i += 1) {
                        if (i === contextCount - 1) {
                            contextClass = 'list-context-last';
                        } else {
                            contextClass = 'list-context';
                        }
                        innerContent = innerContent + "\n<span class='" + contextClass + "'>" + contexts[i] + "</span>";
                    }
                }
                if (dueDate !== null) {
                    localDueDate = new Date(dueDate * 1000);
                    dueClass = (localDueDate.getTime() > new Date().getTime()) ? 'list-due' : 'list-overdue';
                    innerContent = innerContent + "\n<span class='" + dueClass + "'>" + Util.getPrettyDateStr(localDueDate) + "</span>";
                }
                if (displayReminderIcon === true) {
                    innerContent = Util.getReminderIconStr() + innerContent;
                }
                item.innerHTML = innerContent;
                item.onclick = function () {
                    var taskDetailHtml, container = document.getElementById(UIConfig.viewTaskDetailElementId);
                    document.getElementById('task-operation-context-menu').menu.peek({
                        title : UIConfig.msgTaskContextMenuTitle,
                        description : name,
                        //FIXME: Make this parameter pass all the fetched data and avoid querying from DB again
                        selected : id,
                        type : 'Task'
                    });
                    taskDetailHtml = UITaskUtil.createTaskDetailView(container, id, name, project, contexts, dueDate);
                };
            }
            return item;
        },

        //TODO Put project/contexts/dueDate to an array to avoid changing the method definition all the time.
        taskFromDbToUIFunc : function (id, name, taskIndex, taskCount, taskList, items) {
            return function (tx) {
                DataAccess.runSqlDirectly(
                    tx,
                    'select meta_name, meta_type_name, task_due_date from task_view where task_id = ?',
                    [id],
                    function (tx, result, objs) {
                        var metaCount, metaIndex, contexts = [], project = null, metaTypeName = null,
                            taskDueDate = null, obj, item, displayReminderIcon = false;
                        metaCount = result.rows.length;
                        for (metaIndex = 0; metaIndex < metaCount; metaIndex += 1) {
                            obj = result.rows.item(metaIndex);
                            metaTypeName = obj.meta_type_name;
                            //An array is used to store context since there might be more than one context assigned to one task
                            if (SeedData.ContextMetaTypeName === metaTypeName) {
                                contexts.push(obj.meta_name);
                            } else if (SeedData.ProjectMetaTypeName === metaTypeName) {
                                project = obj.meta_name;
                            } else if (SeedData.ReminderMetaTypeName === metaTypeName
                                    && obj.meta_name !== SeedData.OffMetaName) {
                                displayReminderIcon = true;
                            }
                            //Only get once task due date since it's the same for all the result set 
                            if (null === taskDueDate) {
                                taskDueDate = obj.task_due_date;
                            }
                        }
                        if (null === taskDueDate) {
                            DataAccess.runSqlDirectly(tx,
                                'select due_date from task where id = ?', [id],
                                function (tx, result, objs) {
                                    taskDueDate = result.rows.item(0).due_date;
                                    item = UITaskUtil.createTaskItemElement(id, name, project,
                                        contexts, taskDueDate, displayReminderIcon);
                                    items.push(item);
                                    if (taskIndex === taskCount - 1) {
                                        taskList.refresh(items);
                                    }
                                });
                        } else {
                            item = UITaskUtil.createTaskItemElement(id, name, project,
                                contexts, taskDueDate, displayReminderIcon);
                            items.push(item);
                            if (taskIndex === taskCount - 1) {
                                taskList.refresh(items);
                            }
                        }
                    }
                );
            };
        },

        tasksFromDbToUI : function (tasks, taskList, keyword) {
            var id, name, taskIndex, taskCount, items = [], loopFunc;
            taskList.innerHTML = UIConfig.emptyString;
            if (Util.notEmpty(keyword)) {
                Util.showSearchTitle(keyword);
            } else {
                Util.hideSearchTitle();
            }
            if (null === tasks || undefined === tasks || 0 === tasks.length) {
                taskList.innerHTML = UIConfig.msgForNoTask;
            } else {
                taskCount = tasks.length;
                for (taskIndex = 0; taskIndex < taskCount; taskIndex += 1) {
                    name = tasks[taskIndex][Sql.Task.Cols.Name];
                    id   = tasks[taskIndex][Sql.Task.Cols.Id];
                    loopFunc = UITaskUtil.taskFromDbToUIFunc(id, name, taskIndex, taskCount, taskList, items);
                    DataAccess.appDb.transaction(loopFunc);
                }
            }
        },

        setTaskDetailPanelDisplay : function (display, data) {
            var taskListContainer,
                container = document.getElementById(UIConfig.viewTaskDetailElementId);
            if ((Util.isEmpty(data) || (data.type === 'Task'))
                    && Util.notEmpty(container)
                    && container.style.display !== display) {
                container.style.display = display;
                $('#main-content-overlay').css('display', display);
            }
            if (display === 'block') {
                $('#create-task-input-container').css('display', 'none');
            }
        },

        createTaskDetailView : function (container, id, name, project, contexts, taskDueDate) {
            console.log("paramers: container = %s, id = %s, name = %s, project = %s, contexts = %s, taskDueDate = %s", container, id, name, project, contexts, taskDueDate);
            var contextCount, contextIndex, dueClass, localDueDate,
                comma = UIConfig.emptyString,
                metaContent = UIConfig.emptyString,
                contextContent = UIConfig.emptyString,
                dueContent = UIConfig.emptyString,
                titleDiv = document.getElementById(UIConfig.viewTaskTitleElementId),
                projectDiv = document.getElementById(UIConfig.viewTaskProjectElementId),
                dueDiv = document.getElementById(UIConfig.viewTaskDueElementId),
                contextDiv = document.getElementById(UIConfig.viewTaskContextElementId),
                notesDiv = document.getElementById(UIConfig.viewTaskNotesElementId),
                metaDiv = document.getElementById('view-task-detail-meta');
            setFieldInTaskDetailPopup(name, titleDiv);
            if (Util.notEmpty(project)) {
                metaContent = project + " project";
            }
            if (Util.notEmpty(taskDueDate)) {
                localDueDate = new Date(taskDueDate * 1000);
                dueClass = (localDueDate.getTime() > new Date().getTime()) ? 'task-detail-list-due' : 'task-detail-list-overdue';
                if (Util.notEmpty(metaContent)) {
                    comma = ",";
                }
                metaContent = metaContent + comma + " Due on <span class='" + dueClass + "'>" + Util.getPrettyDateStr(localDueDate) + "</span>";
            }
            if (contexts !== null) {
                contextCount = contexts.length;
                if (contextCount > 0) {
                    metaContent += '<div class="view-task-detail-meta-separator"></div>';
                    for (contextIndex = 0; contextIndex < contextCount; contextIndex += 1) {
                        metaContent = metaContent + "\n<span class='task-detail-list-context'>" + contexts[contextIndex] + "</span>";
                    }
                }
            }

            setFieldInTaskDetailPopup(metaContent, metaDiv, 'html');
        },

        createTask : function (name, metaTypeName, metaId) {
            var taskId, project = null, metaIdToDb, metaName, context = null;
            if (Util.isEmpty(metaId) || (metaTypeName === SeedData.DueMetaTypeName)) {
                DataAccess.appDb.transaction(function (tx) {
                    DataAccess.runSqlDirectly(tx,
                        'select id from meta where name = ?',
                        [SeedData.BasketMetaName],
                        function (tx, result, objs) {
                            if (1 === result.rows.length) {
                                createTaskInternal(name, result.rows.item(0).id, true);
                            } else {
                                console.warn("Meta with name[%s] was not found when trying to insert task to it", SeedData.BasketMetaName);
                            }
                        });
                });
            } else {
                createTaskInternal(name, metaId, false);
            }
            return false;
        },

        searchTask : function (keyword) {
            var sqlKeyword = Util.addLikeStrForKeyword(keyword),
                taskList = document.getElementById(UIConfig.detailListElementId),
                metaList = UIMetaUtil.getMetaListElement(UIConfig.taskByPagePrefix);
            Util.toggleSearchTaskTaskShortcutDisplay();

            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx,
                    "select distinct task_id as id, task_name as name, task_status as status from task_view where (task_name like ? or meta_name like ?) and status = ?",
                    [sqlKeyword, sqlKeyword, SeedData.TaskNewStatus],
                    function (tx, result, objs) {
                        log.logObjectData('search result', objs, DataAccess.logDebug);
                        //Switch the highlight of the action bar to GTD List
                        //Add a list to the meta list(below GTD lists), with name set as the keyword typed in the search input box.
                        //metaList.appendItem(createSearchMetaElement(keyword));
                        //Display the search result(task list) in the detail task list panel.
                        UITaskUtil.tasksFromDbToUI(objs, taskList, keyword);
                        //Display the search condition as the title of the list.
                        //Show search title div
                    });
            });

            Util.hideSearchTitle();
            return false;
        },

        setTaskNameTextarea : function (id, taskName) {
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
    };

}());

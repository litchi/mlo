/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util, $, jQuery, UIListController, UIMetaUtil, TaskModel, UITaskReminderUtil*/
var UITaskUtil = (function () {
    "use strict";

    function getGtdListTitleSpanClass(gtdList, titleSpanClass) {
        if (SeedData.BasketMetaName === gtdList) {
            titleSpanClass += ' title-basket';
        } else if (SeedData.NextActionMetaName === gtdList) {
            titleSpanClass += ' title-next-action';
        } else if (SeedData.SomedayMetaName === gtdList) {
            titleSpanClass += ' title-someday';
        }
        return titleSpanClass;
    }

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
                                UIListController.addTaskToList(taskList, taskId, name, metaName, project, context, null);
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
            } else if (mode === 'text') {
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
                return '<span class="list-task-number-zero">' + Util.getRandomSmailFace() + '</span>';
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
                    "(select count(distinct(id)) from task as Tomorrow where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','+1 day') and status != 'Done' and status != 'Deleted') as 'Tmr'," +
                    "(select count(distinct(id)) from task as 'This Week' where strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now') and status != 'Done' and status != 'Deleted') as 'This WK'," +
                    "(select count(distinct(id)) from task as 'Next Week' where strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now', '+7 days') and status != 'Done' and status != 'Deleted') as 'Next WK'," +
                    "(select count(distinct(id)) from task as 'Done Yesterday' where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status = 'Done') as 'Done Yday'," +
                    "(select count(distinct(id)) from task as 'Overdue Yesterday' where strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status != 'Done' and status != 'Deleted') as 'OD Yday'," +
                    "(select count(distinct(id)) from task as 'Overdue' where strftime('%Y-%m-%d %H:%M:%S', due_date, 'unixepoch') < datetime('now') and status != 'Done' and status != 'Deleted') as 'OD'";
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

        createTaskItemElement : function (taskObj) {
            var contextCount, i, dueClass, localDueDate, isOverdue,
                localReminderDate, contextClass, overDueIcon,
                titleSpanClass      = 'detail-title',
                currentTime         = new Date().getTime(),
                innerContent        = UIConfig.emptyString,
                item                = document.createElement('div'),
                id                  = taskObj.id,
                name                = taskObj.name,
                project             = taskObj.project,
                gtdList             = taskObj.gtdList,
                contexts            = taskObj.contexts,
                dueDate             = taskObj.dueDate,
                reminderDate        = taskObj.reminderDate,
                reminderMetaName    = taskObj.reminderMetaName,
                displayReminderIcon = taskObj.displayReminderIcon;
            item.setAttribute('data-bb-type', 'item');
            item.setAttribute('data-bb-style', 'stretch');
            if (Util.notEmpty(id)) {
                item.setAttribute('id', 'task-' + id);
                if (Util.notEmpty(name)) {
                    if (Util.notEmpty(gtdList)) {
                        titleSpanClass = getGtdListTitleSpanClass(gtdList, titleSpanClass);
                    }
                    item.setAttribute('title', '<span class="' + titleSpanClass + '">' + name + '</span>');
                    item.setAttribute('data-bb-title', '<span class="' + titleSpanClass + '">' + name + '</span>');
                }
                if (Util.notEmpty(project)) {
                    innerContent = "\n<span class='list-project'>" + project + "</span>";
                }
                if (Util.notEmpty(dueDate)) {
                    localDueDate = new Date(dueDate * 1000);
                    isOverdue = localDueDate.getTime() < currentTime;
                    dueClass = isOverdue ? 'list-overdue' : 'list-due';
                    overDueIcon = Util.getOverdueIconStr(isOverdue);
                    innerContent = innerContent + overDueIcon + "\n<span class='" + dueClass + "'>" + Util.getPrettyDateStr(localDueDate) + "</span>";
                }
                if (Util.notEmpty(reminderDate) && (displayReminderIcon === true)) {
                    localReminderDate = new Date(reminderDate * 1000);
                    innerContent = Util.getReminderIconStr(localReminderDate.getTime() > new Date().getTime()) + innerContent;
                }
                if (Util.notEmpty(contexts) && contexts.length > 0) {
                    contextCount = contexts.length;
                    for (i = 0; i < contextCount; i += 1) {
                        contextClass = (i === contextCount - 1) ? 'list-context-last' : 'list-context';
                        innerContent = innerContent + "\n<span class='" + contextClass + "'>" + contexts[i] + "</span>";
                    }
                }
                item.innerHTML = innerContent;
                item.onclick = function () {
                    var container = document.getElementById(UIConfig.viewTaskDetailElementId);
                    document.getElementById('task-operation-context-menu').menu.peek({
                        title       : UIConfig.msgTaskContextMenuTitle,
                        description : name,
                        selected    : taskObj,
                        type        : 'Task'
                    });
                    UITaskUtil.createTaskDetailView(container, taskObj);
                };
            }
            return item;
        },

        taskFromDbToUIFunc : function (id, name, taskIndex, taskCount, taskList, items) {
            return function (tx) {
                DataAccess.runSqlDirectly(
                    tx,
                    'select meta_name, meta_type_name, task_reminder_date, task_due_date from task_view where task_id = ?',
                    [id],
                    function (tx, result, objs) {
                        var metaCount, metaIndex, contexts = [], project = null,
                            metaTypeName = null, taskDueDate = null, obj, item, gtdList,
                            displayReminderIcon = false, reminderMetaName, taskReminderDate;
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
                                    && Util.notEmpty(obj.task_due_date)
                                    && Util.notEmpty(obj.task_reminder_date)
                                    && obj.meta_name !== SeedData.OffMetaName) {
                                displayReminderIcon = true;
                                reminderMetaName = obj.meta_name;
                            } else if ((Util.isEmpty(gtdList)) && SeedData.GtdMetaTypeName === metaTypeName) {
                                gtdList = obj.meta_name;
                            }
                            //Only get once task due date since it's the same for all the result set 
                            if (Util.isEmpty(taskDueDate)) {
                                taskDueDate = obj.task_due_date;
                            }
                            if (Util.isEmpty(taskReminderDate)) {
                                taskReminderDate = obj.task_reminder_date;
                            }
                        }
                        if (null === taskDueDate) {
                            DataAccess.runSqlDirectly(tx,
                                'select due_date, reminder_date from task where id = ?', [id],
                                function (tx, result, objs) {
                                    taskDueDate = result.rows.item(0).due_date;
                                    taskReminderDate = result.rows.item(0).reminder_date;
                                    item = UITaskUtil.createTaskItemElement(
                                        TaskModel.constructTaskObj(id, name, gtdList, project, contexts,
                                            taskDueDate, reminderMetaName, taskReminderDate,
                                            displayReminderIcon)
                                    );
                                    items.push(item);
                                    if (taskIndex === taskCount - 1) {
                                        taskList.refresh(items);
                                    }
                                });
                        } else {
                            //FIXME Move those codes to TaskMode and only returns a taskObj for a database query.
                            item = UITaskUtil.createTaskItemElement(
                                TaskModel.constructTaskObj(id, name, gtdList, project, contexts,
                                    taskDueDate, reminderMetaName, taskReminderDate,
                                    displayReminderIcon)
                            );
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

        createTaskDetailView : function (container, taskObj) {
            var contextCount, contextIndex, dueClass, isOverdue,
                localDueDate, localReminderDate, isFutureReminder,
                gtdList, gtdListDisplay, gtdListClass,
                currentTime    = new Date().getTime(),
                metaContent    = UIConfig.emptyString,
                contextContent = UIConfig.emptyString,
                dueContent     = UIConfig.emptyString,
                titleDiv       = document.getElementById(UIConfig.viewTaskTitleElementId),
                projectDiv     = document.getElementById(UIConfig.viewTaskProjectElementId),
                dueDiv         = document.getElementById(UIConfig.viewTaskDueElementId),
                contextDiv     = document.getElementById(UIConfig.viewTaskContextElementId),
                notesDiv       = document.getElementById(UIConfig.viewTaskNotesElementId),
                groupSep       = "<br/><div style='clear:both;height:8px'>&nbsp;</div>",
                metaDiv        = document.getElementById('view-task-detail-meta');
            setFieldInTaskDetailPopup(taskObj.name, titleDiv, 'html');
            if (Util.notEmpty(taskObj.gtdList)) {
                gtdList = taskObj.gtdList;
                if (gtdList === SeedData.BasketMetaName) {
                    gtdListDisplay = 'Basket';
                    gtdListClass = 'task-detail-basket';
                } else if (gtdList === SeedData.NextActionMetaName) {
                    gtdListDisplay = 'Next Action';
                    gtdListClass = 'task-detail-next-action';
                } else if (gtdList === SeedData.SomedayMetaName) {
                    gtdListDisplay = 'Someday/Maybe';
                    gtdListClass = 'task-detail-someday';
                }
                if (Util.notEmpty(gtdListDisplay)) {
                    metaContent = metaContent + Util.getGTDListIconStr() + "<span class='" + gtdListClass + "'>" + gtdListDisplay + "</span>" + groupSep;
                }
            }
            if (true === taskObj.displayReminderIcon) {
                localReminderDate = new Date(taskObj.reminderDate * 1000);
                isFutureReminder = localReminderDate.getTime() > new Date().getTime();
                metaContent = metaContent + Util.getReminderIconStr(isFutureReminder);
                if (Util.notEmpty(taskObj.reminderDate)) {
                    if (isFutureReminder) {
                        metaContent = metaContent + "<span class='task-detail-future-alarm'>" + Util.getPrettyDateStr(localReminderDate) + "</span>" + groupSep;
                    } else {
                        metaContent = metaContent + "<span class='task-detail-past-alarm'>" + Util.getPrettyDateStr(localReminderDate) + "</span>" + groupSep;
                    }
                }
            }
            if (Util.notEmpty(taskObj.project)) {
                metaContent = metaContent + Util.getProjectIconStr() + "<span class='task-detail-list-project'>" + taskObj.project + "</span>" + groupSep;
            }
            if (Util.notEmpty(taskObj.dueDate)) {
                localDueDate = new Date(taskObj.dueDate * 1000);
                isOverdue = localDueDate.getTime() < currentTime;
                dueClass = isOverdue ? 'task-detail-list-overdue' : 'task-detail-list-due';
                metaContent = metaContent + Util.getDueIconStr() + "<span class='" + dueClass + "'>" + Util.getPrettyDateStr(localDueDate)  + Util.getOverdueIconStrDetailPage(isOverdue) + "</span>" + groupSep;
            }
            if (Util.notEmpty(taskObj.contexts)) {
                contextCount = taskObj.contexts.length;
                if (contextCount > 0) {
                    metaContent += Util.getContextIconStr() + "<span class='task-detail-list-context-container'>";
                    for (contextIndex = 0; contextIndex < contextCount; contextIndex += 1) {
                        metaContent = metaContent + "\n<span class='task-detail-list-context'>" + taskObj.contexts[contextIndex] + "</span>";
                    }
                    metaContent += '</span>';
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
                //Set focus of the textarea(the keyboard will pop us, annoying) elem.focus();
                //(Move the caret to the end of the text box) Util.moveCaretToEnd(elem);
            } else {
                console.warn('Task Name for [%s] is [%s](empty ?)', id, taskName);
            }
        },

        clearDueDateField : function () {
            $('#due-date').val(UIConfig.emptyString);
            UITaskReminderUtil.switchReminderPanelDisplay(UIConfig.emptyString);
        },

        updateTaskStatus : function (taskId, statusKey, successCallback) {
            DataAccess.task.updateStatus(taskId, statusKey,
                function (tx, result, rows) {
                    if (Util.isFunction(successCallback)) {
                        successCallback(taskId);
                    }
                }, function (tx, error) {
                    log.logSqlError("Failed to update status to [" + statusKey + "] for task[" + taskId + "]", error);
                });
        },

        moveTaskToTrash : function (taskId, successCallback) {
            UITaskUtil.updateTaskStatus(taskId, SeedData.TaskDeletedStatus, successCallback);
        },

        markTaskAsDone : function (taskId, successCallback) {
            UITaskUtil.updateTaskStatus(taskId, SeedData.TaskDoneStatus, successCallback);
        }

    };

}());

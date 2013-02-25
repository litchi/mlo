/*jslint browser: true es5: true*/
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util*/
var UITaskUtil = (function () {
    "use strict";

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

        decorateTaskNumber : function (taskNumber) {
            return '<span class="list-context" style="vertical-align:top;margin-top:0px;border:1px solid #CCC">' + taskNumber + '</span>';
        },

        createTaskItemElement : function (id, name, project, contexts, dueDate) {
            var innerContent = UIConfig.emptyString, item = document.createElement('div'),
                contextCount, i, dueClass, localDueDate;
            item.setAttribute('data-bb-type', 'item');
            item.setAttribute('data-bb-style', 'stretch');
            if (id !== null) {
                item.setAttribute('id', 'task-' + id);
                if (name !== null) {
                    item.setAttribute('title', name);
                    item.setAttribute('data-bb-title', name);
                }
                if (project !== null) {
                    innerContent = "\n<span class='list-project'>p:" + project + "</span>";
                }
                if (contexts !== null) {
                    contextCount = contexts.length;
                    if (contextCount > 0) {
                        for (i = 0; i < contextCount; i += 1) {
                            innerContent = innerContent + "\n<span class='list-context'>" + contexts[i] + "</span>";
                        }
                    }
                }
                if (dueDate !== null) {
                    //localDueDate = Util.timeToDateWithZone(dueDate);
                    localDueDate = new Date(dueDate * 1000);
                    dueClass = (localDueDate.getTime() > new Date().getTime()) ? 'list-due' : 'list-overdue';
                    innerContent = innerContent + "\n<span class='" + dueClass + "'>" + Util.getPrettyDateStr(localDueDate) + "</span>";
                }
                item.innerHTML = innerContent;
                item.onclick = function () {
                    var taskDetailHtml, container = document.getElementById(UIConfig.viewTaskDetailElementId);
                    document.getElementById('task-operation-context-menu').menu.peek({
                        title : UIConfig.msgTaskContextMenuTitle,
                        description : name,
                        //FIXME: Make this parameter pass all the fetched data and avoid querying from DB again
                        selected : id
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
                        var metaCount, metaIndex, contexts = [], project = null, metaTypeName = null, taskDueDate = null, obj, item;
                        metaCount = result.rows.length;
                        for (metaIndex = 0; metaIndex < metaCount; metaIndex += 1) {
                            obj = result.rows.item(metaIndex);
                            metaTypeName = obj.meta_type_name;
                            //An array is used to store context since there might be more than one context assigned to one task
                            if (SeedData.ContextMetaTypeName === metaTypeName) {
                                contexts.push(obj.meta_name);
                            } else if (SeedData.ProjectMetaTypeName === metaTypeName) {
                                project = obj.meta_name;
                            }
                            //Only get once task due date since it's the same for all the result set 
                            if (null === taskDueDate) {
                                taskDueDate = obj.task_due_date;
                            }
                        }
                        item = UITaskUtil.createTaskItemElement(id, name, project, contexts, taskDueDate);
                        items.push(item);
                        if (taskIndex === taskCount - 1) {
                            taskList.refresh(items);
                        }
                    }
                );
            };
        },

        tasksFromDbToUI : function (tasks, taskList) {
            var id, name, taskIndex, taskCount, items = [], loopFunc;
            taskList.innerHTML = UIConfig.emptyString;
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

        setTaskDetailPanelDisplay : function (display) {
            var container, taskListContainer;
            container = document.getElementById(UIConfig.viewTaskDetailElementId);
            if (container.style.display !== display) {
                document.getElementById('main-content-overlay').style.display = display;
                container.style['-webkit-transition'] = 'all 1s ease-in-out';
                container.style['-webkit-backface-visibility'] = 'hidden';
                container.style['-webkit-perspective'] = '1000';
                container.style.display = display;
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
                //localDueDate = Util.timeToDateWithZone(dueDate);
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
        }
    };

}());

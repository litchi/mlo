/*jslint browser: true */
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util*/
var UIListController = (function () {
    "use strict";

    function setMetaContextMenuAction(item, metaTypeName, metaId, metaName, metaDesc) {
        if (Util.isEmpty(metaDesc)) {
            metaDesc = UIConfig.emptyString;
        }
        item.innerHTML = metaDesc;
        item.setAttribute(
            'onclick',
            "document.getElementById('task-operation-context-menu').menu.peek({ title : '" + metaName + " : "  + metaTypeName + "', description : '" + metaDesc + "', selected : '" + metaId + "'});"
        );
    }

    function decorateTaskNumber(taskNumber) {
        return '<span class="list-context" style="vertical-align:top;margin-top:0px;border:1px solid #CCC">' + taskNumber + '</span>';
    }

    function getNumberOfTasks(metaTypeName, metaName) {
        return '20';
    }

    function createTaskItemElement(id, name, project, contexts, dueDate) {
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
                document.getElementById('task-operation-context-menu').menu.peek({
                    title : UIConfig.msgTaskContextMenuTitle,
                    description : name,
                    selected : id
                });
            };
        }
        return item;
    }

    //TODO Put project/contexts/dueDate to an array to avoid changing the method definition all the time.
    function taskFromDbToUIFunc(id, name, taskIndex, taskCount, taskList, items) {
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
                    item = createTaskItemElement(id, name, project, contexts, taskDueDate);
                    items.push(item);
                    if (taskIndex === taskCount - 1) {
                        taskList.refresh(items);
                    }
                }
            );
        };
    }

    function tasksFromDbToUI(tasks, taskList) {
        var id, name, taskIndex, taskCount, items = [], loopFunc;
        taskList.innerHTML = UIConfig.emptyString;
        if (null === tasks || undefined === tasks || 0 === tasks.length) {
            taskList.innerHTML = UIConfig.msgForNoTask;
        } else {
            taskCount = tasks.length;
            for (taskIndex = 0; taskIndex < taskCount; taskIndex += 1) {
                name = tasks[taskIndex][Sql.Task.Cols.Name];
                id   = tasks[taskIndex][Sql.Task.Cols.Id];
                loopFunc = taskFromDbToUIFunc(id, name, taskIndex, taskCount, taskList, items);
                DataAccess.appDb.transaction(loopFunc);
            }
        }
    }

    function setGroupPanelEmptyHeight() {
        var height,
            groupParent      = document.getElementById('group'),
            metaListTitle    = document.getElementById('group-title'),
            metaListDiv      = document.getElementById('group-list'),
            metaListSpaceDiv = document.getElementById('group-space');
        if (Util.notEmpty(groupParent) &&
                Util.notEmpty(metaListTitle) &&
                Util.notEmpty(metaListDiv) &&
                Util.notEmpty(metaListSpaceDiv)) {
            height = groupParent.offsetHeight - metaListTitle.offsetHeight - metaListDiv.offsetHeight;
            metaListSpaceDiv.style.height = height + 'px';
        }
    }

    function setMetaTypeFields(metaTypeName) {
        DataAccess.metaType.getByName(metaTypeName, function (tx, result, resultObj) {
            Util.setValue('v_meta_type_name', metaTypeName);
            if (null !== resultObj && (resultObj.length > 0) &&
                    null !== resultObj[0] && null !== resultObj[0][Sql.Meta.Cols.Id]) {
                Util.setValue('v_meta_type_id', resultObj[0][Sql.MetaType.Cols.Id]);
            } else {
                console.warn("Meta Type with name '%s' not found", metaTypeName);
            }
        }, function (tx, error) {
            log.logSqlError("Error getting metaType[" + metaTypeName + "]", error);
        });
    }

    function setMetaFields(metaName) {
        DataAccess.meta.getByName(metaName, function (tx, result, resultObj) {
            Util.setValue('v_meta_name', metaName);
            if (null !== resultObj && (resultObj.length > 0) &&
                    null !== resultObj[0] && null !== resultObj[0][Sql.Meta.Cols.Id]) {
                Util.setValue('v_meta_id', resultObj[0][Sql.Meta.Cols.Id]);
            } else {
                console.warn("Meta with name '%s' not found", metaName);
            }
        }, function (tx, error) {
            log.logSqlError("Error getting meta[" + metaName + "]", error);
        });
    }

    function makeMetaTypeDefaultList(metaTypeName) {
        var item = document.createElement('div'),
            title = 'All ' + metaTypeName + 's';
        item.setAttribute('data-bb-type', 'item');
        item.setAttribute('data-bb-style', 'stretch');
        item.setAttribute('title', title);
        item.setAttribute('data-bb-title', title);
        item.setAttribute('id', metaTypeName);
        item.setAttribute(
            'onclick',
            "UIListController.fillTaskAndMarkGroup('" + metaTypeName + "', '" + metaTypeName + "', '" + Sql.FilterAllMeta + "');"
        );
        return item;
    }

    function setCreateTaskInputPlaceHolder(metaName, metaTypeName) {
        var placeholder = 'New task',
            ctf = document.getElementById('ctsi');
        if (Util.notEmpty(ctf)) {
            if (Util.notEmpty(metaName) &&
                    Sql.FilterAllMeta !== metaName &&
                    SeedData.DueMetaTypeName !== metaTypeName) {
                if (SeedData.GtdMetaTypeName === metaTypeName) {
                    placeholder = placeholder + ' on ' + metaName;
                } else {
                    placeholder = placeholder + ' on ' + metaTypeName + ' ' + metaName;
                }
            } else {
                placeholder = placeholder + '(Goes to list Basket)';
            }
            ctf.setAttribute('placeholder', placeholder);
        }
    }

    function getMetaListElement(pageType) {
        var metaList;
        if (UIConfig.taskByPagePrefix === pageType) {
            metaList = document.getElementById('group-list');
            if (Util.isEmpty(metaList)) {
                console.error("Meta List(id: [%s]) is empty or null[%s]", 'group-list', metaList);
            }
        } else if (UIConfig.metaByPagePrefix === pageType) {
            metaList = document.getElementById(UIConfig.detailListElementId);
            if (Util.isEmpty(metaList)) {
                console.error("Meta List(id: [%s]) is empty or null[%s]", UIConfig.detailListElementId, metaList);
            }
        }
        return metaList;
    }

    function hidePlusShortcut(elem) {
        elem.innerText = '+';
        elem.style.backgroundColor = '#EEE';
        elem.style.color = '#EEE';
        elem.onclick = function () {
        };
    }

    function filterContextMenu(items) {
        var index, menuItems, menuItem,
            contextMenu = document.getElementById('task-operation-context-menu');
        if (Util.isEmpty(items)) {
            console.warn("Want to display no item in the context map?");
            return;
        }
        if (Util.isEmpty(contextMenu)) {
            console.warn("Context menu with id[%s] in UI is undefined", 'task-operation-context-menu');
            return;
        }
        menuItems = contextMenu.getElementsByTagName('div');
        if (Util.isEmpty(menuItems)) {
            console.warn("There's no child element defined in div with id[%s]", 'task-operation-context-menu');
            return;
        }
        for (index = 0; index < menuItems.length; index += 1) {
            menuItem = menuItems[index];
            if (Util.notEmpty(menuItem) && Util.notEmpty(menuItem.getAttribute('id'))) {
                menuItem.style.display = 'none';
                menuItem.setAttribute('data-bb-pin', 'false');
            }
        }
        for (index = 0; index < items.length; index += 1) {
            document.getElementById(items[index]).style.display = 'block';
        }
    }

    return {

        fillTaskAndMarkGroup : function (id, metaTypeName, filter) {
            if (Util.notEmpty(document.getElementById('selected-group-item'))) {
                document.getElementById('selected-group-item').setAttribute('id', Util.valueOf('v_curr_hl_item'));
            }
            document.getElementById(id).setAttribute('id', 'selected-group-item');
            document.getElementById('v_curr_hl_item').value = id;
            UIListController.fillTasksToGroupByMetaInfo(metaTypeName, filter);
            Util.switchPanelWidth(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin);
        },

        fillMetaListMarkTypeAsSelected : function (id) {
            if (Util.notEmpty(document.getElementById('selected-group-item'))) {
                document.getElementById('selected-group-item').setAttribute('id', Util.valueOf('v_curr_hl_item'));
            }
            document.getElementById(id).setAttribute('id', 'selected-group-item');
            document.getElementById('v_curr_hl_item').value = id;
            UIListController.fillMetaListToPanel(id, UIConfig.metaByPagePrefix);
            Util.switchPanelWidth(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin);
        },

        switchDisplayToMode : function (mode) {
            var detailListPanelDiv = document.getElementById('detail-list-panel'),
                singleDetailDiv    = document.getElementById('task-list-container'),
                masterDetailDiv    = document.getElementById('group-detail-container');
            if (Util.notEmpty(masterDetailDiv) && Util.notEmpty(singleDetailDiv)) {
                if ((masterDetailDiv.style.display !== 'none') && (UIConfig.singleDisplayMode === mode)) {
                    singleDetailDiv.innerHTML = UIFragments.singleTaskList;
                    masterDetailDiv.innerHTML = UIConfig.emptyString;
                    masterDetailDiv.style.display = 'none';
                    singleDetailDiv.style.display = 'block';
                    bb.style(singleDetailDiv);
                } else if (singleDetailDiv.style.display !== 'none' && (UIConfig.masterDetailDisplayMode === mode)) {
                    masterDetailDiv.innerHTML = UIFragments.masterDetailTaskList;
                    singleDetailDiv.innerHTML = UIConfig.emptyString;
                    masterDetailDiv.style.display = 'block';
                    singleDetailDiv.style.display = 'none';
                    bb.style(masterDetailDiv);
                }
            }
        },

        fillTasksToGroupByMetaInfo : function (metaTypeName, metaName) {
            var id, name, title = UIConfig.emptyString,
                detailListTitle  = document.getElementById('detail-title-text'),
                detailAddNewLink = document.getElementById('detail-add-new-link'),
                taskList = document.getElementById(UIConfig.detailListElementId);
            filterContextMenu(UIConfig.taskContextMenu);
            if (SeedData.DueMetaTypeName === metaTypeName) {
                DataAccess.task.getByDueMeta(metaName, function (tx, result, arrays) {
                    tasksFromDbToUI(arrays, taskList);
                });
            } else {
                if (Sql.FilterAllMeta !== metaName) {
                    DataAccess.task.getByMeta(metaTypeName, metaName, function (transaction, results, arrays) {
                        tasksFromDbToUI(arrays, taskList);
                    });
                } else {
                    DataAccess.task.getByMetaType(metaTypeName, function (transaction, results, arrays) {
                        tasksFromDbToUI(arrays, taskList);
                    });
                }
            }
            setCreateTaskInputPlaceHolder(metaName, metaTypeName);
            if (Util.notEmpty(detailListTitle)) {
                if (Util.notEmpty(metaName) && Sql.FilterAllMeta !== metaName) {
                    detailListTitle.innerText = metaName;
                } else if (Util.notEmpty(metaTypeName)) {
                    detailListTitle.innerText = 'Tasks with ' + metaTypeName;
                }
            }
            if (Util.notEmpty(detailAddNewLink)) {
                detailAddNewLink.style.display = 'none';
            }
            if (Util.notEmpty(detailListTitle)) {
                detailListTitle.style.display = 'inline';
            }
            if (Sql.FilterAllMeta !== metaName) {
                setMetaFields(metaName);
            }
            if (UIConfig.emptyString !== metaTypeName) {
                setMetaTypeFields(metaTypeName);
            } else {
                console.warn("Meta Type Name is empty, will not set v_meta_type_name and v_meta_type_id");
            }
        },

        fillTasksToGroupByStatusKey: function (taskStatus) {
            var taskList = document.getElementById(UIConfig.detailListElementId);
            filterContextMenu(UIConfig.trashBoxContextMenu);
            DataAccess.task.getByStatus(taskStatus, function (tx, result, arrays) {
                tasksFromDbToUI(arrays, taskList);
            });
        },

        fillMetaListToPanelByTypeName : function (metaTypeName, pageType) {
            DataAccess.metaType.getByName(metaTypeName, function (tx, result, objs) {
                if (null !== objs && undefined !== objs && objs.length > 0 && null !== objs[0] && undefined !== objs[0]) {
                    UIListController.fillMetaListToPanel(objs[0][Sql.MetaType.Cols.Id], pageType);
                } else {
                    console.warn("Meta type with name[%s] was not found on page type[%s]", metaTypeName, pageType);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting meta type[" + metaTypeName + "], pageType: [" + pageType + "]", error);
            });
        },

        fillMetaTypeToPanel : function () {
            var item, name,
                groupAddNewLink    = document.getElementById('group-title-add-new-link'),
                metaTypeListTitle  = document.getElementById('group-title-text'),
                metaTypeList       = document.getElementById('group-list');
            if (Util.notEmpty(metaTypeListTitle)) {
                metaTypeListTitle.innerText = 'Fields';
                hidePlusShortcut(groupAddNewLink);
            }
            filterContextMenu(UIConfig.metaContextMenu);
            DataAccess.metaType.getAll(function (tx, result, arrays) {
                var key, name, id, desc, item, internal, uiId;
                if (Util.notEmpty(metaTypeList)) {
                    metaTypeList.innerHTML = UIConfig.emptyString;
                }
                for (key in arrays) {
                    if (arrays.hasOwnProperty(key)) {
                        name     = arrays[key][Sql.MetaType.Cols.Name];
                        id       = arrays[key][Sql.MetaType.Cols.Id];
                        desc     = arrays[key][Sql.MetaType.Cols.Description];
                        internal = arrays[key][Sql.MetaType.Cols.Internal];
                        item = document.createElement('div');
                        item.setAttribute('data-bb-type', 'item');
                        item.setAttribute('data-bb-style', 'stretch');
                        if (id !== null && 1 !== internal) {
                            item.setAttribute('id', id);
                            if (name !== null) {
                                item.setAttribute('title', name);
                                item.setAttribute('data-bb-title', name);
                            }
                            item.setAttribute(
                                'onclick',
                                "UIListController.fillMetaListMarkTypeAsSelected('" + id + "');"
                            );
                            metaTypeList.appendItem(item);
                        }
                    }
                }
                setCreateTaskInputPlaceHolder(UIConfig.emptyString, UIConfig.emptyString);
                setGroupPanelEmptyHeight();
            }, function (tx, error) {
                log.logSqlError("Error getting all meta type", error);
            });
        },

        fillMetaToCreateForm : function (meta_type_id) {
            DataAccess.metaType.getById(meta_type_id, function (tx, result, objs) {
                var metaTypeName = objs[0][Sql.MetaType.Cols.Name], metaTypeId = objs[0][Sql.MetaType.Cols.Id];
                Util.setMetaDetailPageCaption('New ' + metaTypeName);
                Util.setValue('meta_type_id', metaTypeId);
                Util.setValue('meta_type_name', metaTypeName);
            });
        },

        addTaskToList : function (taskList, id, name, project, contexts, dueDate) {
            var item, items = taskList.getItems();
            item = createTaskItemElement(id, name, project, contexts, dueDate);
            if (0 === items.length) {
                taskList.innerHTML = UIConfig.emptyString;
                taskList.appendItem(item);
            } else if (items.length > 0) {
                taskList.appendItem(item);
            }
        },

        removeTaskFromList : function (taskId) {
            document.getElementById('task-' + taskId).remove();
            if (0 === document.getElementById(UIConfig.detailListElementId).getItems().length) {
                document.getElementById(UIConfig.detailListElementId).innerHTML = UIConfig.msgForNoTask;
            }
        },

        fillAllMetaToPanel : function (pageType) {
            var metaTypeName, metaList, metaTypeInternal,
                detailListTitle  = document.getElementById('detail-title-text'),
                detailAddNewLink = document.getElementById('detail-add-new-link'),
                groupAddNewLink  = document.getElementById('group-title-add-new-link'),
                metaListTitle    = document.getElementById('group-title-text');
            metaList = getMetaListElement(pageType);
            metaList.innerHTML = UIConfig.emptyString;
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, "select distinct meta_id as id, meta_name as name, meta_description as description, meta_type_name from meta_view where meta_type_internal = 0",
                    [], function (tx, result, objs) {
                        var key, name, id, desc, item, metaTypeName;
                        for (key in objs) {
                            if (objs.hasOwnProperty(key)) {
                                name = objs[key][Sql.Meta.Cols.Name];
                                id   = objs[key][Sql.Meta.Cols.Id];
                                desc = objs[key][Sql.Meta.Cols.Description];
                                metaTypeName = objs[key].meta_type_name;
                                item = document.createElement('div');
                                item.setAttribute('data-bb-type', 'item');
                                item.setAttribute('data-bb-style', 'stretch');
                                if (Util.notEmpty(id)) {
                                    item.setAttribute('id', 'meta-' + id);
                                    if (Util.notEmpty(name)) {
                                        item.setAttribute('title', metaTypeName + ": " + name);
                                        item.setAttribute('data-bb-title', metaTypeName + ": " + name);
                                    }
                                    setMetaContextMenuAction(item, metaTypeName, id, name, desc);
                                    metaList.appendItem(item);
                                }
                            }
                        }
                        detailAddNewLink.innerText     = 'All Projects and Contexts';
                        if (Util.notEmpty(detailListTitle)) {
                            detailListTitle.style.display  = 'none';
                        }
                        if (Util.notEmpty(detailAddNewLink)) {
                            detailAddNewLink.style.display = 'inline';
                            detailAddNewLink.onclick       = function () {};
                        }
                        setGroupPanelEmptyHeight();
                    });
            }, function (tx, error) {
                log.logSqlError("Error getting all meta list", error);
            });
        },

        fillMetaListToPanel : function (metaTypeId, pageType) {
            var metaTypeName, metaList, metaTypeInternal,
                detailAddNewLink = document.getElementById('detail-add-new-link'),
                groupAddNewLink  = document.getElementById('group-title-add-new-link'),
                metaListTitle    = document.getElementById('group-title-text');
            metaList = getMetaListElement(pageType);
            metaList.innerHTML = UIConfig.emptyString;
            DataAccess.metaType.getById(metaTypeId, function (tx, result, objs) {
                if (Util.notEmpty(objs) && Util.notEmpty(objs[0])) {
                    metaTypeName     = objs[0][Sql.MetaType.Cols.Name];
                    metaTypeInternal = objs[0][Sql.MetaType.Cols.Internal];
                    if (UIConfig.metaByPagePrefix === pageType) {
                        detailAddNewLink.onclick = function () {
                            bb.pushScreen('edit-meta.html', UIConfig.createMetaPagePrefix, {'metaTypeId' : metaTypeId});
                        };
                        detailAddNewLink.innerText = 'Add New ' + metaTypeName;
                        hidePlusShortcut(groupAddNewLink);
                    } else if (UIConfig.taskByPagePrefix === pageType) {
                        if (0 === metaTypeInternal) {
                            groupAddNewLink.innerText = '+';
                        } else if (1 === metaTypeInternal) {
                            hidePlusShortcut(groupAddNewLink);
                        }
                        if (Util.notEmpty(metaListTitle)) {
                            metaListTitle.innerText = metaTypeName;
                        } else {
                            console.warn("Element with id[%s] is null, failed to set innerText to [%s]", 'group-title-text', metaTypeName);
                        }
                        metaList.appendItem(makeMetaTypeDefaultList(metaTypeName));
                    }
                    Util.setValue('v_meta_type_id', metaTypeId);
                    Util.setValue('v_meta_type_name', metaTypeName);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting meta type[" + metaTypeId + "], pageType:[" + pageType + "]", error);
            });
            DataAccess.meta.getByTypeId(metaTypeId, function (tx, result, arrays) {
                var key, name, id, desc, item, uiId;
                for (key in arrays) {
                    if (arrays.hasOwnProperty(key)) {
                        name = arrays[key][Sql.Meta.Cols.Name];
                        id   = arrays[key][Sql.Meta.Cols.Id];
                        desc = arrays[key][Sql.Meta.Cols.Description];
                        item = document.createElement('div');
                        item.setAttribute('data-bb-type', 'item');
                        item.setAttribute('data-bb-style', 'stretch');
                        if (id !== null) {
                            uiId = 'meta-' + id;
                            item.setAttribute('id', uiId);
                            if (name !== null) {
                                item.setAttribute('title', name);
                            }
                            if (UIConfig.taskByPagePrefix === pageType) {
                                item.setAttribute('data-bb-title',  name + decorateTaskNumber(getNumberOfTasks(metaTypeName, name)));
                                item.setAttribute(
                                    'onclick',
                                    "UIListController.fillTaskAndMarkGroup('" + uiId + "', '" + metaTypeName + "','" + name + "')"
                                );
                            } else if (UIConfig.metaByPagePrefix === pageType) {
                                item.setAttribute('data-bb-title', name);
                                setMetaContextMenuAction(item, metaTypeName, id, name, desc);
                            }
                            metaList.appendItem(item);
                        }
                    }
                }
                setGroupPanelEmptyHeight();
            }, function (tx, error) {
                log.logSqlError("Error getting meta list[" + metaTypeId + "]", error);
            });
        }

    };
}());

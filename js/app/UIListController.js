/*jslint browser: true */
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, Util*/
var UIListController = (function () {
    "use strict";

    function createItemElement(id, name, project, contexts, dueDate) {
        var innerContent = UIConfig.emptyString, item = document.createElement('div'),
            contextCount, i, tzo = new Date().getTimezoneOffset(),
            dueClass, actualMs, ld;
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
                actualMs = (dueDate + tzo * 60) * 1000;
                ld = new Date(actualMs);
                dueClass = (actualMs > new Date().getTime()) ? 'list-due' : 'list-overdue';
                innerContent = innerContent + "\n<span class='" + dueClass + "'>" + Util.getPrettyDateStr(ld) + "</span>";
            }
            item.innerHTML = innerContent;
            item.onclick = function () {
                document.getElementById('task-operation-context-menu').menu.peek({
                    title : 'Edit Task',
                    description : name,
                    selected : id
                });
            };
        }
        return item;
    }

    //TODO Optimize, first construct a document fragment and then append it to the element.
    //TODO Put project/contexts/dueDate to an array to avoid changing the method definition all the time.

    function tasksFromDbToUI(tasks, taskList) {
        var key, id, name, i, max, height;
        taskList.clear();
        if (null === tasks || undefined === tasks || 0 === tasks.length) {
            taskList.innerHTML = UIConfig.msgForNoTask;
        } else {
            for (key in tasks) {
                if (tasks.hasOwnProperty(key)) {
                    name = tasks[key][Sql.Task.Cols.Name];
                    id   = tasks[key][Sql.Task.Cols.Id];
                    DataAccess.appDb.transaction(
                        (function (id, name) {
                            return function (tx) {
                                DataAccess.runSqlDirectly(
                                    tx,
                                    'select meta_name, meta_type_name, task_due_date from task_view where task_id = ?',
                                    [id],
                                    function (tx, result) {
                                        var context = [], project = null, mt = null, rt = null, obj;
                                        for (i = 0, max = result.rows.length; i < max; i += 1) {
                                            obj = result.rows.item(i);
                                            mt = obj.meta_type_name;
                                            if (SeedData.ContextMetaTypeName === mt) {
                                                context.push(obj.meta_name);
                                            } else if (SeedData.ProjectMetaTypeName === mt) {
                                                project = obj.meta_name;
                                            }
                                            if (null === rt) {
                                                rt = obj.task_due_date;
                                            }
                                        }
                                        UIListController.addTaskToList(id, name, project, context, rt);
                                    }
                                );
                            };
                        }(id, name)
                        )
                    );
                }
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
        item.setAttribute(
            'onclick',
            "UIListController.fillTasksToGroupByMetaInfo('" + metaTypeName + "', '" + Sql.FilterAllMeta + "');Util.switchPanelWidth('" + UIConfig.leftPanelWidth + "', '" + UIConfig.rightPanelWidth + "', '" + UIConfig.rightPanelSmallerLeftMargin + "');"
        );
        return item;
    }

    function setCreateTaskInputPlaceHolder(metaName, metaTypeName) {
        var placeholder = 'Create new task',
            ctf = document.getElementById('ctsi');
        if (undefined !== ctf) {
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
            metaList = document.getElementById('detail-list');
            if (Util.isEmpty(metaList)) {
                console.error("Meta List(id: [%s]) is empty or null[%s]", 'detail-list', metaList);
            }
        }
        return metaList;
    }

    return {
        fillTasksToGroupByMetaInfo : function (metaTypeName, metaName) {
            var id, name, title = UIConfig.emptyString,
                detailListTitle  = document.getElementById('detail-title-text'),
                taskList = document.getElementById(UIConfig.detailListElementId);
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
            if (Sql.FilterAllMeta !== metaName) {
                setMetaFields(metaName);
            } else {
                console.debug("For default due list page, meta name is empty, will not set v_meta_name and v_meta_id");
            }
            if (UIConfig.emptyString !== metaTypeName) {
                setMetaTypeFields(metaTypeName);
            } else {
                console.warn("Meta Type Name is empty, will not set v_meta_type_name and v_meta_type_id");
            }
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
                metaTypeListTitle  = document.getElementById('group-title-text'),
                metaTypeList       = document.getElementById('group-list');
            if (Util.notEmpty(metaTypeListTitle)) {
                metaTypeListTitle.innerText = 'Fields';
            }
            DataAccess.metaType.getAll(function (tx, result, arrays) {
                var key, name, id, desc, item;
                for (key in arrays) {
                    if (arrays.hasOwnProperty(key)) {
                        name = arrays[key][Sql.MetaType.Cols.Name];
                        id   = arrays[key][Sql.MetaType.Cols.Id];
                        desc = arrays[key][Sql.MetaType.Cols.Description];
                        item = document.createElement('div');
                        item.setAttribute('data-bb-type', 'item');
                        item.setAttribute('data-bb-style', 'stretch');
                        if (id !== null && name !== SeedData.GtdMetaTypeName) {
                            item.setAttribute('id', 'meta_type-' + id);
                            if (name !== null) {
                                item.setAttribute('title', name);
                                item.setAttribute('data-bb-title', name);
                            }
                            item.setAttribute(
                                'onclick',
                                "UIListController.fillMetaListToPanel('" + id + "', '" + UIConfig.metaByPagePrefix + "');Util.switchPanelWidth('" + UIConfig.leftPanelWidth + "', '" + UIConfig.rightPanelWidth + "', '" + UIConfig.rightPanelSmallerLeftMargin + "');"
                            );
                            metaTypeList.appendItem(item);
                        }
                    }
                }
                setGroupPanelEmptyHeight();
            }, function (tx, error) {
                log.logSqlError("Error getting all meta type", error);
            });
        },

        fillMetaToCreateForm : function (meta_type_id) {
            DataAccess.metaType.getById(meta_type_id, function (tx, result, objs) {
                Util.setValue('meta_type_id', objs[0][Sql.MetaType.Cols.Id]);
                Util.setValue('meta_type_name', objs[0][Sql.MetaType.Cols.Name]);
            });
        },

        addTaskToList : function (id, name, project, contexts, dueDate) {
            var item, taskList = document.getElementById(UIConfig.detailListElementId),
                items = taskList.getItems();
            item = createItemElement(id, name, project, contexts, dueDate);
            if (0 === items.length) {
                taskList.innerHTML = UIConfig.emptyString;
                taskList.appendItem(item);
            } else if (items.length > 0) {
                taskList.appendItem(item);
            }
        },

        fillMetaListToPanel : function (metaTypeId, pageType) {
            var metaTypeName, metaList, metaTypeInternal,
                detailAddNewLink = document.getElementById('detail-add-new-link'),
                groupAddNewLink  = document.getElementById('group-title-add-new-link'),
                metaListTitle    = document.getElementById('group-title-text');
            metaList = getMetaListElement(pageType);
            metaList.clear();
            DataAccess.metaType.getById(metaTypeId, function (tx, result, objs) {
                if (Util.notEmpty(objs) && Util.notEmpty(objs[0])) {
                    metaTypeName     = objs[0][Sql.MetaType.Cols.Name];
                    metaTypeInternal = objs[0][Sql.MetaType.Cols.Internal];
                    if (UIConfig.metaByPagePrefix === pageType) {
                        detailAddNewLink.innerText = 'Add New ' + metaTypeName;
                    } else if (UIConfig.taskByPagePrefix === pageType && 0 === metaTypeInternal) {
                        groupAddNewLink.innerText = '+';
                    } else if (UIConfig.taskByPagePrefix === pageType && 1 === metaTypeInternal) {
                        groupAddNewLink.innerText = '+';
                        groupAddNewLink.style.backgroundColor = '#EEE';
                        groupAddNewLink.style.color = '#EEE';
                        groupAddNewLink.onclick = function () {
                        };
                    }
                    if (Util.notEmpty(metaListTitle)) {
                        metaListTitle.innerText = metaTypeName;
                    } else {
                        console.warn("Element with id[%s] is null, failed to set innerText to [%s]", 'group-title-text', metaTypeName);
                    }
                    metaList.appendItem(makeMetaTypeDefaultList(metaTypeName));
                    Util.setValue('v_meta_type_id', metaTypeId);
                    Util.setValue('v_meta_type_name', metaTypeName);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting meta type[" + metaTypeId + "], pageType:[" + pageType + "]", error);
            });
            DataAccess.meta.getByTypeId(metaTypeId, function (tx, result, arrays) {
                var key, name, id, desc, item;
                for (key in arrays) {
                    if (arrays.hasOwnProperty(key)) {
                        name = arrays[key][Sql.Meta.Cols.Name];
                        id   = arrays[key][Sql.Meta.Cols.Id];
                        desc = arrays[key][Sql.Meta.Cols.Description];
                        item = document.createElement('div');
                        item.setAttribute('data-bb-type', 'item');
                        item.setAttribute('data-bb-style', 'stretch');
                        if (id !== null) {
                            item.setAttribute('id', 'meta-' + id);
                            if (name !== null) {
                                item.setAttribute('title', name);
                                item.setAttribute('data-bb-title', name);
                            }
                            if (UIConfig.taskByPagePrefix === pageType) {
                                item.setAttribute(
                                    'onclick',
                                    "UIListController.fillTasksToGroupByMetaInfo('" + metaTypeName + "', '" + name + "');Util.switchPanelWidth('" + UIConfig.leftPanelWidth + "', '" + UIConfig.rightPanelWidth + "', '" + UIConfig.rightPanelSmallerLeftMargin + "');"
                                );
                            } else if (UIConfig.metaByPagePrefix === pageType) {
                                if (desc !== null && desc !== undefined) {
                                    item.innerHTML = desc;
                                }
                                item.setAttribute(
                                    'onclick',
                                    "document.getElementById('meta-operation-context-menu').menu.peek({ title : '" + name + "', description : '" + metaTypeName + "', selected : '" + id + "'});"
                                );
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

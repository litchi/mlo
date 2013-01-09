/*jslint browser: true */
/*global u, dataAccess, SQL, seedData, bb, log, console, uiConfig*/
"use strict";
function switchPanelWidth(groupWidth, taskWidth, taskLeft) {
    if (document.getElementById('group').style.width !== groupWidth) {
        document.getElementById('group').style.width = groupWidth;
        document.getElementById(uiConfig.detailListPanelElementId).style.width = taskWidth;
        document.getElementById(uiConfig.detailListPanelElementId).style.left = taskLeft + 'px';
    }
}

function createItemElement(id, name, project, contexts, dueDate) {
    var innerContent = uiConfig.emptyString, item = document.createElement('div'),
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
            innerContent = innerContent + "\n<span class='" + dueClass + "'>" + u.getPrettyDateStr(ld) + "</span>";
        }
        item.innerHTML = innerContent;
        item.onclick = function () {
            document.getElementById('task-operation-context-menu').menu.show({
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
function addTaskToList(id, name, project, contexts, dueDate) {
    var item, taskList = document.getElementById(uiConfig.detailListElementId),
        items = taskList.getItems();
    item = createItemElement(id, name, project, contexts, dueDate);
    if (0 === items.length) {
        taskList.innerHTML = uiConfig.emptyString;
        taskList.appendItem(item);
    } else if (items.length > 0) {
        taskList.appendItem(item);
    }
}

function tasksFromDbToUI(tasks, taskList) {
    var key, id, name, i, max;
    taskList.clear();
    if (null === tasks || undefined === tasks || 0 === tasks.length) {
        taskList.innerHTML = uiConfig.msgForNoTask;
    } else {
        for (key in tasks) {
            if (tasks.hasOwnProperty(key)) {
                name = tasks[key][SQL.TASK.COLS.NAME];
                id   = tasks[key][SQL.TASK.COLS.ID];
                dataAccess.appDb.transaction(
                    (function (id, name) {
                        return function (tx) {
                            dataAccess.runSqlDirectly(
                                tx,
                                'select meta_name, meta_type_name, task_reminder_time from task_view where task_id = ?',
                                [id],
                                function (tx, result) {
                                    var context = [], project = null, mt = null, rt = null, obj;
                                    for (i = 0, max = result.rows.length; i < max; i += 1) {
                                        obj = result.rows.item(i);
                                        mt = obj.meta_type_name;
                                        if (seedData.contextMetaTypeName === mt) {
                                            context.push(obj.meta_name);
                                        } else if (seedData.projectMetaTypeName === mt) {
                                            project = obj.meta_name;
                                        }
                                        if (null === rt) {
                                            rt = obj.task_reminder_time;
                                        }
                                    }
                                    addTaskToList(id, name, project, context, rt);
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

function setMetaTypeFields(metaTypeName) {
    dataAccess.metaType.getByName(metaTypeName, function (tx, result, resultObj) {
        u.setValue('v_meta_type_name', metaTypeName);
        if (null !== resultObj && (resultObj.length > 0) &&
                null !== resultObj[0] && null !== resultObj[0][SQL.META.COLS.ID]) {
            u.setValue('v_meta_type_id', resultObj[0][SQL.META_TYPE.COLS.ID]);
        } else {
            console.warn("Meta Type with name '%s' not found", metaTypeName);
        }
    }, function (tx, error) {
        log.logSqlError("Error getting metaType[" + metaTypeName + "]", error);
    });
}

function setMetaFields(metaName) {
    dataAccess.meta.getByName(metaName, function (tx, result, resultObj) {
        u.setValue('v_meta_name', metaName);
        if (null !== resultObj && (resultObj.length > 0) &&
                null !== resultObj[0] && null !== resultObj[0][SQL.META.COLS.ID]) {
            u.setValue('v_meta_id', resultObj[0][SQL.META.COLS.ID]);
        } else {
            console.warn("Meta with name '%s' not found", metaName);
        }
    }, function (tx, error) {
        log.logSqlError("Error getting meta[" + metaName + "]", error);
    });
}


function makeAllTasksItem(metaTypeName) {
    var item = document.createElement('div');
    item.setAttribute('data-bb-type', 'item');
    item.setAttribute('data-bb-style', 'stretch');
    item.setAttribute('title', 'All Tasks');
    item.setAttribute('data-bb-title', 'All Tasks');
    item.setAttribute(
        'onclick',
        "fillTasksToGroupByMetaInfo('" + metaTypeName + "', '" + uiConfig.emptyString + "');switchPanelWidth('" + uiConfig.leftPanelWidth + "', '" + uiConfig.rightPanelWidth + "', '" + uiConfig.rightPanelSmallerLeftMargin + "');"
    );
    return item;
}

function fillMetaListToPanel(metaTypeId, pageType) {
    var metaTypeName,
        addNewLink      = document.getElementById('add-new-link'),
        metaListTitle   = document.getElementById('meta-type-name-title'),
        metaList        = document.getElementById('meta-list');
    metaList.clear();
    dataAccess.metaType.getById(metaTypeId, function (tx, result, objs) {
        if (objs !== null && objs !== undefined && objs[0] !== undefined) {
            metaTypeName = objs[0][SQL.META_TYPE.COLS.NAME];
            if (null !== addNewLink && undefined !== addNewLink) {
                addNewLink.innerText = 'Add New ' + metaTypeName;
            }
            if (null !== metaListTitle && undefined !== metaListTitle) {
                metaListTitle.innerText = metaTypeName;
            }
            if (uiConfig.taskByPagePrefix === pageType) {
                metaList.appendItem(makeAllTasksItem(metaTypeName));
            }
            u.setValue('v_meta_type_id', metaTypeId);
            u.setValue('v_meta_type_name', metaTypeName);
        }
    }, function (tx, error) {
        log.logSqlError("Error getting meta type[" + metaTypeId + "], pageType:[" + pageType + "]", error);
    });
    dataAccess.meta.getByTypeId(metaTypeId, function (tx, result, arrays) {
        var key, name, id, desc, item;
        for (key in arrays) {
            if (arrays.hasOwnProperty(key)) {
                name = arrays[key][SQL.META.COLS.NAME];
                id   = arrays[key][SQL.META.COLS.ID];
                desc = arrays[key][SQL.META.COLS.DESCRIPTION];
                item = document.createElement('div');
                item.setAttribute('data-bb-type', 'item');
                item.setAttribute('data-bb-style', 'stretch');
                if (id !== null) {
                    item.setAttribute('id', 'meta-' + id);
                    if (name !== null) {
                        item.setAttribute('title', name);
                        item.setAttribute('data-bb-title', name);
                    }
                    if (uiConfig.taskByPagePrefix === pageType) {
                        item.setAttribute(
                            'onclick',
                            "fillTasksToGroupByMetaInfo('" + metaTypeName + "', '" + name + "');switchPanelWidth('" + uiConfig.leftPanelWidth + "', '" + uiConfig.rightPanelWidth + "', '" + uiConfig.rightPanelSmallerLeftMargin + "');"
                        );
                    } else if (uiConfig.metaByPagePrefix === pageType) {
                        if (desc !== null && desc !== undefined) {
                            item.innerHTML = desc;
                        }
                        item.setAttribute(
                            'onclick',
                            "document.getElementById('meta-operation-context-menu').menu.show({ title : '" + name + "', description : '" + metaTypeName + "', selected : '" + id + "'});"
                        );
                    }
                    metaList.appendItem(item);
                }
            }
        }
    }, function (tx, error) {
        log.logSqlError("Error getting meta list[" + metaTypeId + "]", error);
    });
}

function fillMetaListToPanelByTypeName(metaTypeName, pageType) {
    dataAccess.metaType.getByName(metaTypeName, function (tx, result, objs) {
        if (null !== objs && undefined !== objs && objs.length > 0 && null !== objs[0] && undefined !== objs[0]) {
            fillMetaListToPanel(objs[0][SQL.META_TYPE.COLS.ID], pageType);
        } else {
            console.warn("Meta type with name[%s] was not found on page type[%s]", metaTypeName, pageType);
        }
    }, function (tx, error) {
        log.logSqlError("Error getting meta type[" + metaTypeName + "], pageType: [" + pageType + "]", error);
    });
}
function fillMetaTypeToPanel() {
    var item, name,
        metaTypeList = document.getElementById('meta-type-list');
    dataAccess.metaType.getAll(function (tx, result, arrays) {
        var key, name, id, desc, item;
        for (key in arrays) {
            if (arrays.hasOwnProperty(key)) {
                name = arrays[key][SQL.META_TYPE.COLS.NAME];
                id   = arrays[key][SQL.META_TYPE.COLS.ID];
                desc = arrays[key][SQL.META_TYPE.COLS.DESCRIPTION];
                item = document.createElement('div');
                item.setAttribute('data-bb-type', 'item');
                item.setAttribute('data-bb-style', 'stretch');
                if (id !== null && name !== seedData.gtdMetaTypeName) {
                    item.setAttribute('id', 'meta_type-' + id);
                    if (name !== null) {
                        item.setAttribute('title', name);
                        item.setAttribute('data-bb-title', name);
                    }
                    item.setAttribute(
                        'onclick',
                        "fillMetaListToPanel('" + id + "', '" + uiConfig.metaByPagePrefix + "');switchPanelWidth('" + uiConfig.leftPanelWidth + "', '" + uiConfig.rightPanelWidth + "', '" + uiConfig.rightPanelSmallerLeftMargin + "');"
                    );
                    metaTypeList.appendItem(item);
                }
            }
        }
    }, function (tx, error) {
        log.logSqlError("Error getting all meta type", error);
    });
}

function fillMetaToEditForm(id) {
    if (id !== null && id !== undefined) {
        dataAccess.meta.getById(id, function (tx, results, arrays) {
            log.logObjectData("Meta", arrays[0], dataAccess.logQueryResult);
            u.setValue(SQL.META.COLS.ID, arrays[0][SQL.META.COLS.ID]);
            u.setValue('meta_name', arrays[0][SQL.META.COLS.NAME]);
            u.setValue(SQL.META.COLS.DESCRIPTION, arrays[0][SQL.META.COLS.DESCRIPTION]);
            dataAccess.metaType.getById(arrays[0][SQL.META.COLS.META_TYPE_ID], function (tx, result, objs) {
                u.setValue('meta_type_id', objs[0][SQL.META_TYPE.COLS.ID]);
                u.setValue('meta_type_name', objs[0][SQL.META_TYPE.COLS.NAME]);
            });
        }, function (tx, error) {
            log.logSqlError("Error getting meta with id[" + id + "]", error);
        });
    }
}
function fillMetaToCreateForm(meta_type_id) {
    dataAccess.metaType.getById(meta_type_id, function (tx, result, objs) {
        u.setValue('meta_type_id', objs[0][SQL.META_TYPE.COLS.ID]);
        u.setValue('meta_type_name', objs[0][SQL.META_TYPE.COLS.NAME]);
    });
}

function fillTasksToGroupByMetaInfo(metaTypeName, metaName) {
    var id, name, taskList = document.getElementById(uiConfig.detailListElementId);
    if (uiConfig.emptyString !== metaName) {
        dataAccess.task.getByMeta(metaTypeName, metaName, function (transaction, results, arrays) {
            tasksFromDbToUI(arrays, taskList);
        });
    } else {
        dataAccess.task.getByMetaType(metaTypeName, function (transaction, results, arrays) {
            tasksFromDbToUI(arrays, taskList);
        });
    }
    if (uiConfig.emptyString !== metaName) {
        setMetaFields(metaName);
    } else {
        console.debug("Meta Name is empty, will not set v_meta_name and v_meta_id");
    }
    if (uiConfig.emptyString !== metaTypeName) {
        setMetaTypeFields(metaTypeName);
    } else {
        console.warn("Meta Type Name is empty, will not set v_meta_type_name and v_meta_type_id");
    }
}

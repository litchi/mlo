/*jslint browser: true */
/*global DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util, UIContextMenuUtil, UITaskUtil, UIMetaUtil*/
var UIListController = (function () {
    "use strict";

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

    function fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback) {
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
                        uiId = UIMetaUtil.getMetaUiId(id);
                        item.setAttribute('id', uiId);
                        if (name !== null) {
                            item.setAttribute('title', '<span class="master-title">' + name + '</span>');
                        }
                        if (UIConfig.taskByPagePrefix === pageType) {
                            item.setAttribute('data-bb-title',  '<span class="master-title">' + name + '</span>' + UITaskUtil.decorateTaskNumber(taskNumbers, name));
                            item.setAttribute(
                                'onclick',
                                "UIListController.fillTaskAndMarkGroup('" + uiId + "', '" + metaTypeName + "','" + name + "')"
                            );
                        } else if (UIConfig.metaByPagePrefix === pageType) {
                            item.setAttribute('data-bb-title', '<span class="detail-title">' + name + '</span>');
                            UIContextMenuUtil.setMetaContextMenuAction(item, metaTypeName, id, name, desc);
                        }
                        metaList.appendItem(item);
                    }
                }
            }
            if (Util.isFunction(callback)) {
                callback();
            }
            setGroupPanelEmptyHeight();
        }, function (tx, error) {
            log.logSqlError("Error getting meta list[" + metaTypeId + "]", error);
        });
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

    function showPlusShortcut(elem) {
        elem.innerText = '+';
        elem.className = 'group-title-add-new-link-show';
        elem.onclick = function () {
            bb.pushScreen('edit-meta.html', UIConfig.createMetaPagePrefix, {'metaTypeId' : Util.valueOf('v_meta_type_id')});
        };
    }

    function hidePlusShortcut(elem) {
        elem.innerText = '+';
        elem.className = 'group-title-add-new-link-hide';
        elem.onclick = function () {};
    }

    return {

        fillTaskAndMarkGroupNoId : function (metaTypeName, filter) {
            DataAccess.appDb.transaction(function (tx) {
                DataAccess.runSqlDirectly(tx, "select id from meta where name = ?",
                    [filter], function (tx, result, objs) {
                        var key, id;
                        for (key in objs) {
                            if (objs.hasOwnProperty(key)) {
                                id   = objs[key][Sql.Meta.Cols.Id];
                                UIListController.fillTaskAndMarkGroup(UIMetaUtil.getMetaUiId(id), metaTypeName, filter);
                            }
                        }
                    });
            }, function (tx, error) {
                log.logSqlError("Error getting all meta list", error);
            });
        },

        fillTaskAndMarkGroup : function (uiId, metaTypeName, filter) {
            if (Util.notEmpty(document.getElementById('selected-group-item'))) {
                document.getElementById('selected-group-item').setAttribute('id', Util.valueOf('v_curr_hl_item'));
            }
            document.getElementById(uiId).setAttribute('id', 'selected-group-item');
            document.getElementById('v_curr_hl_item').value = uiId;
            UIListController.fillTasksToGroupByMetaInfo(metaTypeName, filter);
            Util.switchPanelWidth(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin);
        },

        fillMetaListMarkTypeAsSelected : function (uiId) {
            if (Util.notEmpty(document.getElementById('selected-group-item'))) {
                document.getElementById('selected-group-item').setAttribute('id', Util.valueOf('v_curr_hl_item'));
            }
            document.getElementById(uiId).setAttribute('id', 'selected-group-item');
            document.getElementById('v_curr_hl_item').value = uiId;
            UIListController.fillMetaListToPanel(uiId, UIConfig.metaByPagePrefix);
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
            UIContextMenuUtil.filterContextMenu(UIConfig.taskContextMenu);
            if (SeedData.DueMetaTypeName === metaTypeName) {
                DataAccess.task.getByDueMeta(metaName, function (tx, result, arrays) {
                    UITaskUtil.tasksFromDbToUI(arrays, taskList);
                });
            } else {
                if (Sql.FilterAllMeta !== metaName) {
                    DataAccess.task.getByMeta(metaTypeName, metaName, function (transaction, results, arrays) {
                        UITaskUtil.tasksFromDbToUI(arrays, taskList);
                    });
                } else {
                    DataAccess.task.getByMetaType(metaTypeName, function (transaction, results, arrays) {
                        UITaskUtil.tasksFromDbToUI(arrays, taskList);
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
                UIMetaUtil.setMetaFields(metaName);
            } else {
                UIMetaUtil.setMetaFields(SeedData.BasketMetaName);
            }
            if (UIConfig.emptyString !== metaTypeName) {
                UIMetaUtil.setMetaTypeFields(metaTypeName);
            } else {
                console.warn("Meta Type Name is empty, will not set v_meta_type_name and v_meta_type_id");
            }
        },

        fillTasksToGroupByStatusKey: function (taskStatus) {
            var taskList = document.getElementById(UIConfig.detailListElementId);
            UIContextMenuUtil.filterContextMenu(UIConfig.trashBoxContextMenu);
            DataAccess.task.getByStatus(taskStatus, function (tx, result, arrays) {
                UITaskUtil.tasksFromDbToUI(arrays, taskList);
            });
        },

        fillMetaListToPanelByTypeName : function (metaTypeName, pageType, callback) {
            DataAccess.metaType.getByName(metaTypeName, function (tx, result, objs) {
                if (null !== objs && undefined !== objs && objs.length > 0 && null !== objs[0] && undefined !== objs[0]) {
                    UIListController.fillMetaListToPanel(objs[0][Sql.MetaType.Cols.Id], pageType, callback);
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
            UIContextMenuUtil.filterContextMenu(UIConfig.metaContextMenu);
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
                                item.setAttribute('title', '<span class="master-title">' + name + '</span>');
                                item.setAttribute('data-bb-title', '<span class="master-title">' + name + '</span>');
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
            item = UITaskUtil.createTaskItemElement(id, name, project, contexts, dueDate);
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
            metaList = UIMetaUtil.getMetaListElement(pageType);
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
                                    item.setAttribute('id', UIMetaUtil.getMetaUiId(id));
                                    if (Util.notEmpty(name)) {
                                        item.setAttribute('title', '<span class="detail-title">' + metaTypeName + ": " + name + '</span>');
                                        item.setAttribute('data-bb-title', '<span class="detail-title">' + metaTypeName + ": " + name + '</span>');
                                    }
                                    UIContextMenuUtil.setMetaContextMenuAction(item, metaTypeName, id, name, desc);
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

        fillMetaListToPanel : function (metaTypeId, pageType, callback) {
            var metaTypeName, metaList, metaTypeInternal, taskNumbers,
                detailAddNewLink = document.getElementById('detail-add-new-link'),
                groupAddNewLink  = document.getElementById('group-title-add-new-link'),
                metaListTitle    = document.getElementById('group-title-text');
            metaList = UIMetaUtil.getMetaListElement(pageType);
            metaList.innerHTML = UIConfig.emptyString;
            if (UIConfig.taskByPagePrefix === pageType) {
                UITaskUtil.getGroupedTaskNumber(metaTypeId, function (result) {
                    taskNumbers = result;
                });
            }
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
                        fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback);
                    } else if (UIConfig.taskByPagePrefix === pageType) {
                        UIMetaUtil.makeMetaTypeDefaultList(metaTypeName, function (defaultItem) {
                            metaList.appendItem(defaultItem);
                            fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback);
                        });
                        if (0 === metaTypeInternal) {
                            showPlusShortcut(groupAddNewLink);
                        } else if (1 === metaTypeInternal) {
                            hidePlusShortcut(groupAddNewLink);
                        }
                        if (Util.notEmpty(metaListTitle)) {
                            metaListTitle.innerText = metaTypeName;
                        } else {
                            console.warn("Element with id[%s] is null, failed to set innerText to [%s]", 'group-title-text', metaTypeName);
                        }
                    }
                    Util.setValue('v_meta_type_id', metaTypeId);
                    Util.setValue('v_meta_type_name', metaTypeName);
                }
            }, function (tx, error) {
                log.logSqlError("Error getting meta type[" + metaTypeId + "], pageType:[" + pageType + "]", error);
            });
        }

    };
}());

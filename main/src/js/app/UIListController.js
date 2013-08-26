/*jslint browser: true */
/*global TaskModel, DataAccess, Sql, SeedData, bb, log, console, UIConfig, UIFragments, Util, UIContextMenuUtil, UITaskUtil, UIMetaUtil, $, JQuery*/
var UIListController = (function () {
    "use strict";

    function setGroupPanelEmptyHeight(numberOfMeta) {
        var height, heightString, metaListHeightByNumberOfMeta,
            groupParent      = document.getElementById('group'),
            metaListDiv      = document.getElementById('group-list'),
            metaListSpaceDiv = document.getElementById('group-space'),
            createTaskShortcutDiv = document.getElementById('create-task-shortcut');
        if (Util.notEmpty(groupParent) &&
                Util.notEmpty(metaListDiv) &&
                Util.notEmpty(metaListSpaceDiv) &&
                Util.notEmpty(createTaskShortcutDiv)) {
            metaListHeightByNumberOfMeta = ((numberOfMeta + 1) * 110);
            if (metaListHeightByNumberOfMeta < metaListDiv.style.height) {
                metaListDiv.style.height = metaListHeightByNumberOfMeta + 'px';
            }
            height = groupParent.offsetHeight - metaListDiv.offsetHeight;
            if (Util.isQ10()) {
                height = height < 55 ? 55 : height;
            } else if (Util.isZ10()) {
                height = height < 110 ? 110 : height;
            }
            heightString = height + 'px';
            metaListSpaceDiv.style.height = heightString;
            metaListSpaceDiv.innerHTML = UIConfig.rightArrow;
            metaListSpaceDiv.style.lineHeight = heightString;
        }
    }

    function fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback) {
        DataAccess.meta.getByTypeId(metaTypeId, function (tx, result, arrays) {
            var key, name, id, desc, item, uiId, numberOfMeta = 0;
            for (key in arrays) {
                if (arrays.hasOwnProperty(key)) {
                    name = arrays[key][Sql.Meta.Cols.Name];
                    id   = arrays[key][Sql.Meta.Cols.Id];
                    desc = arrays[key][Sql.Meta.Cols.Description];
                    numberOfMeta += 1;
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
            setGroupPanelEmptyHeight(numberOfMeta);
        }, function (tx, error) {
            log.logSqlError("Error getting meta list[" + metaTypeId + "]", error);
        });
    }

    function setCreateTaskInputPlaceHolder(metaName, metaTypeName) {
        var placeholder = 'Create Task';
        if (Util.notEmpty(metaName) &&
                Sql.FilterAllMeta !== metaName &&
                SeedData.DueMetaTypeName !== metaTypeName) {
            if (SeedData.GtdMetaTypeName === metaTypeName) {
                placeholder = placeholder + ' on ' + metaName + ' list';
            } else {
                placeholder = placeholder + ' on ' + metaTypeName + ' ' + metaName;
            }
        } else {
            placeholder = placeholder + ' (Goes to Basket list)';
        }
        $("#create-task-placeholder").text(placeholder);
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
            Util.expandDetailPanel(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin);
        },

        fillMetaListMarkTypeAsSelected : function (uiId) {
            if (Util.notEmpty(document.getElementById('selected-group-item'))) {
                document.getElementById('selected-group-item').setAttribute('id', Util.valueOf('v_curr_hl_item'));
            }
            if (Util.notEmpty(uiId) && Util.notEmpty(document.getElementById(uiId))) {
                document.getElementById(uiId).setAttribute('id', 'selected-group-item');
                document.getElementById('v_curr_hl_item').value = uiId;
                UIListController.fillMetaListToPanel(uiId, UIConfig.metaByPagePrefix);
            }
            Util.expandDetailPanel(UIConfig.leftPanelWidth, UIConfig.rightPanelWidth, UIConfig.rightPanelSmallerLeftMargin);
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

        fillMetaTypeToPanel : function (metaTypeId) {
            var item, name,
                metaTypeListTitle  = document.getElementById('group-title-text'),
                metaTypeList       = document.getElementById('group-list');
            if (Util.notEmpty(metaTypeListTitle)) {
                metaTypeListTitle.innerText = 'Fields';
            }
            DataAccess.metaType.getAll(function (tx, result, arrays) {
                var index = 0, key, name, id, desc, item, internal, uiId, titleParent, titleSpan, addIcon;
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
                                addIcon = document.createElement('span');
                                addIcon.innerText = '+';
                                addIcon.setAttribute('class', 'list-task-number');
                                $('<div id="add-meta-link-' + name + '"></div>').appendTo($('#group-list')).css({
                                    'position' : 'absolute',
                                    'top' : (25 + index * 110) + 'px',
                                    'left' :  '140px',
                                    'z-index' : '200'
                                }).click(function (id) {
                                    return function () {
                                        bb.pushScreen('edit-meta.html', UIConfig.createMetaPagePrefix, {'metaTypeId' : id});
                                    };
                                } (id)).append(addIcon);

                                titleParent = document.createElement('div');
                                titleSpan = document.createElement('span');
                                titleSpan.setAttribute('class', 'master-title');
                                titleSpan.innerText = name;
                                titleParent.appendChild(titleSpan);

                                item.setAttribute(
                                    'onclick',
                                    'UIListController.fillMetaListMarkTypeAsSelected(\'' + id + '\');'
                                );
                                item.setAttribute('title', titleParent.innerHTML);
                                item.setAttribute('data-bb-title', titleParent.innerHTML);
                            }
                            metaTypeList.appendItem(item);
                        }
                        index += 1;
                    }
                }
                setCreateTaskInputPlaceHolder(UIConfig.emptyString, UIConfig.emptyString);
                setGroupPanelEmptyHeight();
		if (Util.notEmpty(metaTypeId)) {
                    UIListController.fillMetaListMarkTypeAsSelected(metaTypeId);
		}
            }, function (tx, error) {
                log.logSqlError("Error getting all meta type", error);
            });
        },

        fillMetaToCreateForm : function (meta_type_id) {
            $("#delete-meta-button-container").css('display','none');
            DataAccess.metaType.getById(meta_type_id, function (tx, result, objs) {
                var metaTypeName = objs[0][Sql.MetaType.Cols.Name], metaTypeId = objs[0][Sql.MetaType.Cols.Id];
                Util.setMetaDetailPageCaption('New ' + metaTypeName);
                Util.setValue('meta_type_id', metaTypeId);
                Util.setValue('meta_type_name', metaTypeName);
            });
        },

        addTaskToList : function (taskList, id, name, gtdListName, project, contexts, dueDate) {
            var item, items = taskList.getItems(), actualGtdListName = Util.emptyString;
            if (SeedData.BasketMetaName === gtdListName || SeedData.SomedayMetaName === gtdListName || SeedData.NextActionMetaName) {
                actualGtdListName = gtdListName;
            }
            item = UITaskUtil.createTaskItemElement(
                TaskModel.constructTaskObj(id, name, actualGtdListName, project, contexts,
                    dueDate, null, null, false)
            );
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


        fillMetaListToPanel : function (metaTypeId, pageType, callback) {
            var metaTypeName, metaTypeInternal, taskNumbers,
                metaList = UIMetaUtil.getMetaListElement(pageType);
            metaList.innerHTML = UIConfig.emptyString;
            DataAccess.metaType.getById(metaTypeId, function (tx, result, objs) {
                if (Util.notEmpty(objs) && Util.notEmpty(objs[0])) {
                    metaTypeName     = objs[0][Sql.MetaType.Cols.Name];
                    metaTypeInternal = objs[0][Sql.MetaType.Cols.Internal];
                    if (UIConfig.taskByPagePrefix === pageType) {
                        UITaskUtil.getGroupedTaskNumber(metaTypeName, function (result) {
                            taskNumbers = result;
                        });
                    }
                    if (UIConfig.metaByPagePrefix === pageType) {
                        fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback);
                    } else if (UIConfig.taskByPagePrefix === pageType) {
                        UIMetaUtil.makeMetaTypeDefaultList(metaTypeName, function (defaultItem) {
                            metaList.appendItem(defaultItem);
                            fillMetaInternal(metaTypeId, metaTypeName, metaList, pageType, taskNumbers, callback);
                        });
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

function switchPanelWidth(groupWidth,taskWidth,taskLeft) {
    document.getElementById('group').style.width=groupWidth;
    document.getElementById(uiConfig.detailListPanelElementId).style.width=taskWidth;
    document.getElementById(uiConfig.detailListPanelElementId).style.left=taskLeft + 'px';
}

//TODO Optimize, first construct a document fragment and then append it to the element.
function addTaskToList (id, name, project, tags) {
    var item, taskList = document.getElementById(uiConfig.detailListElementId); 
    var items = taskList.getItems();
    item = createItemElement(id, name, project, tags);
    if(0 == items.length){
        taskList.innerHTML = uiConfig.emptyString;
        taskList.appendItem(item);
    } else if(items.length > 0){
        if(items[0] != undefined){
            taskList.insertItemBefore(item, items[0]);
        } else {
            taskList.appendItem(item);
        }
    }
}

function fillTasksToGroupByMetaInfo (metaTypeName, metaName) {
    var id, name, taskList = document.getElementById(uiConfig.detailListElementId);
    dataAccess.task.getByMeta(metaTypeName, metaName, function(transaction, results, arrays){
        if(null == arrays || undefined == arrays || 0 == arrays.length){
            taskList.innerHTML = uiConfig.msgForNoTask;
        } else {
            document.getElementById(uiConfig.detailListElementId).clear();
            for(var key in arrays) {   
                name = arrays[key][SQL.TASK.COLS.NAME];
                id   = arrays[key][SQL.TASK.COLS.ID];
                addTaskToList(id, name, null, null);    
            }
        }
    }, function(transaction, error){
        log.logSqlError("Error getting meta[" + metaName + "] and type[" + metaTypeName + "]", error);
    });
    //TODO Application level cache support
    //TODO Performance optimize
    dataAccess.meta.getByName(metaName, function(tx, result, resultObj){
        u.setValue('v_meta_name', metaName);
        u.setValue('v_meta_id', resultObj[0][SQL.META.COLS.ID]);
    }, function(tx, error){
        log.logSqlError("Error getting meta[" + metaName + "]", error);    
    });
    dataAccess.metaType.getByName(metaTypeName, function(tx, result, resultObj){
        u.setValue('v_meta_type_name', metaTypeName);
        u.setValue('v_meta_type_id', resultObj[0][SQL.META_TYPE.COLS.ID]);
    }, function(tx, error){
        log.logSqlError("Error getting metaType[" + metaTypeName + "]", error);    
    });
}

function createItemElement(id, name, project, tags) {
    var item = document.createElement('div');
    item.setAttribute('data-bb-type','item');
    item.setAttribute('data-bb-style','stretch');
    if(id != null) {
        item.setAttribute('id', 'task-' + id);
        if(project != null){
            item.setAttribute('data-bb-accent-text', project);
        }
        if (name != null) {                     
            item.setAttribute('title', name);
            item.setAttribute('data-bb-title',name);
        }
        if (tags != null) {
            item.innerText = tags;
        }
        item.onclick = function() {
            document.getElementById('task-operation-context-menu').menu.show({
                title:'Edit Task',
                description : name, 
                selected : id,
            });
        };    
    }
    return item;
}

function fillTaskToEditForm(id){
    var projectSelect, obj, option;
    projectSelect = document.createElement('select');
    projectSelect.setAttribute('id', seedData.projectMetaTypeName);
    projectSelect.setAttribute('data-bb-label','> ');
    u.appendOption(projectSelect, 0, 'No Project');
    dataAccess.task.getById(id, function(tx, result, arrays) {
        u.setValue('task-id', id);
        u.setValue('task-name', arrays[0][SQL.TASK.COLS.NAME]);
        dataAccess.appDb.transaction(function(tx){
            dataAccess.runSqlDirectly(
                tx,
                "select meta_id, meta_name from meta_view where meta_type_name = ?", 
                [seedData.projectMetaTypeName], 
                function(tx, result){
                    if(undefined != projectSelect && null != result.rows && result.rows.length > 0){
                        for(i = 0, max = result.rows.length; i < max; i++){
                            obj = result.rows.item(i);
                            if(null != obj){
                                u.appendOption(projectSelect, obj['meta_id'], obj['meta_name']);
                            }
                        }
                    }
                    projectSelect = bb.dropdown.style(projectSelect);
                    document.getElementById('projectContainer').appendChild(projectSelect);
                    bb.refresh();
                }
            );
        });

        dataAccess.appDb.transaction(function(tx){
            dataAccess.runSqlDirectly(
                tx,
                "select distinct meta_name from task_view where task_id = ? and meta_type_name = ?",
                [id, seedData.projectMetaTypeName],
                function(tx, result){
                    if(null != result && null!= result.rows && result.rows.length > 0 && 
                        null != result.rows && null != result.rows.item && null != result.rows.item(0) &&
                        null != result.rows.item(0)['meta_name']){
                            document.getElementById(seedData.projectMetaTypeName).setSelectedText(result.rows.item(0)['meta_name']);                
                        }    
                }
            );
        });
    }, function(tx, error) {
        log.logSqlError("Error filling task[" + id + "] to edit form", error);
    });
}

function fillMetaListToPanel(metaTypeId, pageType){
    var metaTypeName,
        addNewLink      = document.getElementById('add-new-link'),
        metaListTitle   = document.getElementById('meta-type-name-title'),
        metaList        = document.getElementById('meta-list');
    metaList.clear();
    dataAccess.metaType.getById(metaTypeId, function(tx, result, objs){
        if(objs != null && objs != undefined && objs[0] != undefined){
            metaTypeName = objs[0][SQL.META_TYPE.COLS.NAME];
            if(null != addNewLink && undefined != addNewLink){
                addNewLink.innerText = 'Add New ' + metaTypeName;
            }
            if(null != metaListTitle && undefined != metaListTitle){
                metaListTitle.innerText= metaTypeName;
            }
            u.setValue('v_meta_type_id', metaTypeId);
            u.setValue('v_meta_type_name', metaTypeName);
        }
    }, function(tx, error){
        log.logSqlError("Error getting meta type[" + metaTypeId + "], pageType:[" + pageType + "]", error);
    });
    dataAccess.meta.getByTypeId(metaTypeId, function(tx, result, arrays){
        for(var key in arrays){   
            name = arrays[key][SQL.META.COLS.NAME];
            id   = arrays[key][SQL.META.COLS.ID];
            desc = arrays[key][SQL.META.COLS.DESCRIPTION];
            var item = document.createElement('div');
            item.setAttribute('data-bb-type','item');
            item.setAttribute('data-bb-style','stretch');
            if(id != null) {
                item.setAttribute('id', 'meta-' + id);
                if (name != null) {                     
                    item.setAttribute('title', name);
                    item.setAttribute('data-bb-title',name);
                }
                if(uiConfig.taskByPagePrefix == pageType){ 
                    item.setAttribute(
                        'onclick',
                        "fillTasksToGroupByMetaInfo('" + metaTypeName + "', '" + name + "');switchPanelWidth('" + uiConfig.leftPanelWidth + "', '" + uiConfig.rightPanelWidth +"', '" + uiConfig.rightPanelSmallerLeftMargin +"');"
                    );
                } else if (uiConfig.metaByPagePrefix == pageType){
                    if(desc != null && desc != undefined){
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
    }, function(tx, error){
        log.logSqlError("Error getting meta list[" + metaTypeId + "]", error);
    });
}

function fillMetaListToPanelByTypeName(metaTypeName, pageType){
    dataAccess.metaType.getByName(metaTypeName, function(tx, result, objs){
        fillMetaListToPanel(objs[0][SQL.META_TYPE.COLS.ID], pageType);
    }, function(tx, error){
        log.logSqlError("Error getting meta type[" + metaTypeName + "], pageType: [" + pageType + "]", error);
    })
}
function fillMetaTypeToPanel (){
    var item, name;
    metaTypeList = document.getElementById('meta-type-list');
    dataAccess.metaType.getAll(function(tx, result, arrays){
        for(var key in arrays){   
            name = arrays[key][SQL.META_TYPE.COLS.NAME];
            id   = arrays[key][SQL.META_TYPE.COLS.ID];
            desc = arrays[key][SQL.META_TYPE.COLS.DESCRIPTION];
            item = document.createElement('div');
            item.setAttribute('data-bb-type','item');
            item.setAttribute('data-bb-style','stretch');
            if(id != null && name != 'GTD') {
                item.setAttribute('id', 'meta_type-' + id);
                if (name != null) {                     
                    item.setAttribute('title', name);
                    item.setAttribute('data-bb-title',name);
                }
                item.setAttribute(
                    'onclick', 
                    "fillMetaListToPanel('" + id + "', '" + uiConfig.metaByPagePrefix + "');switchPanelWidth('" + uiConfig.leftPanelWidth + "', '" + uiConfig.rightPanelWidth +"', '" + uiConfig.rightPanelSmallerLeftMargin +"');"
                );
                metaTypeList.appendItem(item);
            }
        }
    }, function(tx, error){
        logSqlError("Error getting all meta type", error);
    });
}

function fillMetaToEditForm(id){
    if(id != null && id != undefined){
        dataAccess.meta.getById(id, function(tx, results, arrays){
            log.logObjectData("Meta", arrays[0], true);
            u.setValue(SQL.META.COLS.ID, arrays[0][SQL.META.COLS.ID]);
            u.setValue(SQL.META.COLS.NAME, arrays[0][SQL.META.COLS.NAME]);
            u.setValue(SQL.META.COLS.DESCRIPTION, arrays[0][SQL.META.COLS.DESCRIPTION]);
            dataAccess.metaType.getById(arrays[0][SQL.META.COLS.META_TYPE_ID], function(tx,result, objs){
                u.setValue('meta_type_id'   , objs[0][SQL.META_TYPE.COLS.ID]);
                u.setValue('meta_type_name' , objs[0][SQL.META_TYPE.COLS.NAME]);
            });
        }, function(tx, error) {
            log.logSqlError("Error getting meta with id[" + id + "]", error);
        });
    }
}
function fillMetaToCreateForm(meta_type_id) {
    dataAccess.metaType.getById(meta_type_id, function(tx,result, objs){
        u.setValue('meta_type_id'   , objs[0][SQL.META_TYPE.COLS.ID]);
        u.setValue('meta_type_name' , objs[0][SQL.META_TYPE.COLS.NAME]);
    });
}

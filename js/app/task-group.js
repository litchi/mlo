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
    u.setValue('v_meta_type_name', metaTypeName);
    u.setValue('v_meta_name', metaName);
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
    dataAccess.task.getById(id, function(tx, result, arrays) {
        u.setValue('task-id', id);
        u.setValue('task-name', arrays[0][SQL.TASK.COLS.NAME]);
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

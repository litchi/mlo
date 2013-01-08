function switchPanelWidth(groupWidth,taskWidth,taskLeft) {
    if(document.getElementById('group').style.width != groupWidth){
        document.getElementById('group').style.width=groupWidth;
        document.getElementById(uiConfig.detailListPanelElementId).style.width=taskWidth;
        document.getElementById(uiConfig.detailListPanelElementId).style.left=taskLeft + 'px';
    }
}

//TODO Optimize, first construct a document fragment and then append it to the element.
function addTaskToList (id, name, project, contexts) {
    var item, taskList = document.getElementById(uiConfig.detailListElementId); 
    var items = taskList.getItems();
    item = createItemElement(id, name, project, contexts);
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
                dataAccess.appDb.transaction(
                    (
                        function(id, name){
                            return function(tx){
                                dataAccess.runSqlDirectly(
                                    tx,
                                    'select meta_name, meta_type_name from task_view where task_id = ?',
                                    [id],
                                    function(tx, result){
                                        var context = new Array(), project = null, metaTypeName = null;              
                                        for(i = 0, max = result.rows.length; i < max; i++){
                                            var obj = result.rows.item(i);
                                            metaTypeName = obj['meta_type_name'];
                                            if(seedData.projectMetaTypeName == metaTypeName){
                                                project = obj['meta_name'];
                                            } else if(seedData.contextMetaTypeName == metaTypeName){
                                                context.push(obj['meta_name']);
                                            }
                                        }
                                        addTaskToList(id, name, project, context);    
                                    });
                            }
                        }
                    )(id, name)
                );
            }
        }
    });
    //TODO Performance optimize
    dataAccess.meta.getByName(metaName, function(tx, result, resultObj){
        u.setValue('v_meta_name', metaName);
        if(null != resultObj && (resultObj.length > 0) && 
        null != resultObj[0] && null != resultObj[0][SQL.META.COLS.ID]){
            u.setValue('v_meta_id', resultObj[0][SQL.META.COLS.ID]);
        } else {
            console.warn("Meta with name '%s' not found", metaName);
        }
    }, function(tx, error){
        log.logSqlError("Error getting meta[" + metaName + "]", error);    
    });
    dataAccess.metaType.getByName(metaTypeName, function(tx, result, resultObj){
        u.setValue('v_meta_type_name', metaTypeName);
        if(null != resultObj && (resultObj.length > 0) && 
        null != resultObj[0] && null != resultObj[0][SQL.META.COLS.ID]){
            u.setValue('v_meta_type_id', resultObj[0][SQL.META_TYPE.COLS.ID]);
        } else {
            console.warn("Meta Type with name '%s' not found", metaTypeName);
        }
    }, function(tx, error){
        log.logSqlError("Error getting metaType[" + metaTypeName + "]", error);    
    });
}

function createItemElement(id, name, project, contexts) {
    var item = document.createElement('div');
    item.setAttribute('data-bb-type','item');
    item.setAttribute('data-bb-style','stretch');
    if(id != null) {
        item.setAttribute('id', 'task-' + id);
        if (name != null) {                     
            item.setAttribute('title', name);
            item.setAttribute('data-bb-title',name);
        }
        if (contexts != null) {
            var contextCount = contexts.length, contextText = '';
            if(contextCount > 0){
                for(var i = 0; i < contextCount; i++){
                    contextText = contextText + "<span class='list-context'>" + contexts[i] + "</span>";
                }
            }
            item.innerHTML = contextText;
        }
        if(project != null){
            item.innerHTML = "<span class='list-project'>p:" + project + "</span>" + item.innerHTML;
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
        if(null != objs && undefined != objs && objs.length > 0 && null != objs[0] && undefined != objs[0]){
            fillMetaListToPanel(objs[0][SQL.META_TYPE.COLS.ID], pageType);
        } else {
            console.warn("Meta type with name[%s] was not found on page type[%s]", metaTypeName, pageType);
        }
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

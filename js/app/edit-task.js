var selectedContextIds = new Array();

function fillTaskToEditForm(id){
    var obj, option;
    dataAccess.task.getById(id, function(tx, result, arrays) {
        u.setValue('task-id', id);
        u.setValue('task-name', arrays[0][SQL.TASK.COLS.NAME]);
        prepareProjectData();
        setDefaultProjectForTask(id);
        prepareContextData(id);
        bb.refresh();
    }, function(tx, error) {
        log.logSqlError("Error filling task[" + id + "] to edit form", error);
    });
}

function prepareProjectData(){
    var projectSelect = document.createElement('select');
    projectSelect.setAttribute('id', seedData.projectMetaTypeName);
    projectSelect.setAttribute('data-bb-label','> ');
    u.appendOption(projectSelect, 0, 'No Project');
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
            }
        );
    });
}

function setDefaultProjectForTask(taskId){
    dataAccess.appDb.transaction(function(tx){
        dataAccess.runSqlDirectly(
            tx,
            "select distinct meta_name from task_view where task_id = ? and meta_type_name = ?",
            [taskId, seedData.projectMetaTypeName],
            function(tx, result){
                if(null != result && null!= result.rows && result.rows.length > 0 && 
                    null != result.rows && null != result.rows.item && null != result.rows.item(0) &&
                    null != result.rows.item(0)['meta_name']){
                        document.getElementById(seedData.projectMetaTypeName).setSelectedText(result.rows.item(0)['meta_name']);                
                    }    
            }
        );
    });
}

function prepareContextData(taskId){
    var contextContainer = document.getElementById('contextContainer'); 
    dataAccess.appDb.transaction(function(tx){
        dataAccess.runSqlDirectly(
            tx,
            'select meta_id, meta_name from meta_view where meta_type_name = ?',
            [seedData.contextMetaTypeName],
            function(tx, result){
                if(null != result && null != result.rows && null != result.rows.item){
                    for(i = 0, max = result.rows.length; i < max; i++){
                        createContextSpan(contextContainer, taskId, result.rows.item(i)['meta_id'], result.rows.item(i)['meta_name']);
                    }
                }    
            }
        );
    });
}

function createContextSpan(container, taskId, metaId, metaName){
    var span;
    dataAccess.appDb.transaction(function(tx){
        dataAccess.runSqlDirectly(
            tx,
            'select count(*) as c from task_view where task_id = ? and meta_id = ?',
            [taskId, metaId],
            function(tx, result){
                if(null != result && null != result.rows && null != result.rows.item){
                    span = document.createElement('span');
                    span.setAttribute('id', metaId);
                    count = result.rows.item(0)['c'];
                    console.log(count);
                    if(count >= 1){
                        span.setAttribute('class', 'selectedContext');
                        span.setAttribute('onclick', 'unSelectContext("' + metaId + '", "' + metaName + '")');
                        selectedContextIds[metaId] = metaName;
                        log.logObjectData('selectedContextIds', selectedContextIds, true);
                    } else {
                        span.setAttribute('class', 'context');
                        span.setAttribute('onclick', 'selectContext("' + metaId + '", "' + metaName + '")');
                    }
                    span.innerText = metaName;
                    container.appendChild(span);
                }
            });
    });
}

function selectContext(metaId, metaName){
    var span = document.getElementById(metaId);
    selectedContextIds[metaId] = metaName;
    span.setAttribute('class', 'selectedContext');
    span.setAttribute('onclick', 'unSelectContext("' + metaId + '", "' + metaName + '")');
}

function unSelectContext(metaId, metaName){
    var span = document.getElementById(metaId);
    selectedContextIds.splice(metaId, 1);
    span.setAttribute('class', 'context');
    span.setAttribute('onclick', 'selectContext("' + metaId + '", "' + metaName + '")');
}

function saveTask(id, name, projectId){
    dataAccess.task.update(id, name, function(tx, result, rows){
        saveReminderInfo(id);
        saveProjectInfo(id, projectId);
        saveContextInfo(id);
        bb.popScreen();
    }, function(tx, error) {
        log.logSqlError("Failed to update task[" + id + "][" + name + "]", error);
    });
}

function saveContextInfo(taskId){
    log.logObjectData("selectedContextIds", selectedContextIds);
    dataAccess.appDb.transaction(function(tx1){
    //TODO Performance optimize, put into one transaction
    dataAccess.runSqlDirectly(tx1,
        SQL.TASK_META.DELETE_META_BY_TYPE, 
        [taskId, seedData.contextMetaTypeName], 
        function(tx, result) {
            //selectedContextIds is a global variable used to save selected contexts
            dataAccess.appDb.transaction(function(tx2){
                for(var key in selectedContextIds) {
                    var val = selectedContextIds[key];
                    if(null != val && null != key){
                        var data = [taskId, key];
                        log.logSqlStatement(SQL.TASK_META.INSERT, data, dataAccess.logDebug);
                        tx2.executeSql(SQL.TASK_META.INSERT, data,
                            (
                                function(data){
                                    return function(tx, result){
                                        console.debug("Successfully create context[%s] link with task[%s]", data[1], taskId);
                                    }
                                }
                            )(data), 
                            (
                                function(data){
                                    return function(tx, error){
                                        log.logSqlError("Failed to create context[" + data[1] + "] link with task[" + taskId + "]", error);
                                    }
                                }
                            )(data) 
                        );
                    }
                }
            });
        });
    });
}

function saveReminderInfo(taskId){
    reminderOn = document.getElementById('is-reminder-on').getChecked();
    if(reminderOn){
        var dueDate = u.valueOf('due-date'), dueTime = u.valueOf('due-time');
        var myDate = new Date(dueDate + " " + dueTime).getTime();
        var currDate = new Date().getTime();
        if(myDate > currDate){ 
            var reminderAfter = myDate - currDate;
            console.log("Reminder after: " + reminderAfter);
            dataAccess.appDb.transaction(function(tx){
                dataAccess.runSqlDirectly(tx, 
                    "update task set next_reminder_time = ?, reminder_on = ? where id = ?", [myDate, 1, taskId], 
                    function(tx, result) {
                        //TODO Set reminder, add to system notification hub. Or integrate with push service
                    });
            });
        }
    } else {
        dataAccess.appDb.transaction(function(tx){
            dataAccess.runSqlDirectly(tx, "update task set next_reminder_time = ?, reminder_on = ? where id = ?", [0, 0, taskId]); 
        });
    }
}

function saveProjectInfo(taskId, projectId){ 
    dataAccess.appDb.transaction(function(tx1){
        dataAccess.runSqlDirectly(tx1,
            SQL.TASK_META.DELETE_META_BY_TYPE, 
            [taskId, seedData.projectMetaTypeName], 
            function(tx, result) {
                dataAccess.appDb.transaction(function(tx2){
                    dataAccess.runSqlDirectly(tx2, SQL.TASK_META.INSERT, [taskId, projectId]);
                });
            }
        );
    });
}


function loadSeedAndSampleData(){
    console.info("First time init db, about to insert seed and sample data");
    dataAccess.appDb.transaction(function(tx){
        insertSeedData(tx);
        insertSampleData(tx);
    }, function(error){
        log.logSqlError("Error inserting seed and sample data", error);
    }, function(){
        console.info("First time init db, insert seed and sample data completed");
    });
}

function createTables(tx){
    dataAccess.runSqlDirectly(tx, SQL.TASK.CREATE_TABLE);
    dataAccess.runSqlDirectly(tx, SQL.META_TYPE.CREATE_TABLE);
    dataAccess.runSqlDirectly(tx, SQL.META.CREATE_TABLE);
    dataAccess.runSqlDirectly(tx, SQL.TASK_META.CREATE_TABLE);
    dataAccess.runSqlDirectly(tx, SQL.TASK_NOTE.CREATE_TABLE);
    dataAccess.runSqlDirectly(tx, SQL.TASK_REMINDER.CREATE_TABLE);
}

function insertSeedData(tx){
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('Project', 'Predefined Project dimension for meta')");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('Context', 'Predefined Context dimension for meta')");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('GTD', 'Predefined GTD dimension for meta, includes in basket/(someday/maybe)/next action')");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'In Basket'   , 'Predefined in basket meta for tasks' from meta_type where name = 'GTD'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'Next Action' , 'Predefined next action meta for tasks' from meta_type where name = 'GTD'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'Someday'     , 'Predefined Someday & Maybe meta for tasks' from meta_type where name = 'GTD'");
}

function insertSampleProjects(tx){
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'App Usage' , 'Introduction of Mind like Water App features' from meta_type where name = 'Project'");
}

function insertSampleContexts(tx){
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'online'   , 'Internet context' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'bank'     , 'Actions related to bank' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'errands'  , 'Waiting for others' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'call'     , 'Call others' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'home'     , 'At home' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'office'   , 'In the Office' from meta_type where name = 'Context'");
    dataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'subway'   , 'When taking subway' from meta_type where name = 'Context'");
}

function insertSampleTask(tx, taskName, metaName1, metaName2, metaName3){
    dataAccess.runSqlDirectly(tx, "INSERT INTO task (name) values (?)", [taskName], function(tx, result){
        dataAccess.appDb.transaction(function(tx1){
            if(null != metaName1){
                dataAccess.runSqlDirectly(tx1, 
                    "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))", 
                [result.insertId, metaName1]);            
            }
            if(null != metaName2){
                dataAccess.runSqlDirectly(tx1, 
                    "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))", 
                [result.insertId, metaName2]);            
            }
            if(null != metaName3){
                dataAccess.runSqlDirectly(tx1, 
                    "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))", 
                [result.insertId, metaName3]);            
            }
        });
    });
}

function insertSampleTasks(tx){
    insertSampleTask(tx, 'Click task list to show pop up menu'                                        , 'App Usage' , 'Next Action', 'office');
    insertSampleTask(tx, 'Click menu item "Yahoo, Done!" to mark task as done'                        , 'App Usage' , 'errands', 'online');
    insertSampleTask(tx, 'Click menu item "Edit" to Edit a task'                                      , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click menu item "Next Action" to mark task as next action'                  , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click menu item "In Basket" to move task back to inbox basket'              , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click menu item "Someday/Maybe" to mark task as Someday/Maybe'              , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click menu item "Haven\'t Done :(" to set task status to new'               , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click menu item "Delete" to delete the task'                                , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click "Basket" icon below to display tasks in inbox'                        , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click "Next Action" icon below to display next actions'                     , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click "Project" icon below to group tasks by project'                       , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Click "Context" icon below to group tasks by context'                       , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Show overflow menu and click "Someday/Maybe" to display Someday/Maybe list' , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Show overflow menu and click "Dimensions" to manage Project/Context'        , 'App Usage' , 'Next Action');
    insertSampleTask(tx, 'Sample task: Call Jenny and say happy birthday to her'                      , 'call'             , 'In Basket');
    insertSampleTask(tx, 'Sample task: Read the book "Getting things Done"'                           , 'subway'           , 'In Basket', 'home');
    insertSampleTask(tx, 'Sample task: Travel to Tibet with Honny, next spring'                       , 'Someday');
}

function insertSampleData(tx){
    insertSampleProjects(tx);
    insertSampleContexts(tx);
    insertSampleTasks(tx);
}

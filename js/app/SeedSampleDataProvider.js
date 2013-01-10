/*jslint browser: true*/
/*global u, DataAccess, SQL, seedData, bb, log, console, uiConfig, openDatabase, APP_SQL*/
var SeedSampleDataProvider = (function () {
    "use strict";

    function insertSeedData(tx) {
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('Project', 'Predefined Project field for task')");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('Context', 'Predefined Context field for task')");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta_type (name, description) VALUES ('GTD', 'Predefined GTD lists for task, includes in basket/(someday/maybe)/next action')");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'In Basket'   , 'Predefined in basket meta for tasks' from meta_type where name = 'GTD'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'Next Action' , 'Predefined next action meta for tasks' from meta_type where name = 'GTD'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'Someday'     , 'Predefined Someday & Maybe meta for tasks' from meta_type where name = 'GTD'");
    }

    function insertSampleProjects(tx) {
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'App Usage' , 'Introduction of Mind like Water App features' from meta_type where name = 'Project'");
    }

    function insertSampleContexts(tx) {
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'online'   , 'Internet context' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'bank'     , 'Actions related to bank' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'errands'  , 'Waiting for others' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'call'     , 'Call others' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'home'     , 'At home' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'office'   , 'In the Office' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "INSERT INTO meta (meta_type_id , name , description) select id , 'subway'   , 'When taking subway' from meta_type where name = 'Context'");
    }

    function insertSampleTask(tx, taskName, metaName1, metaName2, metaName3) {
        DataAccess.runSqlDirectly(tx, "INSERT INTO task (name) values (?)", [taskName], function (tx, result) {
            DataAccess.appDb.transaction(function (tx1) {
                if (null !== metaName1) {
                    DataAccess.runSqlDirectly(tx1,
                        "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))",
                        [result.insertId, metaName1]);
                }
                if (null !== metaName2) {
                    DataAccess.runSqlDirectly(tx1,
                        "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))",
                        [result.insertId, metaName2]);
                }
                if (null !== metaName3) {
                    DataAccess.runSqlDirectly(tx1,
                        "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))",
                        [result.insertId, metaName3]);
                }
            });
        });
    }

    function insertSampleTasks(tx) {
        insertSampleTask(tx, 'Click task list to show pop up menu', 'App Usage', 'Next Action', 'office');
        insertSampleTask(tx, 'Click menu item "Yahoo, Done!" to mark task as done', 'App Usage', 'errands', 'online');
        insertSampleTask(tx, 'Click menu item "Edit" to Edit a task', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click menu item "Next Action" to mark task as next action', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click menu item "In Basket" to move task back to inbox basket', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click menu item "Someday/Maybe" to mark task as Someday/Maybe', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click menu item "Haven\'t Done :(" to set task status to new', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click menu item "Delete" to delete the task', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Basket" icon below to display tasks in inbox', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Next Action" icon below to display next actions', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Project" icon below to group tasks by project', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Context" icon below to group tasks by context', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Show overflow menu and click "Someday/Maybe" to display Someday/Maybe list', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Show overflow menu and click "Dimensions" to manage Project/Context', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Sample task: Call Jenny and say happy birthday to her', 'call', 'In Basket');
        insertSampleTask(tx, 'Sample task: Read the book "Getting things Done"', 'subway', 'In Basket', 'home');
        insertSampleTask(tx, 'Sample task: Travel to Tibet with Honny, next spring', 'Someday');
    }

    function insertSampleData(tx) {
        insertSampleProjects(tx);
        insertSampleContexts(tx);
        insertSampleTasks(tx);
    }

    function loadSeedAndSampleData() {
        console.info("First time init db, about to insert seed and sample data");
        DataAccess.appDb.transaction(function (tx) {
            insertSeedData(tx);
            insertSampleData(tx);
        }, function (error) {
            log.logSqlError("Error inserting seed and sample data", error);
        }, function () {
            console.info("First time init db, insert seed and sample data completed");
        });
    }
}());

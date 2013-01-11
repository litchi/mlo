/*jslint browser: true*/
/*global u, DataAccess, SQL, seedData, bb, log, console, uiConfig, openDatabase, APP_SQL*/
var SeedSampleDataProvider = (function () {
    "use strict";

    function insertGtdSeedData(tx) {
        DataAccess.runSqlDirectly(tx, "insert into meta_type (name, description, internal) values ('GTD', 'Predefined GTD lists for task, includes in basket/(someday/maybe)/next action', 1)");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'In Basket'   , 'Predefined in basket meta for tasks' from meta_type where name       = 'GTD'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'Next Action' , 'Predefined next action meta for tasks' from meta_type where name     = 'GTD'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'Someday'     , 'Predefined Someday & Maybe meta for tasks' from meta_type where name = 'GTD'");
    }

    function insertDueSeedData(tx) {
        DataAccess.runSqlDirectly(tx, "insert into meta_type (name, description, internal) values ('Due', 'Predefined Due lists for items, includes today/tomorrow/this week etc', 1)");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'Today'             , 30, 'Today''s due tasks' from meta_type where name          = 'Due'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'Tomorrow'          , 25, 'Tomorrow''s due tasks' from meta_type where name       = 'Due'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'Yesterday Overdue' , 20, 'Yesterday''s overdue tasks' from meta_type where name  = 'Due'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'This Week'         , 15, 'This week''s due tasks' from meta_type where name      = 'Due'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'Next Week'         , 10, 'Next week''s Due Tasks' from meta_type where name      = 'Due'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , ui_rank, description) select id , 'Yesterday Done'    , 05, 'Yesterday''s finished tasks' from meta_type where name = 'Due'");
    }

    function insertSeedData(tx) {
        DataAccess.runSqlDirectly(tx, "insert into meta_type (name, description) values ('Project', 'Predefined Project field for task')");
        DataAccess.runSqlDirectly(tx, "insert into meta_type (name, description) values ('Context', 'Predefined Context field for task')");
        insertGtdSeedData(tx);
        insertDueSeedData(tx);
    }


    function insertSampleProjects(tx) {
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'App Usage' , 'Introduction of Mind like Water App features' from meta_type where name = 'Project'");
    }

    function insertSampleContexts(tx) {
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'online'   , 'Internet context' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'bank'     , 'Actions related to bank' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'errands'  , 'Waiting for others' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'call'     , 'Call others' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'home'     , 'At home' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'office'   , 'In the Office' from meta_type where name = 'Context'");
        DataAccess.runSqlDirectly(tx, "insert into meta (meta_type_id , name , description) select id , 'subway'   , 'When taking subway' from meta_type where name = 'Context'");
    }

    function insertSampleTask(tx, taskName, metaName1, metaName2, metaName3) {
        DataAccess.runSqlDirectly(tx, "insert into task (name) values (?)", [taskName], function (tx, result) {
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
        insertSampleTask(tx, 'Click "Basket" icon below to display tasks in inbox', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Next Action" icon below to display next actions', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Project" icon below to group tasks by project', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Click "Context" icon below to group tasks by context', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Show overflow menu and click "Someday/Maybe" to display Someday/Maybe list', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Show overflow menu and click "Dimensions" to manage Project/Context', 'App Usage', 'Next Action');
        insertSampleTask(tx, 'Sample: Call Jenny and say happy birthday to her', 'call', 'In Basket', 'errands');
        insertSampleTask(tx, 'Sample: Read the book "Getting things Done"', 'subway', 'In Basket', 'home');
        insertSampleTask(tx, 'Sample: Travel to Tibet with Honny, next spring', 'Someday', 'bank', 'online');
    }

    function insertSampleData(tx) {
        insertSampleProjects(tx);
        insertSampleContexts(tx);
        insertSampleTasks(tx);
    }

    return {
        loadSeedAndSampleData : function () {
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
    };
}());

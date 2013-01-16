/*jslint browser: true*/
/*global Util, DataAccess, SQL, SeedData, bb, log, console, uiConfig, openDatabase, APP_SQL*/
var SeedSampleDataProvider = (function () {
    "use strict";

    function insertProjectSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description) values ('Project', 'Predefined Project field for task')");
    }

    function insertContextSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description) values ('Context', 'Predefined Context field for task')");
    }

    function insertGtdSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description, internal) values ('GTD', 'Predefined GTD lists for task, includes in basket/(someday/maybe)/next action', 1)");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Basket'   , 'Predefined in basket meta for tasks' from meta_type where name       = 'GTD'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Next Action' , 'Predefined next action meta for tasks' from meta_type where name     = 'GTD'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Someday'     , 'Predefined Someday & Maybe meta for tasks' from meta_type where name = 'GTD'");
    }

    function insertDueSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description, internal) values ('Due', 'Predefined Due lists for items, includes today/tomorrow/this week etc', 1)");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Today'            , 'Today''s due tasks' from meta_type where name          = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Tomorrow'         , 'Tomorrow''s due tasks' from meta_type where name       = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Overdue'          , 'Overdue tasks' from meta_type where name               = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Overdue Yesterday', 'Yesterday''s overdue tasks' from meta_type where name  = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'This Week'        , 'This week''s due tasks' from meta_type where name      = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Next Week'        , 'Next week''s Due Tasks' from meta_type where name      = 'Due'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Done Yesterday'   , 'Yesterday''s finished tasks' from meta_type where name = 'Due'");
    }

    function insertSampleProjects(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'App Use' , 'Introduction of Mind like Water App features' from meta_type where name = 'Project'");
    }

    function insertSampleContexts(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'online'     , 'Internet context' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'blackberry' , 'Actions related to bank' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'errands'    , 'Waiting for others' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'call'       , 'Call others' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'home'       , 'At home' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'office'     , 'In the Office' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'subway'     , 'When taking subway' from meta_type where name = 'Context'");
    }

    function insertSampleTask(tx, taskName, metas, dueDate) {
        DataAccess.runSqlForMigrate(tx, "insert into task (name) values (?)", [taskName], function (tx, result) {
            var i, id = result.insertId;
            if (Util.notEmpty(metas)) {
                for (i = 0; i < metas.length; i += 1) {
                    DataAccess.runSqlForMigrate(tx, "insert into task_meta (task_id, meta_id) values (?, (select id from meta where name = ?))", [id, metas[i]]);
                }
            }
            if (Util.notEmpty(dueDate)) {
                dueDate.setHours(10);
                dueDate.setMinutes(0);
                DataAccess.runSqlForMigrate(tx, 'update task set due_date = ? where id = ?', [dueDate.getTime() / 1000, id]);
            }
        });
    }

    function insertSampleTasks(tx) {
        insertSampleTask(tx, 'Use the create task input below to add task', ['App Use', 'Next Action', 'blackberry']);
        insertSampleTask(tx, 'Tap this item to show task operate menu', ['App Use', 'Next Action', 'office', 'blackberry']);
        insertSampleTask(tx, 'Swipe task operate menu left to show description', ['App Use', 'Next Action', 'blackberry']);
        insertSampleTask(tx, 'Tap leftmost actionbar item to show all available lists', ['App Use', 'Next Action', 'blackberry']);
        insertSampleTask(tx, 'Create project and context on Fields list page', ['App Use', 'Next Action', 'office']);
        insertSampleTask(tx, 'Tap a context to assign it to task on editing task page', ['App Use', 'Next Action', 'blackberry']);
        insertSampleTask(tx, 'Sample: Call my friend and say happy birthday', ['call', 'Basket'], new Date());
        insertSampleTask(tx, 'Sample: Read the book "Getting things Done"', ['subway', 'Basket', 'home'], new Date());
        insertSampleTask(tx, 'Sample: Travel to Tibet with Honny, next spring', ['Someday', 'online']);
    }

    return {
        loadSeedData : function (tx) {
            insertProjectSeedData(tx);
            insertContextSeedData(tx);
            insertGtdSeedData(tx);
            insertDueSeedData(tx);
        },

        loadSampleData : function (tx) {
            insertSampleProjects(tx);
            insertSampleContexts(tx);
            insertSampleTasks(tx);
        }
    };
}());

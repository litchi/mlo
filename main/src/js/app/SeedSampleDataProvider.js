/*jslint browser: true*/
/*global Util, DataAccess, SQL, SeedData, bb, log, console, uiConfig, openDatabase, APP_SQL*/
var SeedSampleDataProvider = (function () {
    "use strict";

    function insertProjectSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description) values ('Project', 'Predefined Project field for task')");
    }

    function insertContextSeedData(tx) {
        DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description) values ('Context', 'Predefined Context field for task')");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'online'     , 'Internet context' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'errands'    , 'Waiting for others' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'call'       , 'Call others' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'home'       , 'At home' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'email'      , 'Need to email others' from meta_type where name = 'Context'");
        DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '< 10 Mins'  , 'Tasks take less than 10 minutes' from meta_type where name = 'Context'");
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

    return {
        loadSeedData : function (tx) {
            insertProjectSeedData(tx);
            insertContextSeedData(tx);
            insertGtdSeedData(tx);
            insertDueSeedData(tx);
        },

        m5InsertReminderSeedData : function (tx) {
            DataAccess.runSqlForMigrate(tx, "insert into meta_type (name, description, internal) values ('Reminder', 'Predefined reminder time for task with due date', 1)");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Off'      , 'No reminder' from meta_type where name                = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'When Due' , 'Same as due date' from meta_type where name           = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '1 min'    , '1 minute before due date' from meta_type where name   = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '5 mins'   , '5 minutes before due date' from meta_type where name  = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '15 mins'  , '15 minutes before due date' from meta_type where name = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '30 mins'  , '30 minutes before due date' from meta_type where name = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '1 hour'   , '1 hour before due date' from meta_type where name     = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '2 hours'  , '2 hours before due date' from meta_type where name    = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , '1 day'    , '1 day before due date' from meta_type where name      = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "insert into meta (meta_type_id , name , description) select id , 'Custom'   , 'Custom reminder date' from meta_type where name       = 'Reminder'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 50 where name = 'Off'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 48 where name = 'When Due'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 46 where name = '1 min'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 40 where name = '5 mins'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 30 where name = '15 mins'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 25 where name = '30 mins'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 20 where name = '1 hour'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 15 where name = '2 hours'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 08 where name = '1 day'");
            DataAccess.runSqlForMigrate(tx, "update meta set ui_rank = 03 where name = 'Custom'");
        }
    };
}());

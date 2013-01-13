/*jslint browser: true, white: true */
/*global CommonSql:true, SeedData:true, Sql:true, AppSql:true */

/*
* SQL for clean up testing
* drop table meta;
* drop table meta_type;
* drop table task;
* drop table task_meta;
* drop table task_note;
* drop table __WebKitDatabaseInfoTable__;
*
*/
var CommonSql, SeedData, Sql;

CommonSql = {
    IdCol    : "id",
    GetMaxId : 'select max(id) from '
};

SeedData = {
    BasketMetaName         : 'Basket',
    NextActionMetaName       : 'Next Action',
    SomedayMetaName          : 'Someday',
    GtdMetaTypeName          : 'GTD',
    TaskDoneStatus           : 'Done',
    TaskNewStatus            : 'New',
    ProjectMetaTypeName      : 'Project',
    ContextMetaTypeName      : 'Context',
    DueMetaTypeName          : 'Due',
    TodayMetaName            : 'Today',
    TomorrowMetaName         : 'Tomorrow',
    ThisWeekMetaName         : 'This Week',
    NextWeekMetaName         : 'Next Week',
    YesterdayDoneMetaName    : 'Yesterday Done',
    YesterdayOverDueMetaName : 'Yesterday Overdue'
};

Sql = {
    DbName        : 'peaceful_better_life_xiangqian_liu',
    DbDescription : 'Local Database for Peaceful & Better Life App',
    DbSize        : 2*1024*1024,
    FilterAllMeta : 'All',
    TaskMeta : {
        TableName             : 'task_meta',
        Cols : {
            Id     : CommonSql.IdCol,
            TaskId : 'task_id',
            MetaId : 'meta_id'
        },
        CreateTable          : 'CREATE TABLE IF NOT EXISTS task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int)',
        Insert               : 'INSERT INTO task_meta (id, task_id, meta_id) VALUES (null, ?, ?)',
        ThrowTaskToList      : 'INSERT INTO task_meta (id, task_id, meta_id) select null, ?, id from meta where name = ? and meta_type_id = (select id from meta_type where name = ?)',
        SelectByIds          : 'SELECT id, task_id, meta_id from task_meta where task_id = ? and meta_id = ?',
        SelectTaskByMetaId   : 'SELECT task.id, task.name, task.status, task_meta.meta_id FROM task INNER JOIN task_meta ON task.id = task_meta.task_id WHERE task_meta.meta_id = ?',
        SelectMetaByTaskId   : 'SELECT meta.id, meta.name, meta.meta_type_id, meta.description FROM meta INNER JOIN task_meta ON meta.id = task_meta.meta_id WHERE task_meta.task_id = ?',
        DeleteByMetaTypeName : 'DELETE FROM task_meta where task_id = ? and meta_id in (select id from meta where meta_type_id = (select id from meta_type where name = ?))',
        DeleteTaskFromList   : 'delete from task_meta where task_id = ? and meta_id = (select id from meta where name = ? and meta_type_id = (select id from meta_type where name = ?))'
    },

    Meta : {
        TableName : 'meta',
        Cols : {
            Id          : CommonSql.IdCol,
            Name        : 'name',
            MetaTypeId  : 'meta_type_id',
            Description : 'description'
        },
        CreateTable        : 'create table if not exists meta (id integer primary key autoincrement, meta_type_id integer, name text, description text, unique(meta_type_id, name))',
        Insert             : 'insert into meta (id, name, meta_type_id, description) values (null, ?, ?, ?)',
        SelectAll          : 'select id, meta_type_id, name, description from meta',
        SelectById         : 'select id, meta_type_id, name, description from meta where id = ?',
        SelectByName       : 'select id, meta_type_id, name, description from meta where name = ?',
        SelectByIdName     : 'select id, meta_type_id, name, description from meta where id = ? and name = ?',
        SelectByTypeId     : 'select id, meta_type_id, name, description from meta where meta_type_id = ? order by ui_rank desc',
        SelectByTypeName   : 'select id, meta_type_id, name, description from meta where meta_type_name = ? order by ui_rank desc',
        SelectByNameTypeId : 'select id from meta where meta_type_id = ? and name = ?',
        UpdateNameById     : 'update meta set name = ? where id = ?',
        UpdateById         : 'update meta set name = ? ,description = ? where id = ?',
        DeleteById         : 'delete from meta where id = ?',
        DeleteAll          : 'delete from meta'
    },

    MetaType : {
        TableName : 'meta_type',
        Cols : {
            Id          : CommonSql.IdCol,
            Name        : 'name',
            Description : 'description',
            Internal    : 'internal'
        },
        CreateTable    : 'create table if not exists meta_type (id integer primary key autoincrement, name text, description text, internal integer default 0)',
        InsertByName   : 'insert into meta_type (name, description) values (?, ?)',
        InsertByIdName : 'insert into meta_type (id, name, description) values (?, ?, ?)',
        SelectAll      : 'select id, name, description, internal from meta_type',
        SelectById     : 'select id, name, description, internal from meta_type where id = ?',
        SelectByName   : 'select id, name, description, internal from meta_type where name = ?',
        SelectByIdName : 'select id, name, description from meta_type where id = ? and name = ?',
        UpdateById     : 'update meta_type set name = ? , description = ? where id = ?',
        DeleteById     : 'delete from meta_type where id = ?',
        DeleteAll      : 'delete from meta_type',
        GetMaxId       : CommonSql.GetMaxId + 'meta_type'
    },

    TaskNote : {
        TableName   : 'task_note',
        CreateTable : 'create table if not exists task_note (id integer primary key autoincrement, task_id int, content text, create_date integer)'
    },

    Task : {
        TableName : 'task',
        Cols : {
            Id         : CommonSql.IdCol,
            Name       : 'name',
            ReminderOn : "reminder_on",
            DueDate    : 'due_date'
        },
        //TODO Clean up/Remove these create tables sqls since they are not up to date.
        CreateTable      : "create table if not exists task (id integer primary key autoincrement, name text, status text default 'New')",
        InsertByName     : 'insert into task (id, name) values (null, ?)',
        InsertByIdName   : 'insert into task(id, name) values (?, ?)',
        FilterByStatus   : 'select id, name from task where status != ?',
        SelectById       : "select id, name, reminder_on, status, due_date from task where id = ?",
        SelectByName     : 'select id, name from task where name = ?',
        SelectByIdName   : 'select id, name from task where id = ? and name = ?',
        SelectByMetaName : 'select distinct task_id as id, task_name as name, task_status as status from task_view where meta_name = ? AND meta_type_name = ? AND task_status != ? order by case when task_due_date is null then 1 else 0 end, task_due_date',
        SelectByMetaType : 'select distinct task_id as id, task_name as name, task_status as status from task_view where meta_type_name = ? AND task_status != ? order by case when task_due_date is null then 1 else 0 end, task_due_date',
        SelectDueDate    : 'select due_date from task where id = ?',
        UpdateById       : 'update task set name = ? where id = ?',
        UpdateStatusById : 'update task set status = ? where id = ?',
        DeleteById       : 'delete from task where id = ?',
        DeleteAll        : 'delete from task',
        GetMaxId         : CommonSql.GetMaxId + 'task',
        DueFilterBaseSql : 'select id, name, due_date from task where %DueFilter% order by due_date',
        DueFilterKey     : 'DueFilter',
        DueFilter : {
            'All'               : "due_date is not null and status != '" + SeedData.TaskDoneStatus + "'",
            'Today'             : "strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now') and status != '" + SeedData.TaskDoneStatus + "'",
            'Tomorrow'          : "strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','+1 day') and status != '" + SeedData.TaskDoneStatus + "'",
            'This Week'         : "strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now') and status != '" + SeedData.TaskDoneStatus + "'",
            'Next Week'         : "strftime('%Y-%W', due_date, 'unixepoch') = strftime('%Y-%W', 'now', '+7 days') and status != '" + SeedData.TaskDoneStatus + "'",
            'Yesterday Done'    : "strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status = '" + SeedData.TaskDoneStatus + "'",
            'Yesterday Overdue' : "strftime('%Y-%m-%d', due_date, 'unixepoch') = date('now','-1 day') and status != '" + SeedData.TaskDoneStatus + "'",
            'All Overdue'       : "strftime('%Y-%m-%d %H:%M:%S', due_date, 'unixepoch') < datetime('now') and status != '" + SeedData.TaskDoneStatus + "'"
        }
    }
};

AppSql = {
    AppInfo : {
        CreateTable : 'create table if not exists app_info (id integer primary key autoincrement, app_id text, name text, version text, db_schema_version text, additional_info text, unique(app_id))'
    }
};

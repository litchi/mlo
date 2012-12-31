/*
* SQL for clean up testing
* drop table meta;
* drop table meta_type;
* drop table task;
* drop table task_meta;
* drop table task_note;
* drop table task_reminder;
* drop table __WebKitDatabaseInfoTable__;
*
*/

/*
 * -- SQL for initialize the database
 * CREATE TABLE IF NOT EXISTS task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int)
 * CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY AUTOINCREMENT, meta_type_id INTEGER, name text, description text, UNIQUE(meta_type_id, name))
 * CREATE TABLE IF NOT EXISTS meta_type (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text, internal INTEGER DEFAULT 0)
 * CREATE TABLE IF NOT EXISTS task_note (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, content text, create_date real)
 * CREATE TABLE IF NOT EXISTS task_reminder (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, next_reminder_time real)
 * CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, status text default 'New')
 *
 * -- Initialize database data
 * insert into meta_type (name, description) values ('project', 'Predefined Project dimension for meta');
 * insert into meta_type (name, description) values ('context', 'Predefined Context dimension for meta');
 * insert into meta_type (name, description, internal) values ('GTD', 'Predefined GTD dimension for meta, includes in basket/(someday/maybe)/next action', 1);
 * insert into meta (meta_type_id , name , description) select id , 'In Basket'   , 'Predefined in basket meta for tasks' from meta_type where name = 'GTD';
 * insert into meta (meta_type_id , name , description) select id , 'Next Action' , 'Predefined next action meta for tasks' from meta_type where name = 'GTD';
 * insert into meta (meta_type_id , name , description) select id , 'Someday'     , 'Predefined Someday & Maybe meta for tasks' from meta_type where name = 'GTD';
 */

var COMMON_SQL = {
    ID_COL : "id",
    GET_MAX_ID : 'select max(id) from ',
};

var seedData = {
    inBasketMetaName   : 'In Basket',
    nextActionMetaName : 'Next Action',
    somedayMetaName    : 'Someday',
    gtdMetaTypeName    : 'GTD',
    taskDoneStatus     : 'Done',
    taskNewStatus      : 'New'
};

var SQL = {

   TASK_META : {
        TABLE_NAME             : 'task_meta',
        COLS : {
            ID      : COMMON_SQL.ID_COL,
            TASK_ID : 'task_id',
            META_ID : 'meta_id',
        },
        CREATE_TABLE           : 'CREATE TABLE IF NOT EXISTS task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int)',
        INSERT                 : 'INSERT INTO task_meta (id, task_id, meta_id) VALUES (null, ?, ?)',
        THROW_TASK_TO_LIST     : 'INSERT INTO task_meta (id, task_id, meta_id) select null, ?, id from meta where name = ? and meta_type_id = (select id from meta_type where name = ?)',
        SELECT_BY_IDS          : 'SELECT id, task_id, meta_id from task_meta where task_id = ? and meta_id = ?',
        SELECT_TASK_BY_META_ID : 'SELECT task.id, task.name, task.status, task_meta.meta_id FROM task INNER JOIN task_meta ON task.id = task_meta.task_id WHERE task_meta.meta_id = ?',
        SELECT_META_BY_TASK_ID : 'SELECT meta.id, meta.name, meta.meta_type_id, meta.description FROM meta INNER JOIN task_meta ON meta.id = task_meta.meta_id WHERE task_meta.task_id = ?',
    },

    META : {
        TABLE_NAME : 'meta',
        COLS : {
            ID           : COMMON_SQL.ID_COL,
            NAME         : 'name',
            META_TYPE_ID : 'meta_type_id',
            DESCRIPTION  : 'description',
        },
        CREATE_TABLE        : 'CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY AUTOINCREMENT, meta_type_id INTEGER, name text, description text)',
        INSERT_BY_NAME_TYPE : 'insert into meta (id, name, meta_type_id, description) values (null, ?, ?, ?)',
        SELECT_ALL          : 'select id, meta_type_id, name, description from meta',
        SELECT_BY_ID        : 'select id, meta_type_id, name, description from meta where id = ?',
        SELECT_BY_NAME      : 'select id, meta_type_id, name, description from meta where name = ?',
        SELECT_BY_ID_NAME   : 'select id, meta_type_id, name, description from meta where id = ? and name = ?',
        SELECT_BY_TYPE_ID   : 'select id, meta_type_id, name, description from meta where meta_type_id = ?',
        UPDATE_NAME_BY_ID   : 'update meta set name = ? where id = ?',
        UPDATE_BY_ID        : 'update meta set name = ? ,description = ? where id = ?',
        DELETE_BY_ID        : 'delete from meta where id = ?',
        DELETE_ALL          : 'delete from meta',
    },

    META_TYPE : {
        TABLE_NAME : 'meta_type',
        COLS : {
            ID : COMMON_SQL.ID_COL,
            NAME : 'name',
            DESCRIPTION : 'description'
        },
        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS meta_type (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text)',
        INSERT_BY_NAME : 'insert into meta_type (name, description) values (?, ?)',
        INSERT_BY_ID_NAME   : 'insert into meta_type (id, name, description) values (?, ?, ?)',
        SELECT_ALL : 'select id, name, description from meta_type',
        SELECT_BY_ID : 'select id, name, description from meta_type where id = ?',
        SELECT_BY_NAME : 'select id, name, description from meta_type where name = ?',
        SELECT_BY_ID_NAME : 'select id, name, description from meta_type where id = ? and name = ?',
        UPDATE_BY_ID: 'update meta_type set name = ? , description = ? where id = ?',
        DELETE_BY_ID : 'delete from meta_type where id = ?',
        DELETE_ALL : 'delete from meta_type',
        GET_MAX_ID : COMMON_SQL.GET_MAX_ID + 'meta_type',
    },

    TASK_NOTE : {
        TABLE_NAME : 'task_note',
        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS task_note (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, content text, create_date real)'
    },

    TASK_REMINDER : {
        TABLE_NAME : 'task_reminder',
        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS task_reminder (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, next_reminder_time real)'
    },

    TASK : {
        TABLE_NAME : 'task',
        COLS : {
            ID : COMMON_SQL.ID_COL,
            NAME: 'name'
        },
        CREATE_TABLE        : 'CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, name text);',
        INSERT_BY_NAME      : 'insert into task (id, name) values (null, ?)',
        INSERT_BY_ID_NAME   : 'insert into task(id, name) values (?, ?)',
        FILTER_BY_STATUS    : 'select id, name from task where status != ?',
        SELECT_BY_ID        : 'select id, name from task where id = ?',
        SELECT_BY_NAME      : 'select id, name from task where name = ?',
        SELECT_BY_ID_NAME   : 'select id, name from task where id = ? and name = ?',
        SELECT_BY_META_NAME : 'select task.id, task.name, task.status, task_meta.meta_id from task inner join task_meta on task.id = task_meta.task_id where task_meta.meta_id = (select meta.id from meta where name= ? and meta_type_id = (select meta_type.id from meta_type where name = ?)) AND task.status != ?',
        UPDATE_BY_ID        : 'update task set name = ? where id = ?',
        UPDATE_STATUS_BY_ID : 'update task set status = ? where id = ?',
        DELETE_BY_ID        : 'delete from task where id = ?',
        DELETE_ALL          : 'delete from task',
        GET_MAX_ID          : COMMON_SQL.GET_MAX_ID + 'task',
    },
};
//console.log(SQL);

/* SQL for clean up testing
drop table meta;
drop table meta_type;
drop table task;
drop table task_meta;
drop table task_note;
drop table task_reminder;
drop table __WebKitDatabaseInfoTable__;
*/

var COMMON_SQL = {
    ID_COL : "id",
    GET_MAX_ID : 'select max(id) from ',
}
var SQL = {

    TASK_META : {
        TABLE_NAME : 'task_meta',
        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int)'
    },

    META : {
        TABLE_NAME : 'meta',
        COLS : {
            ID : COMMON_SQL.ID_COL,
            NAME : 'name',
            META_TYPE_ID : 'meta_type_id',
            DESCRIPTION : 'description'
        },
        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY AUTOINCREMENT, meta_type_id INTEGER, name text, description text)',
        INSERT_BY_NAME_TYPE : 'insert into meta (id, name, meta_type_id, description) values (null, ?, ?, ?)',

        SELECT_ALL: 'select id, meta_type_id, name, description from meta',
        SELECT_BY_ID : 'select id, meta_type_id, name, description from meta where id = ?',
        SELECT_BY_NAME : 'select id, meta_type_id, name, description from meta where name = ?',
        SELECT_BY_ID_NAME : 'select id, meta_type_id, name, description from meta where id = ? and name = ?',

        UPDATE_BY_ID: 'update meta set name = ? where id = ?',

        DELETE_BY_ID : 'delete from meta where id = ?',
        DELETE_ALL : 'delete from meta',

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

        CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, name text);',

        INSERT_BY_NAME : 'insert into task (id, name) values (null, ?)',
        INSERT_BY_ID_NAME : 'insert into task(id, name) values (?, ?)',

        SELECT_ALL: 'select id, name from task',
        SELECT_BY_ID : 'select id, name from task where id = ?',
        SELECT_BY_NAME : 'select id, name from task where name = ?',
        SELECT_BY_ID_NAME : 'select id, name from task where id = ? and name = ?',

        UPDATE_BY_ID: 'update task set name = ? where id = ?',

        DELETE_BY_ID : 'delete from task where id = ?',
        DELETE_ALL : 'delete from task',

        GET_MAX_ID : COMMON_SQL.GET_MAX_ID + 'task',
    },
};

console.log(SQL);

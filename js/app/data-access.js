/* SQL for clean up testing
drop table meta;
drop table meta_type;
drop table task;
drop table task_meta;
drop table task_note;
drop table task_reminder;
drop table __WebKitDatabaseInfoTable__;
*/

var TABLE_NAMES = {
    TASK: 'task',
    TASK_META: 'task_meta',
    META: 'meta',
    META_TYPE: 'meta_type',
    TASK_NOTE: 'task_note',
    TASK_REMINDER: 'task_reminder'
};

//TODO Change to SQL.TASK_META.xxx
var TASK_META_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAMES.TASK_META + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int)'
};
var META_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAMES.META + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text)'
};
var META_TYPE_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAMES.META_TYPE + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text)'
}
var TASK_NOTE_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAMES.TASK_NOTE + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, content text, create_date real)'
};
var TASK_REMINDER_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAMES.TASK_REMINDER + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, next_reminder_time real)'
}
var TASK_SQL = {
    CREATE_TABLE : 'CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, title text);',
    INSERT_BY_TITLE : 'insert into task (id, title) values (null, ?)',
    INSERT_BY_ID_TITLE : 'insert into task(id, title) values (?, ?)',

    SELECT_BY_ID : 'select id, title from task where id = ?',
    SELECT_BY_TITLE : 'select id, title from task where title = ?',
    SELECT_BY_ID_TITLE : 'select id, title from task where id = ? and title = ?',

    UPDATE_BY_ID: 'update task set title = ? where id = ?',

    DELETE_BY_ID : 'delete from task where id = ?',
    DELETE_ALL : 'delete from task',

    GET_MAX_ID : 'select max(id) from task'
    //meta_type : 'insert into meta_type (id, name, description) values (null, ?, ?)',
    //meta : 'insert into task meta (id, type_id, name, description) values (null, ?, ?, ?)',
    //task_meta : 'insert into task_meta (id, type_id, name, description) values (null, ?, ?, ?)',
    //task_note : 'insert into task_note (id, task_id, content, create_date) values (null, ?, ?, ?)',
    //task_reminder : 'insert into task_reminder (id, task_id, next_reminder_time) values (null, ?, ?)'
};


var ID_COLUMN_NAME = "id";

var TASK_COLUMNS = {
    ID : ID_COLUMN_NAME,
    TITLE: "title"
}

var dataAccess = (function (){
    var dbInited = false;

    function runSQL(createTableSql, sql, data, successCallback, failureCallback){
        dataAccess.createDatabaseConnection(createTableSql);
        html5sql.process(sql, data, successCallback, failureCallback);
    }

    return {
        logInfo: false,
        logErrors: true,
        createDatabaseConnection: function (createTableSql){
            if(dbInited != true){
                if(html5sql.database === null){
                    html5sql.database = openDatabase('peaceful_better_life_xiangqian_liu', '0.0.3', 
                                                     'Local Database for Peaceful & Better Life App', 2*1024*1024);
                }
                dbInited = (html5sql.database != null);
            }
            //if(dbInited) {
                //html5sql.process(createTableSql,[]);
            //}
            return html5sql.database;
        },

        task : {
            create: function(title, successCallback, failureCallback){
                runSQL(TASK_SQL.CREATE_TABLE, TASK_SQL.INSERT_BY_TITLE, [title], successCallback, failureCallback);
            },
            delete: function(id, successCallback, failureCallback){
                runSQL(TASK_SQL.DELETE_BY_ID, [id], successCallback, failureCallback);
            },
            update: function(id, title, successCallback, failureCallback){
                runSQL(TASK_SQL.UPDATE_BY_ID, [title, id], successCallback, failureCallback);
            },
            getById: function(id, successCallback, failureCallback){
                runSQL(TASK_SQL.SELECT_BY_ID, [id], successCallback, failureCallback);
            },
            getByTitle: function(title, successCallback, failureCallback){
                runSQL(TASK_SQL.SELECT_BY_TITLE, [title], successCallback, failureCallback);
            },
            getByIdAndTitle: function(id, title, successCallback, failureCallback){
                runSQL(TASK_SQL.SELECT_BY_ID_TITLE , [id, title], successCallback, failureCallback);
            },
        }
    };
})();


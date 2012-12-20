var DB_INIT_SQL = [
    'CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY AUTOINCREMENT, title text);',
    'CREATE TABLE IF NOT EXISTS task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int);',
    'CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY AUTOINCREMENT, type_id int, name text, description text);',
    'CREATE TABLE IF NOT EXISTS meta_type (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, description text);',
    'CREATE TABLE IF NOT EXISTS task_note (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, content text, create_date real);',
    'CREATE TABLE IF NOT EXISTS task_reminder (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, next_reminder_time real);' 
];

var INSERT_SQL = {
   task : 'insert into task (id, title) values (null, ?)',
   meta_type : 'insert into meta_type (id, name, description) values (null, ?, ?)',
   meta : 'insert into task meta (id, type_id, name, description) values (null, ?, ?, ?)',
   task_meta : 'insert into task_meta (id, type_id, name, description) values (null, ?, ?, ?)',
   task_note : 'insert into task_note (id, task_id, content, create_date) values (null, ?, ?, ?)',
   task_reminder : 'insert into task_reminder (id, task_id, next_reminder_time) values (null, ?, ?)'
};

var dataAccess = (function (){
    var dbInited = false;

    function lazyOpenDatabase(){
        if(false == dbInited) {
            dataAccess.openDatabase();
        }
    }

    function runSQL(sql, data, successCallback, failureCallback){
        html5sql.process(
            [{
                sql: sql,
                data: [data]
            }],
            successCallback,
            failureCallback
        );
    }

    return {
        logInfo: false,
        logErrors: true,
        openDatabase: function (){
            if(html5sql.database === null){
                html5sql.openDatabase('peaceful_better_life_xiangqian_liu', 'Local Database for Peaceful & Better Life App', 2*1024*1024);
            }
            html5sql.changeVersion("0.0.2", "0.0.3", DB_INIT_SQL);
            var result = html5sql.database;
            if(result != null){
                dbInited = true;
            }
            return result;
        },
                                                   
        createTask: function(title, successCallback, failureCallback){
            lazyOpenDatabase();
            runSQL(INSERT_SQL.task, [title], successCallback, failureCallback);
        },
    };
})();


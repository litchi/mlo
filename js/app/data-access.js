var db_init_sql_script = [
    'CREATE TABLE IF NOT EXISTS task (id int unique, title text);',
    'CREATE TABLE IF NOT EXISTS task_meta (id int unique, task_id int, meta_id int);',
    'CREATE TABLE IF NOT EXISTS meta (id int unique, type_id int, name text, description text);',
    'CREATE TABLE IF NOT EXISTS meta_type (id int unique, name text, description text);',
    'CREATE TABLE IF NOT EXISTS task_note (id int unique, task_id int, content text, create_date real);',
    'CREATE TABLE IF NOT EXISTS task_reminder (id int unique, task_id int, next_reminder_time real);' 
];

var dataAccess = (function (){
    var dbInited = false,
    initdb = function(){
        html5sql.process(db_init_sql_script);
    };
    return {
        logInfo: false,
        logErrors: false,
        openDatabase: function (){
            if(typeof(html5sql.database) === null){
                html5sql.openDatabase('peaceful_better_life_xiangqian_liu', '0.0.1', 'Local Database for Peaceful & Better Life App', 2*1024*1024);
            }
            initdb();            
            return html5sql.database;
        },
    };
})();


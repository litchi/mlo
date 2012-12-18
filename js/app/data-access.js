var dataAccess = (function (){
    return {
        logInfo: false,
        logErrors: false,
        openDatabase: function (){
            if(typeof(html5sql.database) === null){
                html5sql.openDatabase('peaceful_better_life_xiangqian_liu', '0.0.1', 'Local Database for Peaceful & Better Life App', 2*1024*1024);
            }
            return html5sql.database;
        },
    };
})();
/*
*tx.executeSql('CREATE TABLE task (id int unique, title text);'  
*+ 'CREATE TABLE task_meta (id int unique, task_id int, meta_id int);'  
*+ 'CREATE TABLE meta (id int unique, type_id int, name text, description text);' 
*+ 'CREATE TABLE meta_type (id int unique, name text, description text);' 
*+ 'CREATE TABLE task_note (id int unique, task_id int, content text, create_date real);'
*+ 'CREATE TABLE task_reminder (id int unique, task_id int, next_reminder_time real)'),
*/

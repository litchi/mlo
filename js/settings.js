function reCreateDatabase(){
    //Create a namespace to hold our database variable
    alert("Entering create database");
    if (typeof(peacefulbetterlife) === 'undefined') {
        peacefulbetterlife = {};
    }
    alert(peacefulbetterlife);

    //This method is only called once (the first time the database is created)
    function onDBCreate(database) {
        alert('onDBCreate');
        //Attach the database because "window.openDatabase" would not have returned it
        /*
         *peacefulbetterlife.db = database;
         *alert(database);
         *database.transaction(
         *    function (tx) {
         *        //Create tables 
         *        tx.executeSql('CREATE TABLE task (id int unique, title text)'),  
         *        tx.executeSql('CREATE TABLE meta_type (id int unique, name text, description text)'), 
         *        tx.executeSql('CREATE TABLE meta (id int unique, meta_type_id int, name text, description text)'), 
         *        tx.executeSql('CREATE TABLE task_meta (id int unique, task_id int, meta_id int)'), 
         *        tx.executeSql('CREATE TABLE task_note (id int unique, task_id int, content text, create_date real)'),
         *        tx.executeSql('CREATE TABLE task_reminder (id int unique, task_id int, next_reminder_time real)'),
         *        [],
         *        function (tx, res) {
         *            alert("Table Created Successfully");
         *        },
         *        function (tx, err) {
         *            alert("ERROR - Table creation failed - code: " + err.code + ", message: " + err.message);
         *        });
         *    }
         */
    }

    if (window.openDatabase) {
        alert('window.openDatabase is not null');
        //Will either return the existing database or null and call our creation callback onDBCreate
        peacefulbetterlife.db = window.openDatabase('peaceful_better_life_xiangqian_liu', '0.0.1', 'Local Database for Peaceful & Better Life App', 2*1024*1024, onDBCreate);
        alert (peacefulbetterlife.db);
    } else {
        alert("This device does not have HTML5 Database support");
    }
}
/*
*tx.executeSql('CREATE TABLE task (id int unique, title text);'  
*+ 'CREATE TABLE task_meta (id int unique, task_id int, meta_id int);'  
*+ 'CREATE TABLE meta (id int unique, type_id int, name text, description text);' 
*+ 'CREATE TABLE meta_type (id int unique, name text, description text);' 
*+ 'CREATE TABLE task_note (id int unique, task_id int, content text, create_date real);'
*+ 'CREATE TABLE task_reminder (id int unique, task_id int, next_reminder_time real)'),
*/

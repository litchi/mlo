describe("Data Access API", function() {

    var db;
    var check_table_exists_sql = "SELECT COUNT(*) FROM sqlite_master where type='table' and name=?";
    var table_names = {
        task: 'task',
        task_meta: 'task_meta',
        meta: 'meta',
        meta_type: 'meta_type',
        task_note: 'task_note',
        task_reminder: 'task_reminder'
    };
    var task_table_insert_sql = "insert into task"; 

    beforeEach(function() {
        db = dataAccess.openDatabase();
    });

    it("Just a hello world unit test case to make sure the unit test framework is working!", function() {
        var helloworld="Hello World!";
        expect(helloworld).toEqual("Hello World!");
    });

    it("The database should be opened successfully", function(){
        expect(db).toBeDefined();
        var notNull = (db == null);
        expect(notNull).toBeFalsy();
    });

    describe("Upon opening db, all tables should be exists", function(){

        function check_table_exists (table_name){
            console.log("Checking table '" + table_name + "' exists");
            var t_results, t_arrays, t_error;
            html5sql.process(
                [{
                    sql: check_table_exists_sql,
                    data: [table_name]
                }],
                function(transaction, results, arrays){
                    t_results = results;
                    t_arrays = arrays;
                },
                function(error, statement){
                    t_error = error;
                }
            );
            waits(100);
            runs(function() {
                expect(t_error).toBeUndefined();
                expect(t_arrays).toBeDefined();
                expect(t_arrays.length).toEqual(1);
                expect(t_arrays[0]["COUNT(*)"]).toEqual(1);
            });
        };

        it("task table should exists", function(){
            check_table_exists(table_names.task);
        });

        it("task_meta table should be created", function(){
            check_table_exists(table_names.task_meta);
        });

        it("meta table should be created", function(){
            check_table_exists(table_names.meta);
        });

        it("meta_type table should be created", function(){
            check_table_exists(table_names.meta_type);
        });

        it("task_note table should be created", function(){
            check_table_exists(table_names.task_note);
        });

        it("task_reminder table should be created", function(){
            check_table_exists(table_names.task_reminder);
        });
    });
    
    describe("Insert into tables", function(){
        it("Insert into task table", function(){

            var taskTitle = "This is the first task";

            dataAccess.createTask(taskTitle);

            var t_results, t_arrays, t_error;
            html5sql.process(
                [{
                    sql: "select id, title from task where title = ?",
                    data: [taskTitle]
                }],
                function(transaction, results, arrays){
                    t_results = results;
                    t_arrays = arrays;
                },
                function(error, statement){
                    t_error = error;
                }
            );
            waits(100);
            runs(function() {
                expect(t_error).toBeUndefined();
                expect(t_arrays).toBeDefined();
                expect(t_arrays.length).toEqual(1);
            });
        });
    });
});

describe("Data Access API", function() {

    var db;
    var check_table_exists_sql = "SELECT COUNT(*) FROM sqlite_master where type='table' and name='?'";
    var table_names = [{
        task: 'task',
        task_meta: 'task_meta',
        meta: 'meta',
        meta_type: 'meta_type',
        task_note: 'task_note',
        task_reminder: 'task_reminder'
    }];

    beforeEach(function() {
        db = dataAccess.openDatabase();
    });

    it("Just a hello world unit test case to make sure the unit test framework is working!", function() {
        var helloworld="Hello World!";
        expect("Hello World!").toEqual(helloworld);
    });

    it("The database opened should be defined", function(){
        expect(db).toBeDefined();
    });

    describe("Upon opening db, all tables should be exists", function(){

        function check_table_exists (table_name){
            html5sql.process(
                check_table_exists_sql,
                table_name,
                function(transaction, results){
                    expect(1).toEqual(results);
                },
                function(error, statement){
                    expect(true).toBeFalsy();                
                }
            );
        };

        it("task table should be created"), function(){
            check_table_exists(table_names.task);
        };

        it("task_meta table should be created"), function(){
            check_table_exists(table_names.task_meta);
        };

        it("meta table should be created"), function(){
            check_table_exists(table_names.meta);
        };

        it("meta_type table should be created"), function(){
            check_table_exists(table_names.meta_type);
        };

        it("task_note table should be created"), function(){
            check_table_exists(table_names.task_note);
        };

        it("task_reminder table should be created"), function(){
            check_table_exists(table_names.task_reminder);
        };
    });

});

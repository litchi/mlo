describe("Unit Test for Data Access API", function() {

    var CHECK_TABLE_EXISTS_SQL = "SELECT COUNT(*) FROM sqlite_master where type='table' and name= ? ";

    var db;
    var testIdentity = new Date().getMilliseconds(); 

    function generateTestField (topic, caseNo) {
        return "[" + testIdentity + '|Case #' + caseNo + "] " + topic + " " + new Date().valueOf(); 
    };

    function assertSqlExecuter (v_sql, v_data, assertCallback){
        var t_results, t_arrays, t_error;
        html5sql.process(
            v_sql,
            v_data,
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
            assertCallback(t_results, t_arrays, t_error);
        });
    };

    function assertTaskFieldValue(arrays, error, column, value){
        expect(error).toBeUndefined();
        expect(arrays).toBeDefined();
        expect(arrays.length).toEqual(1);
        expect(arrays[0]).toBeDefined();
        expect(arrays[0][column]).toBeDefined();
        expect(arrays[0][column]).toEqual(value);
    };

    function assertTaskFields(arrays, errors, id, title){
        assertTaskFieldValue(arrays, errors, TASK_COLUMNS.ID, id);
        assertTaskFieldValue(arrays, errors, TASK_COLUMNS.TITLE, title);
    };

    afterEach(function () {
        //html5sql.process( [ TASK_SQL.DELETE_ALL ]);
    });

    it("#0 Just a hello world unit test case to make sure the unit test framework is working!", function() {
        var helloworld="Hello World!";
        expect(helloworld).toEqual("Hello World!");
    });

    it("#1 The database should be opened successfully", function(){
        db = dataAccess.createDatabaseConnection();
        expect(db).toBeDefined();
        var notNull = (db == null);
        expect(notNull).toBeFalsy();
    });

    describe("Upon opening db, all tables should be exists", function(){

        function tableExistsAssert(t_results, t_arrays, t_error){
            expect(t_error).toBeUndefined();
            expect(t_arrays).toBeDefined();
            expect(t_arrays.length).toEqual(1);
            expect(t_arrays[0]["COUNT(*)"]).toEqual(1);
        }

        it("#2 task table should exists", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.TASK], tableExistsAssert);
        });

        it("#3 task_meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.TASK_META], tableExistsAssert);
        });

        it("#4 meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.META], tableExistsAssert);
        });

        it("#5 meta_type table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.META_TYPE], tableExistsAssert);
        });

        it("#6 task_note table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.TASK_NOTE], tableExistsAssert);
        });

        it("#7 task_reminder table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [TABLE_NAMES.TASK_REMINDER], tableExistsAssert);
        });
    });

    describe("Task data access", function(){
        it("#8 Insert into task table", function(){

            var taskTitle = generateTestField(TABLE_NAMES.TASK, 8);

            dataAccess.task.create(taskTitle);

            assertSqlExecuter(TASK_SQL.SELECT_BY_TITLE, [taskTitle], function(t_results, t_arrays, t_error) {
                assertTaskFieldValue(t_arrays, t_error, TASK_COLUMNS.TITLE, taskTitle);
            });
        });

        it("#9 Delete from task table", function() {
            var taskTitle = generateTestField(TABLE_NAMES.TASK, 9);
            var id;

            assertSqlExecuter(TASK_SQL.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"] + 1;
                assertSqlExecuter(TASK_SQL.INSERT_BY_ID_TITLE, [id, taskTitle], function(t_results, t_arrays, t_error) {
                    assertSqlExecuter(TASK_SQL.SELECT_BY_ID_TITLE, [id, taskTitle], function(t_results, t_arrays, t_error){
                        assertTaskFields(t_arrays, t_error, id, taskTitle);
                        dataAccess.task.delete(id);
                        assertSqlExecuter(TASK_SQL.SELECT_BY_ID, [id], function(t_results, t_arrays, t_error) {
                            expect(t_arrays).toBeDefined();
                            expect(t_arrays.length).toEqual(0);
                        });
                    });
                });
            });
        });

        it("#10 Update task table", function(){
            //Create a task
            var taskTitle = generateTestField(TABLE_NAMES.TASK, 10);
            dataAccess.task.create(taskTitle);
            //Update the task
            assertSqlExecuter(TASK_SQL.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"];
                updatedTaskTitle = generateTestField(TABLE_NAMES.TASK, 10) + " updated";
                dataAccess.task.update(id, updatedTaskTitle);
                //Assert
                assertSqlExecuter(TASK_SQL.SELECT_BY_ID_TITLE, [id, updatedTaskTitle], function(t_results, t_arrays, t_error){
                    assertTaskFields(t_arrays, t_error, id, updatedTaskTitle);
                });
            });
        });

        it("#11 Read from task table by id", function(){
            assertReadTask(function(id, taskTitle){
                dataAccess.task.getById(id, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskTitle);
                });
            });
        });

        it("#12 Read from task table by title", function(){
            assertReadTask(function(id, taskTitle){
                dataAccess.task.getByTitle(taskTitle, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskTitle);
                });
            });
        });                                  

        it("#13 Read from task table by title and id", function(){
            assertReadTask(function(id, taskTitle){
                dataAccess.task.getByIdAndTitle(id, taskTitle, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskTitle);
                });
            });                                  
        });

        function assertReadTask(assertCallback){
            var id, taskTitle = generateTestField(TABLE_NAMES.TASK, 11);
            dataAccess.task.create(taskTitle, function(transaction, results, arrays){
                id = results.insertId;
            }, function(error, statement){
                expect(error).toBeUndefined();
            });
            waits(100);
            runs(function() {
                assertCallback(id, taskTitle);
            });
        }
    });
});

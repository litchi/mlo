describe("Unit Test for Data Access API", function() {

    var CHECK_TABLE_EXISTS_SQL = "SELECT COUNT(*) FROM sqlite_master where type='table' and name= ? ";

    var db;
    var testIdentity = new Date().getMilliseconds(); 

    beforeEach(function(){
        dataAccess.createDatabaseConnection();
    });

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

    function assertObject(obj, expected){
        expect(obj).toBeDefined();
        expect(obj).toEqual(expected);

    }

    function assertSqlResultAndField(arrays, error, column, value){
        expect(error).toBeUndefined();
        expect(arrays).toBeDefined();
        expect(arrays.length).toEqual(1);
        expect(arrays[0]).toBeDefined();
        assertObject(arrays[0][column], value);
    };

    afterEach(function () {
        //html5sql.process( [ SQL.TASK.DELETE_ALL ]);
        //html5sql.process( [ SQL.META_TYPE.DELETE_ALL ]);
    });

    it("#0 Hello world test case to make sure the unit test framework is working!", function() {
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
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.TASK.TABLE_NAME], tableExistsAssert);
        });

        it("#3 task_meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.TASK_META.TABLE_NAME], tableExistsAssert);
        });

        it("#4 meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.META.TABLE_NAME], tableExistsAssert);
        });

        it("#5 meta_type table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.META_TYPE.TABLE_NAME], tableExistsAssert);
        });

        it("#6 task_note table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.TASK_NOTE.TABLE_NAME], tableExistsAssert);
        });

        it("#7 task_reminder table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [SQL.TASK_REMINDER.TABLE_NAME], tableExistsAssert);
        });
    });

    describe("Task data access", function(){
        it("#8 Insert into task table", function(){

            var taskName = generateTestField(SQL.TASK.COLS.NAME, 8);

            dataAccess.task.create(taskName);

            assertSqlExecuter(SQL.TASK.SELECT_BY_NAME, [taskName], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, SQL.TASK.COLS.NAME, taskName);
            });
        });

        it("#9 Delete from task table", function() {
            var taskName = generateTestField(SQL.TASK.COLS.NAME, 9);
            var id;

            assertSqlExecuter(SQL.TASK.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"] + 1;
                assertSqlExecuter(SQL.TASK.INSERT_BY_ID_NAME, [id, taskName], function(t_results, t_arrays, t_error) {
                    assertSqlExecuter(SQL.TASK.SELECT_BY_ID_NAME, [id, taskName], function(t_results, t_arrays, t_error){
                        assertTaskFields(t_arrays, t_error, id, taskName);
                        dataAccess.task.delete(id);
                        assertSqlExecuter(SQL.TASK.SELECT_BY_ID, [id], function(t_results, t_arrays, t_error) {
                            expect(t_arrays).toBeDefined();
                            expect(t_arrays.length).toEqual(0);
                        });
                    });
                });
            });
        });

        it("#10 Update task table", function(){
            //Create a task
            var taskName = generateTestField(SQL.TASK.COLS.NAME, 10);
            dataAccess.task.create(taskName);
            //Update the task
            assertSqlExecuter(SQL.TASK.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"];
                updatedTaskName = generateTestField(SQL.TASK.COLS.NAME, 10) + " updated";
                dataAccess.task.update(id, updatedTaskName);
                //Assert
                assertSqlExecuter(SQL.TASK.SELECT_BY_ID_NAME, [id, updatedTaskName], function(t_results, t_arrays, t_error){
                    assertTaskFields(t_arrays, t_error, id, updatedTaskName);
                });
            });
        });

        it("#11 Read from task table by id", function(){
            assertReadTask(11, function(id, taskName){
                dataAccess.task.getById(id, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });
        });

        it("#12 Read from task table by name", function(){
            assertReadTask(12, function(id, taskName){
                dataAccess.task.getByName(taskName, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });
        });                                  

        it("#13 Read from task table by name and id", function(){
            assertReadTask(13, function(id, taskName){
                dataAccess.task.getByIdAndName(id, taskName, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });                                  
        });

        function assertTaskFields(arrays, errors, id, name){
            assertSqlResultAndField(arrays, errors, SQL.TASK.COLS.ID, id);
            assertSqlResultAndField(arrays, errors, SQL.TASK.COLS.NAME, name);
        };

        function assertReadTask(caseId, assertCallback){
            var id, taskName = generateTestField(SQL.TASK.COLS.NAME, caseId);
            dataAccess.task.create(taskName, function(transaction, results, arrays){
                id = results.insertId;
            }, function(error, statement){
                expect(error).toBeUndefined();
            });
            waits(100);
            runs(function() {
                assertCallback(id, taskName);
            });
        }
    });

    describe("Meta Type data access", function (){

        it("#14 Insert into Meta Type table", function(){
            var name = generateTestField(SQL.META_TYPE.COLS.NAME, 14);
            dataAccess.metaType.create(name);
            assertSqlExecuter(SQL.META_TYPE.SELECT_BY_NAME, [name], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, SQL.META_TYPE.COLS.NAME, name);
            });
        });    
        it("#15 Insert into Type table with description", function(){
            var name = generateTestField(SQL.META_TYPE.COLS.NAME, 15);
            var desc = generateTestField(SQL.META_TYPE.COLS.DESCRIPTION, 15);
            dataAccess.metaType.create(name, desc);
            assertSqlExecuter(SQL.META_TYPE.SELECT_BY_NAME, [name], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, SQL.META_TYPE.COLS.NAME, name);
                assertSqlResultAndField(t_arrays, t_error, SQL.META_TYPE.COLS.DESCRIPTION, desc);
            });
        });    
        it("#16 Delete from Meta Type table", function() {
            var name = generateTestField(SQL.META_TYPE.COLS.NAME, 16);
            var desc = generateTestField(SQL.META_TYPE.COLS.DESCRIPTION, 16);
            var id;

            assertSqlExecuter(SQL.META_TYPE.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"] + 1;
                assertSqlExecuter(SQL.META_TYPE.INSERT_BY_ID_NAME, [id, name, desc], function(t_results, t_arrays, t_error) {
                    assertSqlExecuter(SQL.META_TYPE.SELECT_BY_ID_NAME, [id, name], function(t_results, t_arrays, t_error){
                        expect(t_error).toBeUndefined();
                        assertMetaTypeFields(t_arrays, id, name, desc);
                        dataAccess.metaType.delete(id);
                        assertSqlExecuter(SQL.META_TYPE.SELECT_BY_ID, [id], function(t_results, t_arrays, t_error) {
                            expect(t_arrays).toBeDefined();
                            expect(t_arrays.length).toEqual(0);
                        });
                    });
                });
            });
        });

        it("#17 Update Meta Type table", function(){
            var name = generateTestField(SQL.META_TYPE.COLS.NAME, 17);
            var desc = generateTestField(SQL.META_TYPE.COLS.DESCRIPTION, 17);
            dataAccess.metaType.create(name, desc);
            assertSqlExecuter(SQL.META_TYPE.GET_MAX_ID,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"];
                updatedName = name + " updated";
                updatedDesc = desc + " updated";
                dataAccess.metaType.update(id, updatedName, updatedDesc);
                assertSqlExecuter(SQL.META_TYPE.SELECT_BY_ID_NAME, [id, updatedName], function(t_results, t_arrays, t_error){
                    expect(t_error).toBeUndefined();
                    assertMetaTypeFields(t_arrays, id, updatedName, updatedDesc);
                });
            });
        });
        it("#18 Read from Meta Type table by id", function(){
            assertReadMetaType(18, function(id, name, desc){
                dataAccess.metaType.getById(id, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });
        });

        it("#19 Read from Meta Type table by name", function(){
            assertReadMetaType(19, function(id, name, desc){
                dataAccess.metaType.getByName(name, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });
        });                                  

        it("#20 Read from Meta Type table by name and id", function(){
            assertReadMetaType(20, function(id, name, desc){
                dataAccess.metaType.getByIdAndName(id, name, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });                                  
        });

        function assertReadMetaType(caseId, assertCallback){
            var id, 
            name = generateTestField(SQL.META_TYPE.COLS.NAME, caseId),
            desc = generateTestField(SQL.META_TYPE.COLS.DESCRIPTION, caseId);
            dataAccess.metaType.create(name, desc, function(transaction, results, arrays){
                id = results.insertId;
            }, function(error, statement){
                expect(error).toBeUndefined();
            });
            waits(100);
            runs(function() {
                assertCallback(id, name, desc);
            });
        }

        function assertMetaTypeFields(t_arrays, id, name, desc){
            expect(t_arrays).toBeDefined();
            expect(t_arrays.length).toEqual(1);
            expect(t_arrays[0]).toBeDefined();

            assertObject(t_arrays[0][SQL.META_TYPE.COLS.ID], id);
            assertObject(t_arrays[0][SQL.META_TYPE.COLS.NAME], name);
            assertObject(t_arrays[0][SQL.META_TYPE.COLS.DESCRIPTION], desc);
        }
    });

    describe("Meta data access", function() {
        var contextTypeId, projectTypeId, context = 'Context', project = 'project';
        beforeEach(function(){
            dataAccess.metaType.create(context, null, function(tx, result, arrays){
                contextTypeId = result.insertId; 
            });
            dataAccess.metaType.create(project, null, function(tx, result, arrays){
                projectTypeId = result.insertId;
            });
            waits(100);
        });
        afterEach(function () {
            dataAccess.metaType.delete(contextTypeId);
            dataAccess.metaType.delete(projectTypeId);
        });
        it("#21 Create Meta of Type Context", function(){
            doMetaCreateAssert(contextTypeId, 21);
        });
        it("#22 Create Meta of Type Project", function(){
            doMetaCreateAssert(projectTypeId, 22);
        });
        it("#23 Delete Meta of Type Context", function(){
            doMetaDeleteAssert(contextTypeId, 23);
        });
        it("#24 Delete Meta of Type Project", function(){
            doMetaDeleteAssert(projectTypeId, 24);
        });
        it("#25 Update Meta of Type Context", function(){
            doMetaUpdateAssert(contextTypeId, 25);
        });
        it("#26 Update Meta of Type Project", function(){
            doMetaUpdateAssert(projectTypeId, 26);
        });

        function doMetaUpdateAssert(metaTypeId, caseId){
            var updatedName, updatedDesc;
            doMetaAssert(metaTypeId, caseId, function(id, name, desc){
                updatedName = name + " Updated";
                updatedDesc = desc + " Updated";
                dataAccess.meta.update(id, updatedName, updatedDesc); 
            }, function(id){
                assertSqlExecuter(SQL.META.SELECT_BY_ID, [id], function(results, arrays, error) {
                    expect(error).toBeUndefined();
                    assertMetaFields(arrays, id, metaTypeId, updatedName, updatedDesc);
                });
            });
        }

        function doMetaDeleteAssert(metaTypeId, caseId){
            doMetaAssert(metaTypeId, caseId, function(id){
                dataAccess.meta.delete(id);
            }, function(id){
                assertSqlExecuter(SQL.META.SELECT_BY_ID, [id], function(results, arrays, error) {
                    expect(arrays).toBeDefined();
                    expect(arrays.length).toEqual(0);
                });
            });
        }

        function doMetaCreateAssert(metaTypeId, caseId){
            doMetaAssert(metaTypeId, caseId, function(id){
            }, function(id, metaTypeId, name, desc){
                assertSqlExecuter(SQL.META.SELECT_BY_NAME, [name], function(results, arrays, error) {
                    expect(error).toBeUndefined();
                    assertMetaFields(arrays, id, metaTypeId, name, desc);
                });
            });
        }

        function doMetaAssert(metaTypeId, caseId, operCallback, assertCallback){
            var id, 
            name = generateTestField(SQL.META.COLS.NAME, caseId),
            desc = generateTestField(SQL.META.COLS.DESCRIPTION, caseId);
            dataAccess.meta.create(name, metaTypeId, desc, function(tx, results, arrays){
                id = results.insertId;
            });
            waits(100);
            runs(function() {
                operCallback(id, name, desc);
            });
            waits(100);
            runs(function(){
                assertCallback(id, metaTypeId, name, desc);
            });
        }

        function assertMetaFields(t_arrays, id, meta_type_id, name, desc){
            expect(t_arrays).toBeDefined();
            expect(t_arrays.length).toEqual(1);
            expect(t_arrays[0]).toBeDefined();

            assertObject(t_arrays[0][SQL.META.COLS.ID], id);
            assertObject(t_arrays[0][SQL.META.COLS.META_TYPE_ID], meta_type_id);
            assertObject(t_arrays[0][SQL.META.COLS.NAME], name);
            assertObject(t_arrays[0][SQL.META.COLS.DESCRIPTION], desc);
        }
    });

});

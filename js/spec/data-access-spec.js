describe("Unit Test for Data Access API", function() {

    var CHECK_TABLE_EXISTS_SQL = "SELECT COUNT(*) FROM sqlite_master where type='table' and name= ? ";

    var db;
    var testIdentity = new Date().getMilliseconds(); 

    beforeEach(function(){
        DataAccess.createDatabaseConnection();
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
    function assertFails (){
        expect(true).toBeFalsy();
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
        db = DataAccess.createDatabaseConnection();
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
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [Sql.TASK.TableName], tableExistsAssert);
        });

        it("#3 task_meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [Sql.TaskMeta.TableName], tableExistsAssert);
        });

        it("#4 meta table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [Sql.Meta.TableName], tableExistsAssert);
        });

        it("#5 meta_type table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [Sql.MetaType.TableName], tableExistsAssert);
        });

        it("#6 task_note table should be created", function(){
            assertSqlExecuter(CHECK_TABLE_EXISTS_SQL, [Sql.TaskNote.TableName], tableExistsAssert);
        });

    });
    describe("Task data access", function(){
        it("#8 Insert into task table", function(){
            var taskName = generateTestField(Sql.TASK.Cols.Name, 8);
            DataAccess.task.create(taskName);
            assertSqlExecuter(Sql.TASK.SelectByName, [taskName], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, Sql.TASK.Cols.Name, taskName);
            });
        });

        it("#9 Delete from task table", function() {
            var taskName = generateTestField(Sql.TASK.Cols.Name, 9);
            var id;

            assertSqlExecuter(Sql.TASK.GetMaxId,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"] + 1;
                assertSqlExecuter(Sql.TASK.InsertByIdName, [id, taskName], function(t_results, t_arrays, t_error) {
                    assertSqlExecuter(Sql.TASK.SelectByIdName, [id, taskName], function(t_results, t_arrays, t_error){
                        assertTaskFields(t_arrays, t_error, id, taskName);
                        DataAccess.task.delete(id);
                        assertSqlExecuter(Sql.TASK.SelectById, [id], function(t_results, t_arrays, t_error) {
                            expect(t_arrays).toBeDefined();
                            expect(t_arrays.length).toEqual(0);
                        });
                    });
                });
            });
        });

        it("#10 Update task table", function(){
            //Create a task
            var taskName = generateTestField(Sql.TASK.Cols.Name, 10);
            DataAccess.task.create(taskName);
            //Update the task
            assertSqlExecuter(Sql.TASK.GetMaxId,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"];
                updatedTaskName = generateTestField(Sql.TASK.Cols.Name, 10) + " updated";
                DataAccess.task.update(id, updatedTaskName);
                //Assert
                assertSqlExecuter(Sql.TASK.SelectByIdName, [id, updatedTaskName], function(t_results, t_arrays, t_error){
                    assertTaskFields(t_arrays, t_error, id, updatedTaskName);
                });
            });
        });

        it("#11 Read from task table by id", function(){
            assertReadTask(11, function(id, taskName){
                DataAccess.task.getById(id, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });
        });

        it("#12 Read from task table by name", function(){
            assertReadTask(12, function(id, taskName){
                DataAccess.task.getByName(taskName, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });
        });                                  

        it("#13 Read from task table by name and id", function(){
            assertReadTask(13, function(id, taskName){
                DataAccess.task.getByIdAndName(id, taskName, function(transaction, results, arrays){
                    assertTaskFields(arrays, undefined, id, taskName);
                });
            });                                  
        });

        it("#13.1 Mark Task as Done", function(){
            assertFails();
        });
        it("#13.2 Get All Task of status New", function(){
            assertFails();
        });
        it("#13.4 Get All Next Actions", function(){
            assertFails();
        });
        it("#13.5 Get All in Basket", function(){
            assertFails();
        });
        it("#13.6 Get All Someday & Maybe", function(){
            assertFails();
        });
        it("#13.7 Get by Meta", function(){
            assertFails();
        });

        function assertTaskFields(arrays, errors, id, name){
            assertSqlResultAndField(arrays, errors, Sql.TASK.Cols.Id, id);
            assertSqlResultAndField(arrays, errors, Sql.TASK.Cols.Name, name);
        };

        function assertReadTask(caseId, assertCallback){
            var id, taskName = generateTestField(Sql.TASK.Cols.Name, caseId);
            DataAccess.task.create(taskName, function(transaction, results, arrays){
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
            var name = generateTestField(Sql.MetaType.Cols.Name, 14);
            DataAccess.metaType.create(name);
            assertSqlExecuter(Sql.MetaType.SelectByName, [name], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, Sql.MetaType.Cols.Name, name);
            });
        });    
        it("#15 Insert into Type table with description", function(){
            var name = generateTestField(Sql.MetaType.Cols.Name, 15);
            var desc = generateTestField(Sql.MetaType.Cols.Description, 15);
            DataAccess.metaType.create(name, desc);
            assertSqlExecuter(Sql.MetaType.SelectByName, [name], function(t_results, t_arrays, t_error) {
                assertSqlResultAndField(t_arrays, t_error, Sql.MetaType.Cols.Name, name);
                assertSqlResultAndField(t_arrays, t_error, Sql.MetaType.Cols.Description, desc);
            });
        });    
        it("#16 Delete from Meta Type table", function() {
            var name = generateTestField(Sql.MetaType.Cols.Name, 16);
            var desc = generateTestField(Sql.MetaType.Cols.Description, 16);
            var id;

            assertSqlExecuter(Sql.MetaType.GetMaxId,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"] + 1;
                assertSqlExecuter(Sql.MetaType.InsertByIdName, [id, name, desc], function(t_results, t_arrays, t_error) {
                    assertSqlExecuter(Sql.MetaType.SelectByIdName, [id, name], function(t_results, t_arrays, t_error){
                        expect(t_error).toBeUndefined();
                        assertMetaTypeFields(t_arrays, id, name, desc);
                        DataAccess.metaType.delete(id);
                        assertSqlExecuter(Sql.MetaType.SelectById, [id], function(t_results, t_arrays, t_error) {
                            expect(t_arrays).toBeDefined();
                            expect(t_arrays.length).toEqual(0);
                        });
                    });
                });
            });
        });

        it("#17 Update Meta Type table", function(){
            var name = generateTestField(Sql.MetaType.Cols.Name, 17);
            var desc = generateTestField(Sql.MetaType.Cols.Description, 17);
            DataAccess.metaType.create(name, desc);
            assertSqlExecuter(Sql.MetaType.GetMaxId,null, function(results, arrays, errors){
                id = arrays[0]["max(id)"];
                updatedName = name + " updated";
                updatedDesc = desc + " updated";
                DataAccess.metaType.update(id, updatedName, updatedDesc);
                assertSqlExecuter(Sql.MetaType.SelectByIdName, [id, updatedName], function(t_results, t_arrays, t_error){
                    expect(t_error).toBeUndefined();
                    assertMetaTypeFields(t_arrays, id, updatedName, updatedDesc);
                });
            });
        });
        it("#18 Read from Meta Type table by id", function(){
            assertReadMetaType(18, function(id, name, desc){
                DataAccess.metaType.getById(id, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });
        });

        it("#19 Read from Meta Type table by name", function(){
            assertReadMetaType(19, function(id, name, desc){
                DataAccess.metaType.getByName(name, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });
        });                                  

        it("#20 Read from Meta Type table by name and id", function(){
            assertReadMetaType(20, function(id, name, desc){
                DataAccess.metaType.getByIdAndName(id, name, function(transaction, results, arrays){
                    assertMetaTypeFields(arrays, id, name, desc);
                });
            });                                  
        });

        it("#20.1 Get All Internal Meta Type", function(){
            assertFails();
        });

        it("#20.2 Get All Non-Internal Meta Type", function(){
            assertFails();
        });

        function assertReadMetaType(caseId, assertCallback){
            var id, 
            name = generateTestField(Sql.MetaType.Cols.Name, caseId),
            desc = generateTestField(Sql.MetaType.Cols.Description, caseId);
            DataAccess.metaType.create(name, desc, function(transaction, results, arrays){
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

            assertObject(t_arrays[0][Sql.MetaType.Cols.Id], id);
            assertObject(t_arrays[0][Sql.MetaType.Cols.Name], name);
            assertObject(t_arrays[0][Sql.MetaType.Cols.Description], desc);
        }
    });
    describe("Meta data access", function() {
        var metaTypeId, metaTypeName = generateTestField(Sql.Meta.Cols.Name, "21 - #24");
        beforeEach(function(){
            DataAccess.metaType.create(metaTypeName, null, function(tx, result, arrays){
                metaTypeId = result.insertId;
            });
            waits(100);
        });
        it("#21 Create Meta", function(){
            doMetaCreateAssert(21);
        });
        it("#22 Delete Meta", function(){
            doMetaDeleteAssert(22);
        });
        it("#23 Update Meta", function(){
            doMetaUpdateAssert(23);
        });
        it("#24 Get Meta by Meta Type Name", function(){
            doMetaAssert(24, function(){}, function(id, metaTypeId, name, desc){
                DataAccess.meta.getByTypeName(metaTypeName, function(tx, results, arrays){
                    assertMetaFieldsInArray(arrays, id, metaTypeId, name, desc);
                }, assertFails);
            });
        });
        it("#25 Get Meta by Meta Type ID", function(){
            assertFails();
        });
        it("#26 Get Meta by Meta Name", function(){
            assertFails();
        });
        it("#27 Get Next Action Meta Definition", function(){
            assertFails();
        });
        it("#28 Get In-Basket Meta Definition", function(){
            assertFails();
        });
        it("#29 Get Someday/Maybe Meta Definition", function(){
            assertFails();
        });
        function doMetaUpdateAssert(caseId){
            var updatedName, updatedDesc;
            doMetaAssert(caseId, function(id, name, desc){
                updatedName = name + " Updated";
                updatedDesc = desc + " Updated";
                DataAccess.meta.update(id, updatedName, updatedDesc);
            }, function(id){
                assertSqlExecuter(Sql.Meta.SelectById, [id], function(results, arrays, error) {
                    expect(error).toBeUndefined();
                    assertMetaFieldsInArray(arrays, id, metaTypeId, updatedName, updatedDesc);
                });
            });
        }
        function doMetaDeleteAssert(caseId){
            doMetaAssert(caseId, function(id){
                DataAccess.meta.delete(id);
            }, function(id){
                assertSqlExecuter(Sql.Meta.SelectById, [id], function(results, arrays, error) {
                    expect(arrays).toBeDefined();
                    expect(arrays.length).toEqual(0);
                });
            });
        }
        function doMetaCreateAssert(caseId){
            doMetaAssert(caseId, function(id){
            }, function(id, metaTypeId, name, desc){
                assertSqlExecuter(Sql.Meta.SelectByName, [name], function(results, arrays, error) {
                    expect(error).toBeUndefined();
                    assertMetaFieldsInArray(arrays, id, metaTypeId, name, desc);
                });
            });
        }
        function doMetaAssert(caseId, operCallback, assertCallback){
            var id, 
            name = generateTestField(Sql.Meta.Cols.Name, caseId),
            desc = generateTestField(Sql.Meta.Cols.Description, caseId);
            DataAccess.meta.create(name, metaTypeId, desc, function(tx, results, arrays){
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
        function assertMetaFieldsInArray(arrays, id, meta_type_id, name, desc){
            expect(arrays).toBeDefined();
            expect(arrays.length).toEqual(1);
            assertMetaFields(arrays[0], id, meta_type_id, name, desc);
        }
        function assertMetaFields(value, id, meta_type_id, name, desc){
            expect(value).toBeDefined();
            assertObject(value[Sql.Meta.Cols.Id], id);
            assertObject(value[Sql.Meta.Cols.MetaTypeId], meta_type_id);
            assertObject(value[Sql.Meta.Cols.Name], name);
            assertObject(value[Sql.Meta.Cols.Description], desc);
        }
    });

    describe("Task Meta data access", function() {
        it("#26 Create Task Meta", function(){
            var taskName = generateTestField('Task', 26);
            var metaTypeName = generateTestField('MetaType', 26);
            var metaTypeDesc = generateTestField('MetaType Desc', 26);
            var metaName = generateTestField('Meta', 26);
            var metaDesc = generateTestField('Meta Desc', 26);
            DataAccess.task.create(taskName, function(tx1, taskResult, obj1){
                expect(taskResult).toBeDefined();
                expect(taskResult.insertId).toBeDefined();
                DataAccess.metaType.create(metaTypeName, metaTypeDesc, function(tx2, metaTypeResult, obj2){
                    expect(metaTypeResult).toBeDefined();
                    expect(metaTypeResult.insertId).toBeDefined();
                    DataAccess.meta.create(metaName, metaTypeResult.insertId, metaDesc, function(tx3, metaResult, obj3){
                        expect(metaResult).toBeDefined();
                        expect(metaResult.insertId).toBeDefined();
                        DataAccess.taskMeta.create(taskResult.insertId, metaResult.insertId, function(tx4, taskMetaResult, obj4){
                            expect(taskMetaResult).toBeDefined();
                            expect(taskMetaResult.insertId).toBeDefined();
                            assertSqlExecuter(Sql.TaskMeta.SelectByIds, [taskResult.insertId, metaResult.insertId], function(t_results, t_arrays, t_error) {
                               expect(t_arrays).toBeDefined();
                               expect(t_arrays.length).toEqual(1);
                               assertObject(t_arrays[0][Sql.TaskMeta.Cols.TaskId], taskResult.insertId);
                               assertObject(t_arrays[0][Sql.TaskMeta.Cols.MetaId], metaResult.insertId);
                            });
                        }, assertFails);
                    }, assertFails);
                }, assertFails);            
            }, assertFails);
        });
        it("#26 Get Task Meta by Id", function(){
            assertFails();
        });
        it("#27 Get Tasks by Meta Id", function(){
            assertFails();
        });
        it("#28 Get Metas by Task Id", function(){
            assertFails();
        });
    });
});

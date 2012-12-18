describe("Data Access API", function() {

  beforeEach(function() {
  });

  it("This is just a hello world unit test case to make sure the unit test framework is working!", function() {
        var helloworld="Hello World!";
        expect("Hello World!").toEqual(helloworld);
  });

  it("The database opened should be defined", function(){
      var db = dataAccess.openDatabase();
      expect(db).toBeDefined();
  });

});

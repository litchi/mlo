#!/bin/bash
# directory to write output XML (if this doesn't exist, the results will not be generated!)

# This folder should be the same as the property ${build.target.output} in build.xml
OUTPUT_DIR="../../../target/qa/JsTestDriver/report/xml"

# run the tests
java -jar JsTestDriver.jar --config jsTestDriver.conf --port 4224 --browser open --tests all --testOutput $OUTPUT_DIR

echo "Done."

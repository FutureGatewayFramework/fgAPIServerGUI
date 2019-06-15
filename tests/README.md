# Tests
This section contains a suite of tests able to check the consistency of the FutureGateway APIServerGUI code.
To properly execute tests, some environment variables and/or configuration file changes have to be done.<br/>
Configurations are normally taken from file: `fgapiserverdaemon.conf`, however, its parameters can be overridden, using environment variables. The name of these variables have to match the configuration file parameter name, all in upper case.
The following instructions explain how to configure the different tests.

##### PYTHONPATH
The `PYTHON_PATH` environment variable must be set properly and test executed as follows:
```sh
export PYTHONPATH=$PYTHONPATH:..:.
```
This setting allows to override the MySQLdb module and tests will use testing SQL queries instead to connect a real database.

##### Test control settings
Test execution can be controlled by environment variables as listed below:

|Environment variable|Description|
|---|---|
|**FGTESTS_STOPATFAIL**| If enabled, test execution stops as soon as the first error occurs, use: `export FGTESTS_STOPATFAIL=1` to enable this feature|

#### Test configurations
Following configurations are valid for tests:

| Test case |Description|Execution|
|-----------|-----------|---------|
|fgAPIServerGUI|Basic GUI functionalities|`python -m unittest test_fgapiservergui`|

##### Configuration parameters
```
<use defaul values>
```

## MySQLdb
Test script makes use of a custom `MySQLdb` class where each SQL statement is executed by the `fgapiserverdb.py` file
 is hardcoded. Each test suite has its own list of statements stored in a dedicated python code file having the name
 `<test_suite_name>_queries.py`.
The code has to define internnaly a vector variable named: `fgapiserver_queries`, a vector of maps having the structure:
```python
{'id': <progressive query number>,
 'query': <SQL statement as it figures in the code (including %s)>,
 'result': <The SQL statement results> }, 
 ```
 Queries results are `[]` for insert and update statements, or having the following structure:
 ```
 [[col1_record1, col2_record1, ..., coln_recordn],...
  [col1_record2, col2_record2, ..., coln_record2],...
  ...
  [col1_recordm, col2_recordm, ..., coln_recordm],...
 ```
 At bottom of the queries vector, a further variable assignment is used to associate the queries to the test suite, whith:
```python
 queries = [
    {'category': <test_suite>,
     'statements': <vector of queries>]
  ```
  
 The test suite queries are imported by the `MySQLdb.py` at the top of the file and then included with several 
 variable assignment statements like: 
```queries += <test_suite_name>_queries.queries``` 

## Available tests
Below details about the tests available:

### test_fgapiserverdaemon.py
This test suites checks basic functionalities of the APIServerDaemon.

### test_fgapiserverdaemon_gui.py
This test suites checks the user interface of the APIServerDaemon.

## Travis
Travis file `.travis` contain an example of test suite execution.

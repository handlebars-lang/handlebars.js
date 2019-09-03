Add a new integration test by creating a new subfolder

Add a file "test.sh" to that runs the test. "test.sh" should exit with a non-zero exit code 
and display an error message, if something goes wrong.

* An integration test should reflect real-world setups that use handlebars.
* It should compile a minimal template and compare the output to an expected output.
* It should use "../.." as dependency for Handlebars so that the currently built library is used.

Currently, integration tests are only running on Linux, especially in travis-ci.

  
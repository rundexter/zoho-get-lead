var _   = require('lodash')
  , env = require('./env')
;

module.exports = _.merge({
    instance_state: {
        active_step :  "local_test_step"
    }
    , steps: {
        local_test_step: {
            id: 'local_test_step'
            , type: 'module'
            //The test runner will change YOUR_MODULE_NAME to the correct module name
            , name: 'YOUR_MODULE_NAME'
            , next: []
        }
    }
    , modules: {
        //The test runner will add the proper data here
    }
    , environment: {
       /*
        * ZOHO_API_KEY required in env.js
        */
    }
    , user: {
    }
    , data: {
        local_test_step: {
            input: {
                /*
                 * search_column and search_value should be defined in env.js
                 */
                "search_column"    : "email"
                , "select_columns" : [["id","email","First Name"]]
                , "search_value"   : "ilkovich@gmail.com"
            }
        }
    }
}, env);

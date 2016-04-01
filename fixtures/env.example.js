/*
 * Rename this to env.js 
 *
 * Store any secret information that is needed for execution, but
 * you don't want to push here.
 */

module.exports = {
    "environment": {
        "ZOHO_API_KEY" : ""
    }
    , data: {
        local_test_step: {
            input: {
                search_column: 'email'
                , search_value: 'foobar@example.com'
            }
        }
    }
};


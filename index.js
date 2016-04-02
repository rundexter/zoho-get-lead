var q      = require('q')
  , _      = require('lodash')
  , assert = require('assert')
  , agent  = require('superagent')
  , xml2js = require('xml2js')
;

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var self     = this
          , api_key  = step.input('api_key').first()
          , searches = step.inputObject({'searchColumn':'search_column','searchValue':'search_value'})
          , baseUrl  = 'https://crm.zoho.com/crm/private/xml/Leads/'
          , columns  = step.input('select_columns', [[]]).first()
          , base     = {
                            authtoken: api_key
                            , scope: 'crmapi'
                            , newFormat: 2
                            , version: 2
                            , selectColumns: [
                                'Leads('
                                ,columns.join(',')
                                ,')'
                               ].join('')
                       }
        ;

        assert(api_key, 'Zoho API key required in ZOHO_API_KEY environment variable');

        q.all(searches.map(function(search) {
             var deferred = q.defer()
               , byId     = !!search.searchColumn.match(/^id$/i) 
               , command  = byId
                              ? 'getRecordById'  
                              : 'searchRecords' 
               , data     = _.extend({}, base)
             ;

             if(byId) {
                 data.id = search.searchValue;
             } else {
                 data.criteria = ['(',search.searchColumn,':',search.searchValue,')'].join('');
             }

             agent.get(baseUrl+command)
               .query(data)
               .end(function(err, res) {
                   return !err && res.statusCode < 400
                     ? deferred.resolve(self.parseResponse(res.text))
                     : deferred.reject(err || { code: res.statusCode, body: res.text });
               });

             return deferred.promise;
           }))
           .then(function(combine) {
            return _.reduce(combine, function(a, b) {
                return a.concat(b);
            });
           })
           .then(this.complete.bind(this))
           .catch(this.fail.bind(this))
        ;

//        this.process(column, val, api_key);
    }

    /**
     *  Parse the response into a sane json object
     *
     *  @param {Object} body - the body xml
     *
     *  @return {Object} JSON representation of the result
     */
    , parseResponse: function(body) {
        var deferred = q.defer();
        xml2js.Parser({explicitArray:false})
          .parseString(body, deferred.makeNodeResolver());
        
        return deferred.promise
                  .then(function(data) {
                      var leads = _.get(data, 'response.result.Leads.row');

                      if(!leads) return null;

                      //normalize
                      if(!_.isArray(leads)) leads = [leads];

                      //map each xml node to an array of JSON objects
                      //that represent the result set
                      return _.map(leads, function(lead) {
                          var item = lead.FL;
                          if(!_.isArray(item)) item = [ item ];

                          return {
                              lead: _.reduce(item
                                    , function(final, i) {
                                        var key = _.get(i, '$.val');
                                        final[ key.match(/leadid/i) ? 'id' : key ] = i._;
                                        return final;
                                    }, {})
                          };
                      });
                  });
    }
};

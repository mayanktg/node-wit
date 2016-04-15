'use strict';

// Quickstart example
// See https://wit.ai/l5t/Quickstart

const Wit = require('../').Wit;
var request = require('request');
var searchText = '';

const token = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/weather.js <wit-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  say: (sessionId, msg, cb) => {
    console.log(msg);
    cb();
  },
  merge: (context, entities, cb) => {
    // Retrieve the location entity and store it into a context field
    const loc = firstEntityValue(entities, 'location');
    if (loc) {
      context.loc = loc;
    }

    const search = firstEntityValue(entities, 'search_query');
    if (search) {
      context.search = search;
    }

    const localSearch = firstEntityValue(entities, 'local_search_query');
    if (localSearch) {
      context.search = localSearch;
    }

    cb(context);
  },
  error: (sessionId, msg) => {
    console.log('Oops, I don\'t know what to do.');
  },
  saveSearchText: (context, cb) => {
    console.log(context);
    if (context.search) {
      searchText = context.search;
      console.log(searchText);
      context.result = true;
    }
    cb(context);
  },
  getSearchedService: (context, cb) => {
    console.log(context);
    var city = 'city_delhi_v2';
    if (context.loc) {
      if (context.loc.indexOf('mumbai') >= 0) {
        city = 'city_mumbai_v2';
      }

      if (context.loc.indexOf('bangalore') >= 0) {
        city = 'city_bangalore_v2';
      }

      if (context.loc.indexOf('hyderabad') >= 0) {
        city = 'city_hyderabad_v2';
      }

      if (context.loc.indexOf('chennai') >= 0) {
        city = 'city_chennai_v2';
      }

      if (context.loc.indexOf('pune') >= 0) {
        city = 'city_pune_v2';
      }

      if (context.loc.indexOf('ahmedabad') >= 0) {
        city = 'city_ahmedabad_v2';
      }

      if (context.loc.indexOf('delhi') ||
        context.loc.indexOf('gurgaon') ||
        context.loc.indexOf('faridabad') ||
        context.loc.indexOf('noida') >= 0) {
        city = 'city_delhi_v2';
      }

    }

    if (context.search) {
      var api = 'https://www.urbanclap.com/api/v1/customercategories/search/category/' + city + '/' + context.search;
      request(api, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body).success.data;
          const length = data.length;
          context.result = '';
          for (var i = 0; i < length; i++) {
            context.result += 'Get ' + data[i].display_name + ' on Urbanclap. Click here: https://www.urbanclap.com/request/' + data[i].key_name + '\n\n';
          }
          cb(context);
        }
      });
    }
    else {
      context.result = 'Sorry no pros found near your area';
      cb(context);
    }
    
  },
};

const client = new Wit(token, actions);
client.interactive();

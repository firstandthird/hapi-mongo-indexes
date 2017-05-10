/* globals describe, before, after, it */
'use strict';
const chai = require('chai');
const assert = chai.assert;
const Hapi = require('hapi');

const launchServer = (server, port, mongoOpts, pluginOpts, done) => {
  server.connection({ port });
  server.register([
    {
      register: require('hapi-mongodb'),
      options: mongoOpts
    },
    {
      register: require('../'),
      options: pluginOpts
    }
  ], (err) => {
    if (err) {
      console.log(err);
    }
    assert(err === undefined);
    server.start((startErr) => {
      if (startErr) {
        return done(startErr);
      }
      done();
    });
  });
};

let server;
const port = 8083;
const mongoOpts = {
  url: 'mongodb://localhost:27017',
  decorate: undefined
};
const pluginOpts = {
  collections: {
    testcollection: [{ keys: { name: 1 } }, { keys: { name: -1 } }],
    timedCollection: [{
      keys: {
        createdOn: 1
      },
      options: { expireAfterSeconds: 10 }
    }]
  }
};

describe('hapi-mongo-indexes', () => {
  before(done => {
    server = new Hapi.Server();
    launchServer(server, port, mongoOpts, pluginOpts, done);
  });

  after(done => {
    server.stop(done);
  });

  it('should create index', done => {
    const db = server.plugins['hapi-mongodb'].db;
    const collection = db.collection('testcollection');

    collection.insert({
      name: 'testname',
      test: true
    }, err => {
      collection.indexInformation((err, doc) => {
        const indexes = Object.keys(doc);
        assert(indexes.includes('name_1'), 'Index created');
        assert(indexes.includes('name_-1'), 'Index created');
        done();
      })
    });
  });
});

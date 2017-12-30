'use strict';
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const code = require('code');

const Hapi = require('hapi');

lab.experiment('hapi-mongo-indexes', () => {
  let server;
  
  const mongoOpts = {
    url: 'mongodb://localhost:27017/sampledb',
    decorate: true
  };

  const pluginOpts = {
    collections: {
      testcollection: [{ keys: { name: 1 } }, { keys: { name: -1 } }],
      timedCollection: [{
        keys: {
          createdOn: 1
        },
        options: { expireAfterSeconds: 5 }
      }]
    }
  };

  lab.before(async() => {
    server = new Hapi.Server({ port: 8080 });
    await server.register({
      plugin: require('hapi-mongodb'),
      options: mongoOpts
    });

    await server.register({
      plugin: require('../'),
      options: pluginOpts
    });
  });

  lab.after(async() => {
    await server.stop(); 
  });

  lab.test('it should create an index', async() => {
    const db = server.mongo.db;
    const collection = db.collection('testcollection');
    await collection.insert({
      name: 'testname',
      test: true
    });
    const doc = await collection.indexInformation();
    const indexes = Object.keys(doc);
    code.expect(indexes).to.include('name_-1');
    code.expect(indexes).to.include('name_1');
  });

  lab.test('it should create index with properties', async() => {
    const db = server.mongo.db;
    const collection = db.collection('timedCollection');
    await collection.insert({
      name: 'testname',
      test: true,
      createdOn: new Date(new Date().getTime() - 100000) // set createdOn in the past so its collected
    });

    const doc = await collection.indexInformation();
    const indexes = Object.keys(doc);
    code.expect(indexes).to.include('createdOn_1');

    const docs = await collection.find({});
    code.expect(docs).to.not.be.null();
  });
});

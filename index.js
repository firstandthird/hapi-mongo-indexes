'use strict';

exports.plugin = {
  async register(server, opts) {
    if (!opts.collections) {
      return;
    }

    let db;

    if (server.mongo && typeof server.mongo.db === 'object') {
      db = server.mongo.db;
    } else {
      db = server.plugins['hapi-mongodb'].db;
    }

    Object.keys(opts.collections).forEach(index => {
      const collectionConfig = opts.collections[index];
      const collection = db.collection(index);
      collectionConfig.forEach(indexConfig => {
        collection.createIndex(indexConfig.keys, indexConfig.options || { background: true }, err => {
          server.log(['hapi-mongo-indexes'], err);
        });
      });
    });
  },
  pkg: require('./package.json')
};

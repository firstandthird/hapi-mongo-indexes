'use strict';

exports.register = (server, opts, next) => {
  if (!opts.collections) {
    return next();
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
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};

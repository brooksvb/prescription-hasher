var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'perscription-hasher'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/perscription-hasher-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'perscription-hasher'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/perscription-hasher-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'perscription-hasher'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/perscription-hasher-production'
  }
};

module.exports = config[env];

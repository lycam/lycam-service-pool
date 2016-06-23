var thrift = require('thrift');
var Promise = require('bluebird');
var _ =  require('lodash');
var Pool = function (_options) {

  var options = {
    etcdHosts: 'localhost',
    appName:   'lycam-sample',
    serviceName:  'default',
    apiVersion:  '1.0',
    refreshTick: 300,
  };

  this.options = _.extend(options, _options);
  this.service = options.service;

  this.serviceRegistry = new require('lycam-service-registry')(this.options);

  return this;
};

Pool.prototype.createClient = function (service, callback) {
    var self = this;
    var options = this.options;
    return new Promise(function (resolve, reject) {
      self.serviceRegistry.lookupEndpoint(options.appName, options.serviceName, options.apiVersion)
      .then(function (endpoint) {
          if (!endpoint) {
            return reject({ error: 'invalid_endpoint' });
          }

          // console.log(endpoint);

          var transport = thrift.TBufferedTransport();
          var protocol = thrift.TBinaryProtocol();

          var connection = thrift.createConnection(endpoint.host, endpoint.port, {
            transport: transport,
            protocol: protocol,
          });

          connection.on('error', function (err) {
            console.error('connection', err);
            // assert(false, err);
          });

          // Create a Calculator client with the connection
          var client = thrift.createClient(service, connection);
          client.connection = connection;
          return resolve(client);

        })
        .catch(function (err) {
          return reject(err);
        });

    });
  };

Pool.prototype.releaseClient = function (client) {
    var self = this;
    var options = this.options;
    return new Promise(function (resolve, reject) {
      if (client.connection) {
        console.error('releaseClient');
        client.connection.end();
      }
      resolve();

    });
  };

module.exports = Pool;



var _ = require('lodash');
var thrift = require('thrift');

var EchoService = require('./gen-nodejs/EchoService');

var pjson = require('../package.json');

var options = {
  etcdHosts: process.env.ETCD_HOSTS ||  'localhost',
  appName: pjson.name,
  apiVersion: pjson.apiVersion || '1.0',
  ttl: 60,
  heartbeatTick: 15,
  refreshTick: 15,
};

var SrviceRegistry = new require('lycam-service-registry')(options);

console.log(options);

// lycamplus.stream.get();
var result = {};
var port = process.env.PORT || 8888;
var host = process.env.HOST || 'localhost';

var server = thrift.createServer(EchoService, {
    echo: function (msg, result) {
      console.log('msg:', msg);
      var timeout = 100;//Math.random() * 1000 || 0;
      setTimeout(function () {
        return result(null, msg);
      }, timeout);
    },
  });

server.listen(port);

SrviceRegistry.registerService({ host: host, port: port, weight: 50 })
.then(function (data) {
  console.log('registerService success:', data);
  result.success = 'ok';

  return SrviceRegistry.lookupEndpoint(options.appName, 'default', options.apiVersion);

})
.then(function (node) {
  process.on('SIGINT', function () {
    SrviceRegistry.unregisterService({ host: host, port: port })
    .then(function (data) {
      console.log('Got a SIGINT. unregisterService');
      process.exit(0);
    })
    .catch(function (err) {
      console.error(err);
      process.exit(0);
    });

  });

  SrviceRegistry.fetchEndpoints(options.appName, 'default', options.apiVersion);
  console.log('getOneEndpoint:', node);
})
.catch(function (err) {
  console.error(err);
});

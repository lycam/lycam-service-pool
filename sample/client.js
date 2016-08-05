var Pool = require('..');
var EchoService = require('./gen-nodejs/EchoService');
var pjson = require('../package.json');

var pool = new Pool({
  etcdHosts: process.env.ETCD_HOSTS ||  'localhost',
  appName: pjson.name,
  enableEndpointUpdate:true
});
// console.log(pool);

var SrviceRegistry = pool.serviceRegistry;

SrviceRegistry.on('endpoint_add',function(err,data){
  console.log("endpoint_add",err,data);
});
SrviceRegistry.on('endpoint_update',function(err,data){
  console.log("endpoint_update",err,data);
});
SrviceRegistry.on('endpoint_remove',function(err,data){
  console.log("endpoint_remove",err,data);
});
 
pool.createClient(EchoService)
.then(function (client) {
  // console.log(client);
  if (client) {
    client.echo('hhaha', function (err, data) {
      console.log(err, data);
      pool.releaseClient(client);
    });
  }
})
.catch(function (err) {
  console.error(err);
});


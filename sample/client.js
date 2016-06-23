var Pool = require('..');
var EchoService = require('./gen-nodejs/EchoService');
var pjson = require('../package.json');

var pool = new Pool({
  etcdHosts: process.env.ETCD_HOSTS ||  'localhost',
  appName: pjson.name,
});
// console.log(pool);
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


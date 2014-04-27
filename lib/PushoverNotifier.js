'use strict';

var stream = require('stream');
var util = require('util');
var unirest = require('unirest');

util.inherits(Device, stream);

module.exports = Device;

function Device(app, token, config) {

  this.G = ('pushover'+token+config.user).replace(/[^a-z0-9]/ig, '');
  this.V = 0;

  this.D = 240; /* Text display */

  this.name = (config.device? config.device : 'All Devices') + ' - Pushover Notification';

  this.app = app;

  this.token = token;
  this.user = config.user;
  this.device = config.device;
}

Device.prototype.write = function(data) {

  var config;
  try {
    if (typeof data == 'object') {
      config = data;
    } else {
      config = JSON.parse(data);
    }
  } catch(e) {
    config = {message:data};
  }

  config.token = this.token;
  config.user = this.user;
  config.url_title = 'Open NinjaBlocks Dashboard';
  config.url = this.app.opts.apiHost.match(/wakai/i) ? 'https://wakai.ninja.is/home': 'https://a.ninja.is/home';

  if (this.device) config.device = this.device;

  unirest.post('https://api.pushover.net/1/messages.json')
    .headers({ 'Accept': 'application/json' })
    .send(config)
    .end(function (response) {
      console.log(this.app.log.info('Sent notification to', this.name, config.message, response));
      this.emit('data', config.message);
    }.bind(this));
};

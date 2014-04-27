'use strict';

var stream = require('stream');
var util = require('util');
var unirest = require('unirest');

util.inherits(Device, stream);

module.exports = Device;

function Device(app, config) {

  this.G = ('pushbullet'+config.token).replace(/[^a-z0-9]/ig, '');
  this.V = 0;

  this.D = 240; /* Text display */

  this.name = 'Pushbullet Notification - ' + config.token;

  this.app = app;

  this.token = config.token;
}

Device.prototype.write = function(data) {

  var config = {
    title: 'Ninja Blocks',
    body: data,
    type: 'note',
    device_iden: this.token
  };

  unirest.post('https://api.pushbullet.com/api/pushes')
    .auth({
      user: this.token
    })
    .headers({ 'Accept': 'application/json' })
    .send(config)
    .end(function (response) {
      console.log(this.app.log.info('Sent notification to', this.name, config.message, response));
      this.emit('data', config.message);
    }.bind(this));
};

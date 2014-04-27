'use strict';

var util = require('util');
var stream = require('stream');

var PushoverNotifier = require('./lib/PushoverNotifier');
var PushbulletNotifier = require('./lib/PushbulletNotifier');

util.inherits(Driver,stream);

function Driver(opts, app) {
  this.app = app;
  this.opts = opts;

  app.once('client::up', this.init.bind(this));

  this.opts.pushover = this.opts.pushover || [];
  this.opts.pushbullet = this.opts.pushbullet || [];

  this.devices = {};
}

Driver.prototype.init = function() {

  this.opts.pushover.forEach(function(cfg) {
    var device = new PushoverNotifier(this.app, this.opts.pushoverToken, cfg);
    if (!this.devices[device.G]) {
      this.emit('register', device);
      device.emit('data', '');
      this.devices[device.G] = device;
    }

  }.bind(this));

  this.opts.pushbullet.forEach(function(cfg) {
    var device = new PushbulletNotifier(this.app, cfg);
    if (!this.devices[device.G]) {
      this.emit('register', device);
      device.emit('data', '');
      this.devices[device.G] = device;
    }
  }.bind(this));

};


Driver.prototype.config = function(rpc, cb) {

  if (!rpc) {
    return cb(null, {
      'contents':[
        { 'type': 'submit', 'name': 'Add Pushover Notifier', 'rpc_method': 'pushover' },
        { 'type': 'submit', 'name': 'Add Pushbullet Notifier', 'rpc_method': 'pushbullet' }
      ]
    });
  }

  if (rpc.method == 'pushover') {
    return cb(null, {
      "contents":[
        { "type": "paragraph", "text":"Please enter your Pushover details. You can register at http://pushover.net"},
        { "type": "input_field_text", "field_name": "user", "value": "", "label": "User Key", "required": true},
        { "type": "input_field_text", "field_name": "device", "value": "", "label": "Device (optional)", "required": false},
        { "type": "submit", "name": "Save", "rpc_method": "pushoverSave" }
      ]
    });
  } else if (rpc.method == 'pushoverSave') {
    this.opts.pushover.push(rpc.params);
    this.save(this.opts);
    this.init();
    return cb(null);
  } else if (rpc.method == 'pushbullet') {
    return cb(null, {
      "contents":[
        { "type": "paragraph", "text":"Please enter your Pushbullet details. You can register at https://www.pushbullet.com"},
        { "type": "input_field_text", "field_name": "token", "value": "", "label": "API Key", "required": true},
        { "type": "submit", "name": "Save", "rpc_method": "pushbulletSave" }
      ]
    });
  } else if (rpc.method == 'pushbulletSave') {
    this.opts.pushbullet.push(rpc.params);
    this.save(this.opts);
    this.init();
    return cb(null);
  } else {
    return cb(true);
  }

};

module.exports = Driver;

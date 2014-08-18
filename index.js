'use strict';

var util = require('util');
var stream = require('stream');

var services = require('./lib/services');

util.inherits(Driver,stream);

function Driver(opts, app) {
  this.log = app.log;
  this.app = app;
  this.opts = opts;

  app.once('client::up', this.init.bind(this));

  this.opts.services = this.opts.services || {};
  this.devices = {};
}

Driver.prototype.init = function() {
  Object.keys(this.opts.services).forEach(this.initService.bind(this));
};

Driver.prototype.initService = function(id) {

  var config = this.opts.services[id];

  if (this.devices[config.id]) return;

  this.log.info('Initialising service', id, config);

  var driver = this;

  var service = services[config.service];

  var device = new Device(config.service + config.id, config.name);
  device.log = this.app.log;
  device.write = function(data) {
    var self = this;

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch(e) {
        data = {message: data};
      }
    }

    this.log.debug('Notifying', config, 'with', data);

    service.send(data, config, driver.app, function(err) {
      if (err) {
        self.log.error("There was an error sending the message '%s' via notification service [%s]: %s", data.message, id, err);
        driver.emit('announcement',{
          "contents": [
            { "type": "heading",      "text": "Failed to send notification" },
            { "type": "paragraph",    "text": "There was an error sending the message '" + data.message + "' via notification service id : " + id}
          ]
        });
      } else {
        this.emit('data', data.message);
      }
    }.bind(this))
  };

  this.devices[id] = device;
  this.emit('register', device);
  device.emit('data', '');
};

Driver.prototype.config = function(rpc, cb) {

  if (!rpc) {

    var options = Object.keys(services).map(function(id) {
      return { 'type': 'submit', 'name': 'Add ' + services[id].name, 'rpc_method': id};
    });

    options.unshift({ "type": "heading", "text": "Add A Service" })

    options.push({ "type": "heading", "text": "Remove A Service" })

    if (Object.keys(this.opts.services).length) {
      options.push({ 'type': 'submit', 'name': 'Open Current Services', 'rpc_method': 'delete'});
    }

    return cb(null, {
      'contents': options
    });
  }

  if (rpc.method === 'save') {
    this.log.info('Saving new notification service', rpc.params);
    
    var config = rpc.params;
    var service = services[config.service];
    config.id = service.getId(config);
    this.opts.services[config.id] = config;

    this.save(this.opts);
    this.initService(config.id);

    this.emit('announcement',{
      "contents": [
        { "type": "heading",      "text": "Notification Service Saved" },
        { "type": "paragraph",    "text": "'" + config.name + "' has been saved."}
      ]
    });
    cb(null);
  } else if (rpc.method === 'delete') { 

    var options = Object.keys(this.opts.services).map(function(id) {
      return { 'type': 'submit', 'name': 'Delete ' + this.opts.services[id].name, 'rpc_method': 'delete-' + id};
    }.bind(this));

    options.unshift({ "type": "heading", "text": "Delete Notifications" });

    return cb(null, {
      'contents': options
    });
  } else if (rpc.method.indexOf('delete') === 0) {
    var id = rpc.method.split('-')[1];
    this.log.info('Deleting notification id:', id);
    delete(this.opts.services[id]);
    this.save(this.opts);
    this.config({method:'delete'}, cb);
  } else {

    var service = services[rpc.method];
    if (!service) {
      return cb('Service ' + rpc.method + ' not found.');
    }

    cb(null, {"contents": service.config});
  }

};

function Device(id, name) {
  this.G = ('notify'+id).replace(/[^a-z0-9]/ig, '');
  this.V = 0;

  this.D = 240; /* Text display */

  this.name = name;
}
util.inherits(Device, stream);

module.exports = Driver;

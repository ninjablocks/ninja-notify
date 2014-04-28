'use strict';

var unirest = require('unirest');
var _ = require('underscore');

var services = {

  pushover: {
    name: 'Pushover - Android, iOS, and Desktop',
    config:[
      { 'type': 'paragraph', 'text':'Please enter your Pushover details. You can register at http://pushover.net'},
      { 'type': 'input_field_text', 'field_name': 'user', 'value': '', 'placeholder':'', 'label': 'User Key', 'required': true},
      { 'type': 'input_field_text', 'field_name': 'device', 'value': '', 'placeholder':'', 'label': 'Device (optional)', 'required': false},
    ],
    getId: function(config) {
        return config.user + config.device;
    },
    send: function(data, config, app, cb) {

      var params = data;

      params.token = 'aYWVuW753MBoe5U91XskZWjP9Eq6Zi';
      params.user = config.user;
      params.url_title = 'Open NinjaBlocks Dashboard';
      params.url = app.opts.apiHost.match(/wakai/i) ? 'https://wakai.ninja.is/home': 'https://a.ninja.is/home';

      if (config.device) params.device = config.device;

      unirest.post('https://api.pushover.net/1/messages.json')
        .headers({ 'Accept': 'application/json' })
        .send(params)
        .end(function (response) {
          // TODO: Check error message
          cb(null);
        });
    }

  },

  pushbullet: {
    name: 'Pushbullet - Android and Desktop',
    config:[
      { 'type': 'paragraph', 'text':'Please enter your Pushbullet details. You can register at https://www.pushbullet.com'},
      { 'type': 'input_field_text', 'field_name': 'apiKey', 'value': '', 'placeholder':'', 'label': 'API Key', 'required': true},
      { 'type': 'input_field_text', 'field_name': 'deviceIdentifier', 'value': '', 'placeholder':'', 'label': 'Device Identifier', 'required': true}
    ],
    getId: function(config) {
        return config.apiKey + config.deviceIdentifier
    },
    send: function(data, config, app, cb) {

      var params = {
        title: 'Ninja Blocks',
        body: data.message,
        type: 'note',
        device_iden: config.deviceIdentifier
      };

      unirest.post('https://api.pushbullet.com/api/pushes')
        .auth({
          user: config.apiKey
        })
        .headers({ 'Accept': 'application/json' })
        .send(params)
        .end(function (response) {
          // TODO: Check error message
          cb(null);
        });

    }

  },

  nexmo: {
    name: 'Nexmo - SMS',
    config:[
      { 'type': 'paragraph', 'text':'Please enter your Nexmo details. You can register at https://www.nexmo.com'},
      { 'type': 'input_field_text', 'field_name': 'apiKey', 'value': '', 'placeholder':'', 'label': 'API Key', 'required': true},
      { 'type': 'input_field_text', 'field_name': 'apiSecret', 'value': '', 'placeholder':'', 'label': 'API Secret', 'required': true},
      { 'type': 'input_field_text', 'field_name': 'from', 'value': '', 'placeholder':'NinjaBlocks', 'label': 'From', 'required': true},
      { 'type': 'input_field_text', 'field_name': 'to', 'value': '', 'placeholder':'123456789', 'label': 'To', 'required': true},
      { 'type': 'input_field_select', 'field_name': 'flash', 'label': 'SMS Type', 'options': [{ 'name': 'Normal', 'value': 'false', 'selected': true}, { 'name': 'Flash', 'value': 'true', 'selected': false}], 'required': false }
    ],
    getId: function(config) {
        return config.apiKey + config.apiSecret + config.from + config.to + config.flash;
    },
    send: function(data, config, app, cb) {

      var params = {
        from: config.from,
        to: config.to.replace(/[\s+]/g, ''),
        text: data.message,
        api_key: config.apiKey,
        api_secret: config.apiSecret
      };

      if (config.flash === 'true') {
        params['message-class'] = 0;
      }

      console.log(params);

      unirest.post('https://rest.nexmo.com/sms/json')
        .auth({
          user: config.apiKey
        })
        .headers({ 'Accept': 'application/json' })
        .send(params)
        .end(function (response) {
          // TODO: Check error message
          cb(null);
        });

    }

  }
};

for (var id in services) {
    services[id].config.unshift({ 'type': 'input_field_text', 'field_name': 'name', 'value': '', 'placeholder':'My Notification', 'label': 'Display Name', 'required': true});
    services[id].config.push({ 'type': 'input_field_hidden', 'field_name': 'service', 'value': id});
    services[id].config.push({ 'type': 'submit', 'name': 'Add Service', 'rpc_method': 'save' });
}

module.exports = services;
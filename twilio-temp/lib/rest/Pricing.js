'use strict';

var _ = require('lodash');
var Domain = require('../base/Domain');
var V1 = require('./pricing/V1');


/* jshint ignore:start */
/**
 * Initialize pricing domain
 *
 * @constructor Twilio.Pricing
 *
 * @property {Twilio.Pricing.V1} v1 - v1 version
 * @property {Twilio.Pricing.V1.MessagingList} messaging - messaging resource
 * @property {Twilio.Pricing.V1.PhoneNumberList} phoneNumbers -
 *          phoneNumbers resource
 * @property {Twilio.Pricing.V1.VoiceList} voice - voice resource
 *
 * @param {Twilio} twilio - The twilio client
 */
/* jshint ignore:end */
function Pricing(twilio) {
  Domain.prototype.constructor.call(this, twilio, 'https://pricing.twilio.com');

  // Versions
  this._v1 = undefined;
}

_.extend(Pricing.prototype, Domain.prototype);
Pricing.prototype.constructor = Pricing;

Object.defineProperty(Pricing.prototype,
  'v1', {
  get: function() {
    this._v1 = this._v1 || new V1(this);
    return this._v1;
  },
});

Object.defineProperty(Pricing.prototype,
  'messaging', {
  get: function() {
    return this.v1.messaging;
  },
});

Object.defineProperty(Pricing.prototype,
  'phoneNumbers', {
  get: function() {
    return this.v1.phoneNumbers;
  },
});

Object.defineProperty(Pricing.prototype,
  'voice', {
  get: function() {
    return this.v1.voice;
  },
});

module.exports = Pricing;

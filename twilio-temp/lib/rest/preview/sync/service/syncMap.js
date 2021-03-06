'use strict';

var _ = require('lodash');
var Q = require('q');
var Page = require('../../../../base/Page');
var SyncMapItemList = require('./syncMap/syncMapItem').SyncMapItemList;
var deserialize = require('../../../../base/deserialize');
var values = require('../../../../base/values');

var SyncMapPage;
var SyncMapList;
var SyncMapInstance;
var SyncMapContext;

/* jshint ignore:start */
/**
 * @constructor Twilio.Preview.Sync.ServiceContext.SyncMapPage
 * @augments Page
 * @description Initialize the SyncMapPage
 *
 * @param {Twilio.Preview.Sync} version - Version of the resource
 * @param {object} response - Response from the API
 * @param {string} serviceSid - The service_sid
 *
 * @returns SyncMapPage
 */
/* jshint ignore:end */
function SyncMapPage(version, response, serviceSid) {
  Page.prototype.constructor.call(this, version, response);

  // Path Solution
  this._solution = {
    serviceSid: serviceSid
  };
}

_.extend(SyncMapPage.prototype, Page.prototype);
SyncMapPage.prototype.constructor = SyncMapPage;

/* jshint ignore:start */
/**
 * Build an instance of SyncMapInstance
 *
 * @function getInstance
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapPage
 * @instance
 *
 * @param {object} payload - Payload response from the API
 *
 * @returns SyncMapInstance
 */
/* jshint ignore:end */
SyncMapPage.prototype.getInstance = function getInstance(payload) {
  return new SyncMapInstance(
    this._version,
    payload,
    this._solution.serviceSid
  );
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Preview.Sync.ServiceContext.SyncMapList
 * @description Initialize the SyncMapList
 *
 * @param {Twilio.Preview.Sync} version - Version of the resource
 * @param {string} serviceSid - The service_sid
 */
/* jshint ignore:end */
function SyncMapList(version, serviceSid) {
  /* jshint ignore:start */
  /**
   * @function syncMaps
   * @memberof Twilio.Preview.Sync.ServiceContext
   * @instance
   *
   * @param {string} sid - sid of instance
   *
   * @returns {Twilio.Preview.Sync.ServiceContext.SyncMapContext}
   */
  /* jshint ignore:end */
  function SyncMapListInstance(sid) {
    return SyncMapListInstance.get(sid);
  }

  SyncMapListInstance._version = version;
  // Path Solution
  SyncMapListInstance._solution = {
    serviceSid: serviceSid
  };
  SyncMapListInstance._uri = _.template(
    '/Services/<%= serviceSid %>/Maps' // jshint ignore:line
  )(SyncMapListInstance._solution);
  /* jshint ignore:start */
  /**
   * create a SyncMapInstance
   *
   * @function create
   * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {string} [opts.uniqueName] - The unique_name
   * @param {function} [callback] - Callback to handle processed record
   *
   * @returns {Promise} Resolves to processed SyncMapInstance
   */
  /* jshint ignore:end */
  SyncMapListInstance.create = function create(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};

    var deferred = Q.defer();
    var data = values.of({
      'UniqueName': opts.uniqueName
    });

    var promise = this._version.create({
      uri: this._uri,
      method: 'POST',
      data: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new SyncMapInstance(
        this._version,
        payload,
        this._solution.serviceSid,
        this._solution.sid
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Streams SyncMapInstance records from the API.
   *
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   *
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function each
   * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         each() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize=50] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no pageSize is defined but a limit is defined,
   *         each() will attempt to read the limit with the most efficient
   *         page size, i.e. min(limit, 1000)
   * @param {Function} [opts.callback] -
   *         Function to process each record. If this and a positional
   * callback are passed, this one will be used
   * @param {Function} [opts.done] -
   *          Function to be called upon completion of streaming
   * @param {Function} [callback] - Function to process each record
   */
  /* jshint ignore:end */
  SyncMapListInstance.each = function each(opts, callback) {
    opts = opts || {};
    if (_.isFunction(opts)) {
      opts = { callback: opts };
    } else if (_.isFunction(callback) && !_.isFunction(opts.callback)) {
      opts.callback = callback;
    }

    if (_.isUndefined(opts.callback)) {
      throw new Error('Callback function must be provided');
    }

    var done = false;
    var currentPage = 1;
    var limits = this._version.readLimits({
      limit: opts.limit,
      pageSize: opts.pageSize
    });

    function onComplete(error) {
      done = true;
      if (_.isFunction(opts.done)) {
        opts.done(error);
      }
    }

    function fetchNextPage(fn) {
      var promise = fn();
      if (_.isUndefined(promise)) {
        onComplete();
        return;
      }

      promise.then(function(page) {
        _.each(page.instances, function(instance) {
          if (done) {
            return false;
          }

          opts.callback(instance, onComplete);
        });

        if ((limits.pageLimit && limits.pageLimit <= currentPage)) {
          onComplete();
        } else if (!done) {
          currentPage++;
          fetchNextPage(_.bind(page.nextPage, page));
        }
      });

      promise.catch(onComplete);
    }

    fetchNextPage(_.bind(this.page, this, opts));
  };

  /* jshint ignore:start */
  /**
   * @description Lists SyncMapInstance records from the API as a list.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function list
   * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no page_size is defined but a limit is defined,
   *         list() will attempt to read the limit with the most
   *         efficient page size, i.e. min(limit, 1000)
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  SyncMapListInstance.list = function list(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    var deferred = Q.defer();
    var allResources = [];
    opts.callback = function(resource, done) {
      allResources.push(resource);

      if (!_.isUndefined(opts.limit) && allResources.length === opts.limit) {
        done();
      }
    };

    opts.done = function(error) {
      if (_.isUndefined(error)) {
        deferred.resolve(allResources);
      } else {
        deferred.reject(error);
      }
    };

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    this.each(opts);
    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Retrieve a single page of SyncMapInstance records from the API.
   * Request is executed immediately
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function page
   * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {string} [opts.pageToken] - PageToken provided by the API
   * @param {number} [opts.pageNumber] -
   *          Page Number, this value is simply for client state
   * @param {number} [opts.pageSize] - Number of records to return, defaults to 50
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  SyncMapListInstance.page = function page(opts, callback) {
    opts = opts || {};

    var deferred = Q.defer();
    var data = values.of({
      'PageToken': opts.pageToken,
      'Page': opts.pageNumber,
      'PageSize': opts.pageSize
    });

    var promise = this._version.page({
      uri: this._uri,
      method: 'GET',
      params: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new SyncMapPage(
        this._version,
        payload,
        this._solution.serviceSid,
        this._solution.sid
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Constructs a sync_map
   *
   * @function get
   * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapList
   * @instance
   *
   * @param {string} sid - The sid
   *
   * @returns {Twilio.Preview.Sync.ServiceContext.SyncMapContext}
   */
  /* jshint ignore:end */
  SyncMapListInstance.get = function get(sid) {
    return new SyncMapContext(
      this._version,
      this._solution.serviceSid,
      sid
    );
  };

  return SyncMapListInstance;
}


/* jshint ignore:start */
/**
 * @constructor Twilio.Preview.Sync.ServiceContext.SyncMapInstance
 * @description Initialize the SyncMapContext
 *
 * @property {string} sid - The sid
 * @property {string} uniqueName - The unique_name
 * @property {string} accountSid - The account_sid
 * @property {string} serviceSid - The service_sid
 * @property {string} url - The url
 * @property {string} links - The links
 * @property {string} revision - The revision
 * @property {Date} dateCreated - The date_created
 * @property {Date} dateUpdated - The date_updated
 * @property {string} createdBy - The created_by
 *
 * @param {Twilio.Preview.Sync} version - Version of the resource
 * @param {object} payload - The instance payload
 * @param {sid} serviceSid - The service_sid
 * @param {string} sid - The sid
 */
/* jshint ignore:end */
function SyncMapInstance(version, payload, serviceSid, sid) {
  this._version = version;

  // Marshaled Properties
  this.sid = payload.sid; // jshint ignore:line
  this.uniqueName = payload.unique_name; // jshint ignore:line
  this.accountSid = payload.account_sid; // jshint ignore:line
  this.serviceSid = payload.service_sid; // jshint ignore:line
  this.url = payload.url; // jshint ignore:line
  this.links = payload.links; // jshint ignore:line
  this.revision = payload.revision; // jshint ignore:line
  this.dateCreated = deserialize.iso8601DateTime(payload.date_created); // jshint ignore:line
  this.dateUpdated = deserialize.iso8601DateTime(payload.date_updated); // jshint ignore:line
  this.createdBy = payload.created_by; // jshint ignore:line

  // Context
  this._context = undefined;
  this._solution = {
    serviceSid: serviceSid,
    sid: sid || this.sid,
  };
}

Object.defineProperty(SyncMapInstance.prototype,
  '_proxy', {
  get: function() {
    if (!this._context) {
      this._context = new SyncMapContext(
        this._version,
        this._solution.serviceSid,
        this._solution.sid
      );
    }

    return this._context;
  },
});

/* jshint ignore:start */
/**
 * fetch a SyncMapInstance
 *
 * @function fetch
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed SyncMapInstance
 */
/* jshint ignore:end */
SyncMapInstance.prototype.fetch = function fetch(callback) {
  return this._proxy.fetch(callback);
};

/* jshint ignore:start */
/**
 * remove a SyncMapInstance
 *
 * @function remove
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed SyncMapInstance
 */
/* jshint ignore:end */
SyncMapInstance.prototype.remove = function remove(callback) {
  return this._proxy.remove(callback);
};

/* jshint ignore:start */
/**
 * Access the syncMapItems
 *
 * @function syncMapItems
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapInstance
 * @instance
 *
 * @returns {Twilio.Preview.Sync.ServiceContext.SyncMapContext.SyncMapItemList}
 */
/* jshint ignore:end */
SyncMapInstance.prototype.syncMapItems = function syncMapItems() {
  return this._proxy.syncMapItems;
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Preview.Sync.ServiceContext.SyncMapContext
 * @description Initialize the SyncMapContext
 *
 * @property {Twilio.Preview.Sync.ServiceContext.SyncMapContext.SyncMapItemList} syncMapItems -
 *          syncMapItems resource
 *
 * @param {Twilio.Preview.Sync} version - Version of the resource
 * @param {sid} serviceSid - The service_sid
 * @param {string} sid - The sid
 */
/* jshint ignore:end */
function SyncMapContext(version, serviceSid, sid) {
  this._version = version;

  // Path Solution
  this._solution = {
    serviceSid: serviceSid,
    sid: sid,
  };
  this._uri = _.template(
    '/Services/<%= serviceSid %>/Maps/<%= sid %>' // jshint ignore:line
  )(this._solution);

  // Dependents
  this._syncMapItems = undefined;
}

/* jshint ignore:start */
/**
 * fetch a SyncMapInstance
 *
 * @function fetch
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed SyncMapInstance
 */
/* jshint ignore:end */
SyncMapContext.prototype.fetch = function fetch(callback) {
  var deferred = Q.defer();
  var promise = this._version.fetch({
    uri: this._uri,
    method: 'GET'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new SyncMapInstance(
      this._version,
      payload,
      this._solution.serviceSid,
      this._solution.sid
    ));
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

/* jshint ignore:start */
/**
 * remove a SyncMapInstance
 *
 * @function remove
 * @memberof Twilio.Preview.Sync.ServiceContext.SyncMapContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed SyncMapInstance
 */
/* jshint ignore:end */
SyncMapContext.prototype.remove = function remove(callback) {
  var deferred = Q.defer();
  var promise = this._version.remove({
    uri: this._uri,
    method: 'DELETE'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(payload);
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

Object.defineProperty(SyncMapContext.prototype,
  'syncMapItems', {
  get: function() {
    if (!this._syncMapItems) {
      this._syncMapItems = new SyncMapItemList(
        this._version,
        this._solution.serviceSid,
        this._solution.sid
      );
    }
    return this._syncMapItems;
  },
});

module.exports = {
  SyncMapPage: SyncMapPage,
  SyncMapList: SyncMapList,
  SyncMapInstance: SyncMapInstance,
  SyncMapContext: SyncMapContext
};

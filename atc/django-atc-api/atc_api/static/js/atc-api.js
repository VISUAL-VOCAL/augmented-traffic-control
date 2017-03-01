/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// source: https://www.sitepoint.com/get-url-parameters-with-javascript/
function getAllUrlParams(url)
{
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString)
    {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++)
        {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // if parameter name already exists
            if (obj[paramName])
            {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string')
                {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined')
                {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                    // if array index number specified...
                else
                {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
                // if param name doesn't exist yet, set it
            else
            {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}

function concatMachine(urn, machine) 
{
    if (typeof(machine) === 'undefined')
    {
        return urn;
    }
    else
    {
        return urn.concat('/').concat(machine);
    }
}


function AtcRestClient (endpoint) {
    this.endpoint = endpoint || '/api/v1/';
    function _add_ending_slash(string) {
        if (string[string.length -1] != '/') {
            string += '/';
        }
        return string;
    }

    this.endpoint = _add_ending_slash(this.endpoint);

    this.api_call = function (method, urn, callback, data) {
        urn = _add_ending_slash(urn);
        $.ajax({
            url: this.endpoint + urn,
            dataType: 'json',
            type: method,
            data: data && JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            complete: function (xhr, status) {
                var rc = {
                    status: xhr.status,
                    json: xhr.responseJSON,
                };
                /*
                console.log('API status: ' + status);
                if (status == 'success' || status == 'nocontent' || xhr.status == 404) {
                    if (status == 'success') {
                        rc.settings = new AtcSettings().mergeWithDefaultSettings({
                            up: xhr.responseJSON.up,
                            down: xhr.responseJSON.down,
                        });
                    } else {
                        rc.settings = new AtcSettings().getDefaultSettings();
                    }
                } else {
                    rc.detail = xhr.responseJSON.detail;
                }
                console.log(rc);
                */
                if (callback !== undefined) {
                    callback(rc);
                }
            }
        });
    };
}


AtcRestClient.prototype.shape = function (callback, data) {
    var params = getAllUrlParams();
    this.api_call('POST', concatMachine('shape', params.machine), callback, data);
};

AtcRestClient.prototype.unshape = function (callback, data) {
    var params = getAllUrlParams();
    this.api_call('DELETE', concatMachine('shape', params.machine), callback);
};

AtcRestClient.prototype.getCurrentShaping = function (callback) {
    var params = getAllUrlParams();
    this.api_call('GET', concatMachine('shape', params.machine), callback);
};

AtcRestClient.prototype.getToken = function (callback) {
    this.api_call('GET', 'token', callback);
};

AtcRestClient.prototype.getAuthInfo = function (callback) {
    this.api_call('GET', 'auth', callback);
};

AtcRestClient.prototype.updateAuthInfo = function (address, data, callback) {
    this.api_call('POST', 'auth/'.concat(address), callback, data);
};

function AtcSettings () {
    this.defaults = {
        'up': {
            'rate': null,
            'delay': {
                'delay': 0,
                'jitter': 0,
                'correlation': 0
            },
            'loss': {
                'percentage': 0,
                'correlation': 0
            },
            'reorder': {
                'percentage': 0,
                'correlation': 0,
                'gap': 0
            },
            'corruption': {
                'percentage': 0,
                'correlation': 0
            },
            'iptables_options': Array(),
        },
        'down': {
            'rate': null,
            'delay': {
                'delay': 0,
                'jitter': 0,
                'correlation': 0
            },
            'loss': {
                'percentage': 0,
                'correlation': 0
            },
            'reorder': {
                'percentage': 0,
                'correlation': 0,
                'gap': 0
            },
            'corruption': {
                'percentage': 0,
                'correlation': 0
            },
            'iptables_options': Array(),
        }
    };

    this.getDefaultSettings = function () {
        return $.extend(true, {}, this.defaults);
    };

    this.mergeWithDefaultSettings = function (data) {
        return $.extend(true, {}, this.defaults, data);
    };
}

"use strict";

/**
 * @class
 * @name Options
 * @classdesc The options files can be a JS or JSON file. In this example it is only a JS so we can add document and comments to the fields. 
 *  Only the fields that do not have default values are required.
 * 
 * @property {string} hostname - The dynamic DNS hostname
 * @property {string} username - The dynamic DNS username.
 * @property {string} password - The dynamic DNS password.
 * @property {string} [publicIpUrl=https://domains.google.com/checkip] - he HTTP/HTTPS URL used to check the current public IP of the device. 
 *  The default value uses Google's provided URl but users can override this URL.
 * @property {string} [updateIpUrl=https://domains.google.com/nic/update?hostname=%HOSTNAME%&myip=%IPADDRESS%] - The HTTPS URL of the Google DNS API update. Typically this should not change unless Google decides to change the URL or format.
 * @property {string} [userAgent=Nodejs google-ddns] - The HTTP header User-Agent to send when updating the IP address. This is required by the Google Dynamic DNS API to identify the dynamic DNS client.
 * @property {boolean} [failOnUnresolvedHostName = false] - Indicates whether to fail or keep going during synchronizing if the current host name was not resolved. 
 *  This typically happens if the domain was created and has not yet been applied or propagated. See TTL (Time-to-Live) for more information.
 *  Every though this can fail, the update can sill be successful.
 * @property {number} [maxUnresolvedHostNameFail = 3] - This works in conjunction with failOnUnresolvedHostName to make sure we don't keep failing over and over with no error back reporting.
 * @property {boolean} [useHostIPAddressCache = true] - Indicates whether to cache and use the last resolved host IP address or resolve every-time. Generally speaking we
 *  don't need to resolve the host every-time since it will not change unless we change it. This saves having to do a DNS request every interval. Use the hostIPAddressCacheExpires
 *  to do a check every once in a while.
 * @property {number} [hostIPAddressCacheExpires = 3600] - If useHostIPAddressCache is set to true, this timer is used to force a host IP address checked/resolution every once
 *  in a while rather than never. The time is in seconds and defaults to every hour.
 * @property {boolean} [debug = false] - Set the debug mode on or off. The debug mode will write debug and status information to the console.
 * 
 * @property {boolean} [runService = true] - Defines whether to run the application as a service as a one time call to update the google domain IP address.
 * @property {number} [checkInterval = 60] - Used by the service. The amount of time in seconds to wait before checking if the public IP has changed.
 * @property {number} [maxConsecutiveErrors = 10] - Used by the service. The maximum number of consecutive errors before stopping the check timer loop.
 * @property {boolean} [exitOnMaxErrors = true] - Used by the service. Defines whether to exit process when the max consecutive errors has been reached.
 * @property {string | boolean} [logPath = './logs.log'] - Used by the service. Defines the log output path. Set to false to disable output logs.
 * @property {boolean} [logToConsole = true] - Used by the service. Defines whether to log output to the console or not.
 * 
 * @memberof DEDA-Google-DDNS
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
module.exports =
{
    "hostname": "my.domain.com",
    "username": "myUserName",
    "password": "myPassword",

    "publicIpUrl": "https://domains.google.com/checkip",
    "updateIpUrl": "https://domains.google.com/nic/update?hostname=%HOSTNAME%&myip=%IPADDRESS%",
    "userAgent": "Nodejs google-ddns",

    "failOnUnresolvedHostName": false,
    "maxUnresolvedHostNameFail": 3,

    "useHostIPAddressCache": true,
    "hostIPAddressCacheExpires": 2*60,

    "runService": true,

    "checkInterval": 30,
    "maxConsecutiveErrors": 3,
    "exitOnMaxErrors": true,
    "logPath": "./logs.log",
    "logToConsole": true,

    "debug": true
};
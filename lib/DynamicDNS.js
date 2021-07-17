{
"use strict";

/**
 * The namespace the contains all the Google Domain APIs and classes.
 * @namespace DEDA-Google-DDNS
 */

// Define the required modules for this class.
const url = require('url');
const dns = require('dns');
const http = require('http');
const https = require('https');

/**
 * This class provides an interface to get the currently set public and dns IP as well as update the Google DNS IP address.
 * Currently only IPv4 is supported but this the class is setup to be expended to support IPv6.
 *
 * @class
 * @memberof DEDA-Google-DDNS
 * @author Charbel Choueiri <charbel.choueiri@gmail.com>
 */
class DynamicDNS
{
    /**
     * Creates a new class with the given options.
     * @param {object} options See [getDefaultOptions()]{@link DEDA-Google-DDNS.DynamicDNS.getDefaultOptions} for more details.
     */
    constructor(options)
    {
        /**
         * Holds the current public IP address.
         * @member {string}
         */
        this.publicIP = '';

        /**
         * Holds the current set host name IP address.
         * @member {string}
         */
        this.currentIP = '';

        /**
         * Holds the time stamp the last time the host IP address was resolved. This is used in conjunction with `hostIPAddressCacheExpires` to
         * determine if we need to resolve the host IP address again. This is only used if `useHostIPAddressCache` is set to true.
         * @member {number}
         */
        this.lastGotHostIpAddress =  0;

        /**
         * Keeps track of the number of unresolved host name error. This is used to throw an exception if the maxUnresolvedHostNameFail is reached.
         * @member {number}
         */
        this.unresolvedHostNameError = 0;

        /**
         * The class options as defined by [getDefaultOptions()]{@link DEDA-Google-DDNS.DynamicDNS.getDefaultOptions}
         * On initialization the constructor options parameters are merged with the default options.
         * @member {DEDA-Google-DDNS.DynamicDNS.DefaultOptions}
         */
        this.options = Object.assign(this.constructor.getDefaultOptions(), options);
    }

    /**
     * @typedef {Object} DefaultOptions
     * @property {string} username - The dynamic DNS username.
     * @property {string} password - The dynamic DNS password.
     * @property {string} hostname - The dynamic DNS hostname.
     * @property {string} [publicIpUrl=https://domains.google.com/checkip] - The HTTP/HTTPS URL used to check the current public IP of the device.
     * @property {string} [updateIpUrl=https://domains.google.com/nic/update?hostname=%HOSTNAME%&myip=%IPADDRESS%] - The HTTPS URL of the Google DNS API update.
     * @property {string} [userAgent=Nodejs google-ddns] - The HTTP header User-Agent to send when updating the IP address. This is required by the Google Dynamic DNS API.
     * @property {boolean} [failOnUnresolvedHostName = false] - Indicates whether to fail or keep going during synchronizing if the current host name was not resolved.
     *  This typically happens if the domain was created and has not yet been applied or propagated. See TTL (Time-to-Live) for more information.
     *  Every though this can fail the update can sill be successful.
     * @property {number} [maxUnresolvedHostNameFail = 3] - This works in conjunction with failOnUnresolvedHostName to make sure we don't keep failing over and over with no
     *  error back reporting.
     * @property {boolean} [useHostIPAddressCache = true] - Indicates whether to cache and use the last resolved host IP address or resolve every-time. Generally speaking we
     *  don't need to resolve the host every-time since it will not change unless we change it. This saves having to do a DNS request every interval. Use the hostIPAddressCacheExpires
     *  to do a check every once in a while.
     * @property {number} [hostIPAddressCacheExpires = 3600] - If useHostIPAddressCache is set to true, this timer is used to force a host IP address checked/resolution every once
     *  in a while rather than never. The time is in seconds and defaults to every hour.
     * @property {boolean} [debug = false] - Set the debug mode on or off. The debug mode will write debug and status information to the console.
     * @memberof DEDA-Google-DDNS.DynamicDNS
     */

    /**
     * Returns a list of all possible options for this class with their default values.
     * @returns {DEDA-Google-DDNS.DynamicDNS.DefaultOptions} Returns the component default options.
     */
    static getDefaultOptions()
    {
        return {
            username: '',
            password: '',
            hostname: '',
            publicIpUrl: 'https://domains.google.com/checkip',
            updateIpUrl: 'https://domains.google.com/nic/update?hostname=%HOSTNAME%&myip=%IPADDRESS%',
            userAgent: 'Nodejs google-ddns',

            failOnUnresolvedHostName: false,
            maxUnresolvedHostNameFail: 3,

            useHostIPAddressCache: true,
            hostIPAddressCacheExpires: 2*60,

            debug: true
        };
    }

    /**
     * This is a static array that contains a list of all the possible Google API responses to the update query.
     * This is used to return the result to the caller.
     * @readonly
     * @static
     * @see {@link https://support.google.com/domains/answer/6147083?hl=en}
     */
    static get ApiResponses()
    {
        return [
            {response: 'good', status: 'success', message: 'The update was successful.'},
            {response: 'nochg', status: 'success', message: 'The supplied IP address is already set for this host.'},
            {response: 'nohost', status: 'error', message: 'The hostname does not exist, or does not have Dynamic DNS enabled.'},
            {response: 'badauth', status: 'error', message: 'The username / password combination is not valid for the specified host.'},
            {response: 'notfqdn', status: 'error', message: 'The supplied hostname is not a valid fully-qualified domain name.'},
            {response: 'badagent', status: 'error', message: 'Your Dynamic DNS client is making bad requests. Ensure the user agent is set in the request, and that you’re only attempting to set an IPv4 address. IPv6 is not supported.'},
            {response: 'abuse', status: 'error', message: 'Dynamic DNS access for the hostname has been blocked due to failure to interpret previous responses correctly.'},
            {response: '911', status: 'error', message: 'An error happened on our end. Wait 5 minutes and retry.'}
        ]
    }

    /**
     * Synchronizes the DNS IP address with the current public IP address. This method will get the current
     * IP and the DNS IP and compare them. If they have changed then a request is sent to Google to update the current IP
     * address. This is an asynchronous method that returns a promise when current status.
     *
     * @param {boolean} [force = false] Forces the update of the DNS regardless if it has changed or not.
     * @returns {Promise} Returns a promise that is resolved with the status of the sync call.
     */
    async sync(force = false)
    {
        try
        {
            // Get the current public IP address and the current DNS host IP address.
            let publicIP = await this.getPublicIP();
            let currentIP = '0.0.0.0';

            try {
                // Try to get the current IP address of the domain. This can fail if the domain does not exist or has not propagated or been applied yet.
                currentIP = await this.getCurrentIP();
                const regEx = /[^\d\+]/g;
                currentIP = currentIP.str.replace(regEx, '');
                console.log('~~~~~ currentIP ~~~~~', currentIP)
                // Clear the counter since we got successful result.
                this.unresolvedHostNameError = 0;

            } catch (error) {

                // Log the error. If this occurred more than x times then throw error.
                this.unresolvedHostNameError++;

                // If we are to fail if host was not found then throw error. Or if we have reached the max set errors.
                if (this.options.failOnUnresolvedHostName || this.unresolvedHostNameError >= this.options.maxUnresolvedHostNameFail) throw error;
            }

            // Check if they have changed.
            const hasChanged = (publicIP !== currentIP);

            const regEx = /[^\d\.]/g;
            // let out = publicIP.str.replace(regEx, '');
            publicIP = publicIP.toString().replace(regEx, '')
            console.log(`Public IP ${publicIP}, currentIP ${currentIP}, has change: ${hasChanged}`);

            // If they have changed or we are forced to do an update then update the hostname DNS IP address. Otherwise return true to indicate that all is well.
            return (hasChanged || force ? await this.update(publicIP) : true);
        }
        catch (error) {
            // Return the generated error.
            return error;
        }
    }

    /**
     * Returns a promise with the public IP address of the current network hosting this application.
     * This method uses the HTTP GET url `options.publicIpUrl` to fetch the external IP address.
     * This method can be overwritten to extend or implement different methods of fetching the external/public IP.
     *
     * @returns {Promise} Returns a promise that is resolved with the public IP if successful otherwise returns an error object {error: message}.
     */
    getPublicIP()
    {
        return new Promise( (resolve, reject)=>{

            // Check if we are to use HTTPS or HTTP to fetch the public IP.
            const protocol = (this.options.publicIpUrl.toLowerCase().startsWith('https') ? https : http);

            // Get the HTTP body for the set URL.
            protocol.get(this.options.publicIpUrl, response=>{

                // If the HTTP response was not success then report error and return.
                if (response.statusCode !== 200) return reject({status: 'error', message: `Unable to get public IP. Request failed: ${response.statusCode}`});

                // Next, read the IP from the response body.
                let ip = '';
                response.on('data', chunk=>{ ip += chunk; });
                response.on('end', ()=>{

                    // Validate the fetched IP address to ensure it is correct.
                    if (this.validateIPv4(ip))
                    {
                        // Set the local variable and resolve the promise.
                        this.publicIP = ip;
                        resolve(ip);
                    }
                    // Report the error.
                    else reject({status: 'error', message: `Got invalid public IP address: ${ip}`});
                });

            // If an error occurred then report it.
            }).on('error', error=>reject({status: 'error', message: `Unable to get public IP. Request error: ${error.message}`}));

        });
    }

    /**
     * Uses the DNS protocol to resolve a IPv4 addresses (A records) for the hostname.
     * NOTE: This can and may return multiple IP addresses as of this version only the first IP address is returned. This can be extended to support multiple IPs in the future.
     *
     * @returns {promise} Returns a promise that is resolved when the host IP address is resolve. Otherwise rejected with an error message.
     */
    getCurrentIP()
    {
        return new Promise( (resolve, reject)=>{

            // If use cache and last checked has not expired then return the cache value.
            this.debug(`Getting host IP address: ${this.currentIP}.`);
            if (this.options.useHostIPAddressCache && (Date.now() - this.lastGotHostIpAddress) < (this.options.hostIPAddressCacheExpires * 1000) ) return resolve(this.currentIP);

            // Otherwise request the DNS information use the DNS protocol to resolve the IPv4 address for the host name.
            this.debug(`Resolving host IP address.`);
            console.log({
                "this.options.hostname":this.options.hostname,
                "addresses":addresses
            })
            dns.resolve4(this.options.hostname, (error, addresses) => {

                // If an error occurred then report it.
                if (error) return reject({status: 'error', message: `Unable to resolve current host name (${this.options.hostname}) IP address: ${error}`});

                // If there are no IP address then also report an error. Note sure if this will ever occur!
                if (!addresses || addresses.length === 0) return reject({status: 'error', message: `Unable to resolve current host name (${this.options.hostname}) IP address: No addresses returned!`});

                // Set the local variable and update the timestamp, then resolve the promise.
                this.currentIP = addresses[0];
                this.lastGotHostIpAddress = Date.now();
                resolve(this.currentIP);
            });

        });
    }

    /**
     * Sends a request using the Google Domain Dynamic DNS API to update the IP address to the current IP address.
     * @param {string} ip - The IP address to update the Google Dynamic DNS.
     */
    update(ip)
    {
        return new Promise( (resolve, reject)=>{

            // Clear the last last fetched IP address timer so that it is forced to get it next time to ensure the value has changed.
            this.lastGotHostIpAddress = 0;

            // Build the GET URL using the set option url. Parse the URL to get it's components to be used within the request.
            const updateUrl = url.parse( this.options.updateIpUrl.replace('%HOSTNAME%', this.options.hostname).replace('%IPADDRESS%', (ip || this.publicIP)) );

            // Build the options parameter for the HTTPS method.
            const options = {
                host: updateUrl.host,
                path: updateUrl.path,
                auth: `${this.options.username}:${this.options.password}`,
                headers: { 'User-Agent': this.options.userAgent } // This is required by the Google Dynamic DNS API
            };
            console.log('~~~~ response ~~~~', options)
            // Get the HTTP body for the set URL.
            https.get(options, response=>{
                // If the HTTP response was not success then report error and return.
                if (response.statusCode !== 200) return reject({status: 'error', message: `Unable to update IP. Request failed: ${response.statusCode}`});

                // Next, read the IP from the response body.
                let status = '';
                response.on('data', chunk=>{ status += chunk; });
                response.on('end', ()=>{

                    // Parse the response. The returned result is already in the format that needs to be returned.
                    const result = this.parseResult(status, this.publicIP, this.currentIP);

                    // If the result as a success then resolve the promise, otherwise reject it.
                    if (result.status === 'success') resolve(result); else reject(result);
                });

            // If an error occurred then report it.
            }).on('error', error=>reject({status: 'error', message: `Unable to update IP. Request error: ${error.message}`}));

        });
    }

    /**
     * @typedef {Object} ApiResponse
     * @property {string} response - The response code as defined by the Google API
     * @property {string} status - This could either be 'success' or 'error'
     * @property {string} message - A full human readable description of the response. This is provided for both the error and success status.
     * @property {string} [ip] - If the response is either 'good' or 'nochg' then the IP address is the IP that is currently set for the domain DNS.
     * @memberof DEDA-Google-DDNS.DynamicDNS
     */

    /**
     * Pareses the Update request body and returns an object the represents the results.
     *
     * @param {string} body - The HTTP update response body as sent back from the request.
     * @param {string} expectedIP - The expected IP address that the update should have changed to. This is used to validate the result.
     * @param {string} currentIP - The current IP address of the dom before it was changed. This is used for message reporting only.
     * @returns {DEDA-Google-DDNS.DynamicDNS.ApiResponse} - Returns the response that response the given body.
     * @see DEDA-Google-DDNS.DynamicDNS.ApiResponses
     */
    parseResult(body, expectedIP, currentIP)
    {
        // Split the result, this could of the following format '<string> <string>'
        body = body.split(' ');
        const token = body[0], ip = body[1];

        // Find the corresponding response in the API response array.
        const result = DynamicDNS.ApiResponses.find( response=>response.response === token );

        // If none was found then report an error response.
        if (!result) return {response: token, status: 'error', message: `Unknown or not handled response type: ${token}`};

        // If it was a success then check the IP addresses to make sure an update was successful.
        else if (result.status === 'success')
        {
           console.log('result }}}}}',result)
            // If the IP address did not change then log error.
            // if (ip !== expectedIP) return {response: token, status: 'error', message: `Response was successful but expected IP ${expectedId} is not equal to changed IP ${ip}`};

            // Otherwise append the new and old IP to the the message.
            // else result.message += ` IP changed from: ${currentIP} to ${expectedIP}.`;
        }

        // If the body contains an IP address then add it to the response and return it.
        return Object.assign({ip}, result);
    }

    /**
     * Checks if the given IP address is a valid IPv4 address.
     * @param {string} ip - And IPv4 address to validate.
     * @returns {boolean} Returns true if the given ip is valid otherwise returns false.
     */
    validateIPv4(ip)
    {
        return /(([0-9]{1,3}\.){3}[0-9]{1,3})/.test(ip);
    }

    debug(message)
    {
        if (this.options.debug) console.debug(message);
    }
}

// Export the class
DynamicDNS.namespace = 'DEDA.Google.Domains.DynamicDNS';
module.exports = DynamicDNS;
};

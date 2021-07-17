// import path from "path";
// import fs from 'fs'
// import http from 'http'
// import https from 'https'
// import cors from 'cors'
// import httpProxy from 'http-proxy'
// import whitelist from './whitelist/whitelist.mjs'
// import express from "express";
// import Btc from './btc.api.openbazaar.mjs'
// import Ltc from './ltc.api.openbazaar.mjs'
// import Zec from './zec.api.openbazaar.mjs'
// import Bch from './bch.api.openbazaar.mjs'
// import stdrpc from "stdrpc"
// import dotenv from 'dotenv'
// dotenv.config()
import wifi from "node-wifi";
import {networkInterfaces} from "os";
const nets = networkInterfaces();
const results = Object.create(null);
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            console.log('net.address', net.address)
            results[name].push(net.address);
        }
    }
}

// wifi.init({
//     iface: null // network interface, choose a random wifi interface if set to null
// });
// wifi.scan((error, networks) => {
//     if (error) {
//         console.log(error);
//     } else {
        // console.log(networks);
        /*
            networks = [
                {
                  ssid: '...',
                  bssid: '...',
                  mac: '...', // equals to bssid (for retrocompatibility)
                  channel: <number>,
                  frequency: <number>, // in MHz
                  signal_level: <number>, // in dB
                  quality: <number>, // same as signal level but in %
                  security: 'WPA WPA2' // format depending on locale for open networks in Windows
                  security_flags: '...' // encryption protocols (format currently depending of the OS)
                  mode: '...' // network mode like Infra (format currently depending of the OS)
                },
                ...
            ];
            */
    // }
// });
//
// let connect = wifi.connect({ ssid: 'Sergey.Zb', password: 'gcxf567gD$6' }, error => {
//     if (error) {
//         console.log(error);
//     }
//     console.log('Connected');
//
//
//     wifi.getCurrentConnections((error, currentConnections) => {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log(currentConnections);
//             /*
//             you may have several connections
            // [
            //     {
            //         iface: '...', // network interface used for the connection, not available on macOS
            //         ssid: '...',
            //         bssid: '...',
            //         mac: '...', // equals to bssid (for retrocompatibility)
            //         channel: <number>,
            //         frequency: <number>, // in MHz
            //         signal_level: <number>, // in dB
            //         quality: <number>, // same as signal level but in %
            //         security: '...' //
            //         security_flags: '...' // encryption protocols (format currently depending of the OS)
            //         mode: '...' // network mode like Infra (format currently depending of the OS)
            //     }
            // ]
            // */
        // }
    // });
// });
//
//
//
//
// console.log('--- connect ---', connect)
// var app = express();
//
// var options = {
//     key: fs.readFileSync('./cert/web3.news/privkey.pem'),
//     cert: fs.readFileSync('./cert/web3.news/fullchain.pem')
// };
//
// http.createServer(app).listen(80);
// https.createServer(options, app).listen(8888);
//
//
// const rpc = stdrpc({
//     url: "http://localhost:8232",
//     username: "zb",
//     password: "f4xV6MeOOQ3qNGYTewOA8fuTRI/5ir6gCFnG0MGxNE8="
// });
//
// rpc.getaddressutxos({"addresses": ["t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"]})
//     .then(data => {
//         console.log('--- getaddressutxos ---', data)
//     }).catch((e)=>{
//         console.log('~~~~~~~ getaddressutxos ~~~~~~~', e)
//     });

// rpc.getaddressbalance({"addresses": ["t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"]})
//     .then(data => {
//         console.log('--- getaddressbalance ---', data)
//     }).catch((e)=>{
//     console.log('~~~~~~~ getaddressbalance ~~~~~~~', e)
// });
//
//
// rpc.getwalletinfo()
//     .then(data => {
//         console.log('--- getwalletinfo ---', data)
//     }).catch((e)=>{
//     console.log('~~~~~~~ getwalletinfo ~~~~~~~', e)
// });
//
// rpc.importprivkey("params": ["KyEQD67yLv7cAUqVwBnWCztdRJazEPMktcApgcT2ne5nFre8pqfr", "testing", false])
//     .then(data => {
//         console.log('--- importprivkey ---', data)
//     }).catch((e)=>{
//     console.log('~~~~~~~ importprivkey ~~~~~~~', e)
// });
//
//
// rpc.getaccount([{"zcashaddress":"t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"}])
//     .then(data => {
//         console.log('--- getaccount ---', data)
//     }).catch((e)=>{
//     console.log('~~~~~~~ getaccount ~~~~~~~', e.config)
// });
//
//
// import path from "path";
// import fs from 'fs'
// import express from "express";
// import https from 'https'
// import cors from 'cors'
// import whitelist from './whitelist/whitelist.mjs'
// import dotenv from 'dotenv'
// import isEmpty from './isEmpty/isEmpty.mjs'
// import {Server} from "socket.io";
// import SoChain from "./sochain/index.mjs";
// import Axios from 'axios'
// const axios = Axios.default;
// import stdrpc from "stdrpc"
//
//
// dotenv.config()

// const rpc = stdrpc({
//     url: "http://localhost:8232",
//     username: "zb",
//     password: "f4xV6MeOOQ3qNGYTewOA8fuTRI/5ir6gCFnG0MGxNE8="
// });
// rpc.getaddressutxos({"addresses": ["t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"]})
//     .then(data => {
//     console.log('getaddressbalance---', data)
// }).catch((e)=>{
//     console.log('~~~~~~~~~~~~>>>', e.code)
// });

// console.log('rpc', rpc)
// rpc.getaddressbalance({"addresses": ["t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"]}).then(balance => {
//     console.log('getaddressbalance---', balance)
// });
//
// rpc.getblockhash(1000).then(data => {
//     console.log('getblockhash---', data)
// });
//
// rpc.getaddressdeltas({"addresses":["t1gyJeWownZrpstwETf9R7GYSsQGUs93X7r"]}).then(data => {
//     console.log('getaddressdeltas---', data)
// });
// rpc.getwalletinfo([]).then(data => {
//     console.log('getwalletinfo---', data)
// });


// let sys = {
//     verify: {
//         address: true
//     },
//     address: function *(data) {
//         console.log('create generator')
        // for(let address of data) {
        //     yield address
        // }
    // }
// }
//
// export default (async ()=>{
//     let __dirname = path.dirname(process.argv[1]);
//     __dirname = __dirname.replace(/\/node_modules\/pm2\/lib/gi, '')
//     __dirname = __dirname.replace(/\/node_modules\/.bin/gi, '')
//     __dirname = __dirname.replace(/usr\/lib/ig,"home/system")
//     let privateKey  = fs.readFileSync(`${__dirname}/cert/localhost.key`, 'utf8');
//     let certificate = fs.readFileSync(`${__dirname}/cert/localhost.crt`, 'utf8');
//     let ssl = {key: privateKey, cert: certificate};
//     let api = new SoChain("LTC")
//     let app = express();
//     app.use(express.json())
//     app.use(cors({ credentials: true }));
//     let server = https.createServer(ssl, app);

    // app.get('/*', (req, res) => {
    //     console.log('~~~~~~~~~~zec~~~~~~~~~', req.params)
    //     res.send(`<div>Dynamic DNS</div>`);
    // });
    //
    //
    //
    // app.listen(8888, () => {
    //     console.log('web3.news: 8888 true');
    // });
    // return app
// })();
//
// Export the files for this library so they can be used within other modules.
// module.exports = {
//     DynamicDNS: require('./lib/DynamicDNS'),
//     Service: require('./lib/Service')
// };

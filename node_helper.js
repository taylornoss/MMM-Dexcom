/* Magic Mirror
 * Module: MMM-Dexcom
 *
 *
 */
const NodeHelper = require('node_helper');
const Log = require('logger');
const moment = require('moment');

module.exports = NodeHelper.create({

    loginURL: "https://share1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName",
    dataURL: "https://share1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?",
    applicationId: "d89443d2-327c-4a6f-89e5-496bbb0317db",

    ModuleNotification: {
        CONFIG: "MMM-DEXCOM-CONFIG",
        DATA: "MMM-DEXCOM-DATA",
        ALL_MODULES_STARTED: "ALL_MODULES_STARTED"
    },
    start: function () {
        console.log("Starting node_helper for: " + this.name);
    },

    // Core function of franewor that schedules the Update
    scheduleUpdate: function () {

        //schedule the updates for Subsequent Loads
        var self =this; 

        
        setInterval(() => {
            self.checkSchedule();
        }, self.config.updateSecs * 1000);
    },
    checkStatus: function (res) {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(json => {
            Log.error(`API Error - ${json.code}`, json.message);
          });
        }
    },
    getSessionId: async function () {
        var api_url = this.loginURL;
        var body = {
            accountName: this.config.username,
            password: this.config.password,
            applicationId: this.applicationId
        }
        var bodyAsString = JSON.stringify(body);
        return fetch(api_url, {
            method: "POST",
            body: bodyAsString,
            headers: {
                'User-Agent': "Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0",
                'Content-Type': "application/json",
                'Content-Length': bodyAsString == undefined ? 0 : bodyAsString.length,
                'Accept': "application/json",
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                var id = text.toString().replace(/"/g, "")
                Log.debug("MMM-Dexcom: Suggessfully obtained sessionID: " + id);
                return id;
            })
            .catch(e => {
                Log.error(e);
            });
    },
    checkSchedule: async function () {
        var self = this;
        var sessionID = await this.getSessionId();
        Log.debug("Session ID is: "+sessionID);
        var minutes = "1440";
        var maxCount = "1";
        var api_url = this.dataURL + "sessionID=" + sessionID + "&minutes=" + minutes + "&maxCount=" + maxCount;
        let response = {
            date: new Date(),
            sugarMg: 0,
            sugarMmol: 0,
            trend: 0
        }
        // Call API - if alert is for tomorrow, show. otherwise hide
        fetch(api_url, {
            method: "POST"
        })
            .then(self.checkStatus)
            .then(obj => {
                var json = obj[0];
                response.date = new Date(parseInt(json.WT.match(/\d+/)[0], 10));
                response.sugarMg = json.Value;
                response.sugarMmol = Math.floor(10 * (json.Value / 18.0)) / 10;
                response.trend = json.Trend.toString().toUpperCase();
                response.fromNow = moment(response.date).fromNow();
            })
            .catch(e => {
                Log.error(e);
            }).finally(() => {
                Log.log("Sending MMM-Dexcom Notification");
                self.sendSocketNotification(this.ModuleNotification.DATA, response);
            });
    },

    socketNotificationReceived: function (notification, payload) {

        var self = this;

        if (notification === this.ModuleNotification.CONFIG) {
            Log.log("MMM-Dexcom config received");
            this.config = payload;
            if (this.started !== true) {
                this.started = true;
                this.scheduleUpdate();
            }
            this.checkSchedule();
        }
        
            
    }
});

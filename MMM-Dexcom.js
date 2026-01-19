Module.register("MMM-Dexcom", {
    ModuleNotification: {
        CONFIG: "MMM-DEXCOM-CONFIG",
        DATA: "MMM-DEXCOM-DATA",
        ALL_MODULES_STARTED: "ALL_MODULES_STARTED"
    },
    DexcomTrend: {
        NONE: "NONE",
        DOUBLE_UP: "DOUBLEUP",
        SINGLE_UP: "SINGLEUP",
        FORTYFIVE_UP: "FORTYFIVEUP",
        FLAT: "FLAT",
        FORTYFIVE_DOWN: "FORTYFIVEDOWN",
        SINGLE_DOWN: "SINGLEDOWN",
        DOUBLE_DOWN: "DOUBLEDOWN",
        NOT_COMPUTABLE: "NOTCOMPUTABLE",
        RATE_OUT_OF_RANGE: "RATEOUTOFRANGE"
    },
    // Default module config.
    defaults: {
        updateSecs: 300,
        units: "mmol",
        username: "",
        password: "",
        lowlimit: 70,
        highlimit: 200,
    },
    getStyles: function () {
        return ['MMM-Dexcom.css'];
    },
    message: "Loading...",
    reading: undefined,
    clockSpan: undefined,
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "mmm-dexcom";
        if (this.message !== undefined) {
            wrapper.innerText = this.message;
        }
        else if (this.reading == undefined) {
            wrapper.innerText = "Reading not available";
        }
        else if (this.config !== undefined) {
            var reading = document.createElement("div");
            reading.className = "circle-value";
            var date = document.createElement("div");
            if (this.reading.date !== undefined) {
                date.innerText = this.reading.fromNow;
                date.className = "dimmed small";
            }
            var sugar = document.createElement("span");
            var units = document.createElement("span");
            sugar.className = "bright medium";
            units.className = "dimmed small";
            var sugarValue = void 0;
            if (this.config.units === "mg") {
                sugarValue = this.reading.sugarMg;
                sugar.innerText = this.reading.sugarMg.toString();
                units.innerText = " mg/dL";
            }
            else {
                sugarValue = this.reading.sugarMmol;
                sugar.innerText = this.reading.sugarMmol.toString();
                units.innerText = " mmol/L";
            }
            if (this.config.lowlimit !== undefined && sugarValue <= this.config.lowlimit) {
                reading.className += " bg-danger";
            }
            if (this.config.highlimit !== undefined && sugarValue >= this.config.highlimit) {
                reading.className += " bg-warning";
            }
            var trend = document.createElement("span");
            trend.className = "bright small";
            switch (this.reading.trend) {
                case this.DexcomTrend.DOUBLE_DOWN:
                    trend.appendChild(this._createIcon("fa-arrow-down"));
                    trend.appendChild(this._createIcon("fa-arrow-down"));
                    break;
                case this.DexcomTrend.DOUBLE_UP:
                    trend.appendChild(this._createIcon("fa-arrow-up"));
                    trend.appendChild(this._createIcon("fa-arrow-up"));
                    break;
                case this.DexcomTrend.FLAT:
                    trend.appendChild(this._createIcon("fa-arrow-right"));
                    break;
                case this.DexcomTrend.FORTYFIVE_DOWN:
                    trend.appendChild(this._createIcon("fa-arrow-right fa-rotate-45"));
                    break;
                case this.DexcomTrend.FORTYFIVE_UP:
                    trend.appendChild(this._createIcon("fa-arrow-up fa-rotate-45"));
                    break;
                case this.DexcomTrend.NONE:
                    break;
                case this.DexcomTrend.NOT_COMPUTABLE:
                    trend.appendChild(this._createIcon("fa-question-circle"));
                    break;
                case this.DexcomTrend.RATE_OUT_OF_RANGE:
                    trend.appendChild(this._createIcon("fa-exclamation-triangle"));
                    break;
                case this.DexcomTrend.SINGLE_DOWN:
                    trend.appendChild(this._createIcon("fa-arrow-down"));
                    break;
                case this.DexcomTrend.SINGLE_UP:
                    trend.appendChild(this._createIcon("fa-arrow-up"));
                    break;
            }

            reading.appendChild(sugar);
            reading.appendChild(trend);
            wrapper.appendChild(reading);
            wrapper.appendChild(date);
            this.clockSpan = date;
        }
        else {
            Log.error("Something is wrong");
        }
        return wrapper;
    },
    start: function () {
        var _this = this;
        console.log("Starting");
        var config = this.config;
        if (config == undefined) {
            this.message = "Configuration is not defined";
        }
        else {
            if (config.username === undefined || config.password === undefined) {
                this.message = "Username or password not configured";
            }
            else {
                this.message = this.message;
            }
        }
        this._updateDom();
        setInterval(function () {
            if (_this.clockSpan !== undefined && _this.reading !== undefined && _this.reading.date !== undefined && _this.reading.fromNow !== undefined) {
                var updatedText = "1 minute ago";
                if (_this.reading.fromNow.includes("seconds")) {
                    _this.clockSpan.textContent = updatedText;
                }
                else {
                    var pieces = _this.reading.fromNow.split(" ");
                    if(pieces[0] === "a"){
                        pieces[0] = 1;
                    }
                    var num = parseInt(pieces[0]);
                    pieces[0] = ++num;
                    if (pieces[1] === "minute") {
                        pieces[1] = "minutes";
                    }
                    updatedText = pieces.join(" ");
                }
                _this.reading.fromNow = updatedText;
                _this.clockSpan.textContent = updatedText;
            }
        }, 60000);
    },
    notificationReceived: function (notification, payload, sender) {
        if (notification === this.ModuleNotification.ALL_MODULES_STARTED) {
            this._sendSocketNotification(this.ModuleNotification.CONFIG, this.config);
        }
    },
    socketNotificationReceived: function (notification, payload) {
        Log.debug(notification, payload);
        if (notification === this.ModuleNotification.DATA) {
            this.reading = payload;
            this.message = undefined;
            this._updateDom();
        }
    },
    _sendSocketNotification: function (notification, payload) {
        if (this.sendSocketNotification !== undefined) {
            this.sendSocketNotification(notification, payload);
        }
        else {
            console.error("sendSocketNotification is not present");
        }
    },
    _updateDom: function () {
        if (this.updateDom !== undefined) {
            this.updateDom();
        }
    },
    _createIcon: function (className) {
        var icon = document.createElement("span");
        icon.className = "fa fa-fw " + className;
        return icon;
    }
    
});

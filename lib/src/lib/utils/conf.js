"use strict";

const Conf = require("conf");

const confInst = new Conf();

// console.log("conf:", confInst.path);

const Keys = {
    installed: "installed",
    toolinstalled: "toolinstalled",
    startuped: "startuped",
    startup_pending: "startup_pending"
};

const Values = {
    installInit: -1,
    installBuiltin: 0,
    installCustom: 1,

    unstartupPending: -2,
    unstartuped: -1,
    startuped: 0,
    startupPending: 1
};

class AppConf {
    set(key, value) {
        return confInst.set(key, value);
    }

    get(key, defaultValue) {
        return confInst.get(key, defaultValue);
    }

    get InnerInstance() {
        return confInst;
    }
}

const appConfInst = new AppConf();
appConfInst.Keys = Keys;
appConfInst.Values = Values;

module.exports = {
    conf: appConfInst,
    Keys,
    Values
};
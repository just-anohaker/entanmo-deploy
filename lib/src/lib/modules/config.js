"use strict";

const Commands = require("../commands");

const doctor = async op => {
    if (op === Commands.account) {
        // console.log("doctor account.");
    } else if (op === Commands.network) {
        // console.log("doctor network");
    } else if (op === Commands.config) {
        // console.log("doctor config");
    } else {
        throw new Error(`Unsupported op[${op}]`);
    }
};

const account = async params => {
    void (params);
    console.log("Account.");
};

const network = async params => {
    void (params);

    console.log("Network.");
};

const config = async params => {
    void (params);

    console.log("Config");
};

module.exports = {
    doctor,
    account,
    network,
    config
};
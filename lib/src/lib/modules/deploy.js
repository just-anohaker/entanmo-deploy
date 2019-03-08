"use strict";

const Commands = require("../commands");
const { doctorNode, doctorPM2, } = require("../utils/env");
const { colorWarning } = require("../utils/colorful");
const {
    deploy: pm2Deploy,
    undeploy: pm2Undeploy,
    isDeployed: pm2IsDeployed,
    startup: pm2Startup,
    unstartup: pm2Unstartup,
    isStartuped: pm2IsStartuped,
    isStartupPending: pm2IsStartupPending,
    isUnstartupPending: pm2IsUnstartupPending,
    getPending: pm2GetPending
} = require("../utils/pm2");

const doctor = async op => {
    /// check node 
    try {
        await doctorNode();
        await doctorPM2();
    } catch (error) {
        throw new Error(`environment unconfig, please use "deploy install" to config.`);
    }

    if (op === Commands.deploy) {
        // console.log("doctor deploy.");
    } else if (op === Commands.undeploy) {
        // console.log("doctor undeploy.");
    } else if (op === Commands.isdeployed) {
        // console.log("doctor isdeployed.");
    } else if (op === Commands.startup) {
        // console.log("doctor startup.");
    } else if (op === Commands.unstartup) {
        // console.log("doctor unstartup.");
    } else if (op === Commands.isstartuped) {
        // console.log("doctor isstartuped.");
    } else {
        throw new Error(`Unsupported op[${op}]`);
    }
};

const deploy = async (params, log = false) => {
    void (params);

    let deployed;
    try {
        deployed = await pm2IsDeployed();
    } catch (error) {
        deployed = false;
    }
    if (deployed) {
        return true;
    }

    try {
        return await pm2Deploy();
    } catch (error) {
        if (log) console.log(`[Deploy] ${error.toString()}`);
        throw error;
    }
};

const undeploy = async (params, log = false) => {
    void (params);

    let deployed;
    try {
        deployed = await pm2IsDeployed();
    } catch (error) {
        void (error);
        deployed = false;
    }
    if (!deployed) {
        return true;
    }
    try {
        return await pm2Undeploy();
    } catch (error) {
        if (log) console.log(`[Undeploy] ${error.toString()}`);
        throw error;
    }
};

const isdeployed = async (params, log = false) => {
    void (params);
    try {
        return await pm2IsDeployed();
    } catch (error) {
        if (log) console.log(`[IsDeployed] ${error.toString()}`);
        throw new Error(error.toString());
    }
};

const startup = async (params, log = false) => {
    void (params);

    if (await pm2IsStartuped()) {
        if (await pm2IsStartupPending()) {
            console.log("[Startup] To setup the Startup Script, copy/paste the following command once:\n"
                + colorWarning(await pm2GetPending()));
        }
        return true;
    }

    let deployed;
    try {
        deployed = await pm2IsDeployed();
    } catch (error) {
        void (error);
        deployed = false;
    }
    if (!deployed) {
        throw new Error(`Undeployed, please use "./deploy deploy" to deploy.`);
    }

    try {
        return await pm2Startup();
    } catch (error) {
        if (log) console.log(`[Startup] ${error.toString()}`);
        throw error;
    }
};

const unstartup = async (params, log = false) => {
    void (params);

    if (!(await pm2IsStartuped())) {
        if (await pm2IsUnstartupPending()) {
            console.log("[Unstartup] To setup the Startup Script, copy/paste the following command once:\n"
                + colorWarning(await pm2GetPending()));
        }
        return true;
    }

    try {
        return await pm2Unstartup();
    } catch (error) {
        if (log) console.log(`[Unstartup] ${error.toString()}`);
        throw error;
    }
};

const isstartuped = async (params, log = false) => {
    void (params);

    try {
        return await pm2IsStartuped();
    } catch (error) {
        if (log) console.log(`[IsStartuped] ${error.toString()}`);
        throw error;
    }
};

const list = async (params, log = false) => {
    void (params);
    void (log);
};

const monit = async (params, log = false) => {
    void (params);
    void (log);
};

module.exports = {
    doctor,
    deploy,
    undeploy,
    isdeployed,
    startup,
    unstartup,
    isstartuped,
    list,
    monit
};


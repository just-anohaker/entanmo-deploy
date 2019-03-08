"use strict";

const { conf, Keys, Values } = require("../utils/conf");
const {
    lnNode,
    unlnNode,
    doctorNode,
    lnPM2,
    unlnPM2,
    doctorPM2
} = require("../utils/env");
const Commands = require("../commands");

const doctor = async (op) => {
    if (op === Commands.install) {
        // console.log("doctor install");
    } else if (op === Commands.uninstall) {
        // console.log("doctor uninstall");
    } else if (op === Commands.isinstalled) {
        // console.log("doctor isinstalled");
    } else {
        throw new Error(`unsupported op[${op}]`);
    }
};

const install = async (log = false) => {
    try {
        let installed = false;
        try {
            await doctorNode();
            installed = true;
        } catch (error) {
            void (error);
            // TODO: node is invalid.
        }
        if (!installed) {
            await lnNode();
            conf.set(Keys.installed, Values.installCustom);
            return true;
        }
        const confIsInstalled = conf.get(Keys.installed, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            conf.set(Keys.installed, Values.installBuiltin);
        }
        return true;
    } catch (error) {
        if (log) console.log(`[Install] ${error.toString()}`);
        throw error;
    }
};

const uninstall = async (log = false) => {
    try {
        const confIsInstalled = conf.get(Keys.installed, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            return true;
        }

        if (confIsInstalled === Values.installBuiltin) {
            conf.set(Keys.installed, Values.installInit);
            return true;
        }

        await unlnNode();
        conf.set(Keys.installed, Values.installInit);
        return true;
    } catch (error) {
        if (log) console.log(`[Uninstall] ${error.toString()}`);
        throw error;
    }
};

const isinstalled = async (log = false) => {
    try {
        const confIsInstalled = conf.get(Keys.installed, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            await doctorNode();
        }
        return true;
    } catch (error) {
        if (log) console.log(`[IsInstalled] ${error.toString()}`);
        return false;
    }
};

const toolinstall = async (log = false) => {
    try {
        let installed = false;
        try {
            await doctorPM2();
            installed = true;
        } catch (error) {
            void (error);
            // TODO: pm2 is invalid
        }
        if (!installed) {
            await lnPM2();
            conf.set(Keys.toolinstalled, Values.installCustom);
            return true;
        }

        const confIsInstalled = conf.get(Keys.toolinstalled, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            conf.set(Keys.toolinstalled, Values.installBuiltin);
        }
        return true;
    } catch (error) {
        if (log) console.log(`[Install] ${error.toString()}`);
        throw error;
    }
};

const tooluninstall = async (log = false) => {
    try {
        const confIsInstalled = conf.get(Keys.toolinstalled, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            return true;
        }

        if (confIsInstalled === Values.installBuiltin) {
            conf.set(Keys.toolinstalled, Values.installInit);
            return true;
        }

        await unlnPM2();
        conf.set(Keys.toolinstalled, Values.installInit);
        return true;
    } catch (error) {
        if (log) console.log(`[Uninstall] ${error.toString()}`);
        throw error;
    }
};

const toolisinstalled = async (log = false) => {
    try {
        const confIsInstalled = conf.get(Keys.toolinstalled, Values.installInit);
        if (confIsInstalled === Values.installInit) {
            await doctorPM2();
        }
        return true;
    } catch (error) {
        if (log) console.log(`[IsInstalled] ${error.toString()}`);
        return false;
    }
};

module.exports = {
    doctor,
    install,
    uninstall,
    isinstalled,
    toolinstall,
    tooluninstall,
    toolisinstalled
};
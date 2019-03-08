"use strict";

const Commands = {
    // check system info
    doctor: "doctor",

    // auto 
    run: "run",

    // init 
    install: "install",
    uninstall: "uninstall",
    isinstalled: "isinstalled",

    // deploy
    deploy: "deploy",
    undeploy: "undeploy",
    isdeployed: "isdeployed",
    startup: "startup",
    unstartup: "unstartup",
    isstartuped: "isstartuped",
    list: "list",
    monit: "monit",

    // config
    account: "account",
    network: "network",
    config: "config"
};

module.exports = Commands;
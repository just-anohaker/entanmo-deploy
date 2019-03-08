"use strict";

const program = require("commander");

const {
    doctor,
    deploy,
    undeploy,
    isdeployed,
    startup,
    unstartup,
    isstartuped,
    // list,
    // monit
} = require("../lib/modules/deploy");
const { colorError, colorSuccess } = require("../lib/utils/colorful");
const Commands = require("../lib/commands");

module.exports = () => {
    program
        .command(Commands.deploy)
        .description("Check and Deploy EnTanMo node.")
        .action(() => {
            doctor(Commands.deploy)
                .then(() => {
                    return deploy();
                })
                .then(result => {
                    void (result);
                    console.log(`[Deploy] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Deploy] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.undeploy)
        .description("Check and Undeploy EnTanMo node.")
        .action(() => {
            doctor(Commands.undeploy)
                .then(() => {
                    return undeploy();
                })
                .then(result => {
                    void (result);
                    console.log(`[Undeploy] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Undeploy] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.isdeployed)
        .description("Check whether EnTanMo node is deployed.")
        .action(() => {
            doctor(Commands.isdeployed)
                .then(() => {
                    return isdeployed();
                })
                .then(result => {
                    if (result) {
                        // is deployed
                        console.log(`[IsDeployed] ${colorSuccess("YES.")}`);
                    } else {
                        // is undeployed
                        console.log(`[IsDeployed] ${colorSuccess("NO.")}`);
                    }
                })
                .catch(error => {
                    console.log(`[Isdeployed] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.startup)
        .description("Check and Config startup script.")
        .action(() => {
            doctor(Commands.startup)
                .then(() => {
                    return startup();
                })
                .then(result => {
                    if (typeof result === "boolean") {
                        console.log(`[Startup] ${colorSuccess("OK.")}`);
                    } else {
                        console.log(`[Startup] ${colorSuccess("OK.")}`);
                    }
                })
                .catch(error => {
                    console.log(`[Startup] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.unstartup)
        .description("Check and Unconfig startup script.")
        .action(() => {
            doctor(Commands.unstartup)
                .then(() => {
                    return unstartup();
                })
                .then(result => {
                    void (result);
                    console.log(`[Unstartup] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Unstartup] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.isstartuped)
        .description("Check whether startup script is configed.")
        .action(() => {
            doctor(Commands.isstartuped)
                .then(() => {
                    return isstartuped();
                })
                .then(result => {
                    if (result) {
                        // is startuped
                        console.log(`[IsStartuped] ${colorSuccess("YES.")}`);
                    } else {
                        // is startuped
                        console.log(`[IsStartuped] ${colorSuccess("NO.")}`);
                    }
                })
                .catch(error => {
                    console.log(`[Isstartuped] ${colorError(error.toString())}`);
                });
        });

    // program
    //     .command(Commands.list)
    //     .description("")
    //     .action(() => {
    //         doctor(Commands.list)
    //             .then(() => {
    //                 return list();
    //             })
    //             .then(result => {
    //                 console.log("[List]\n" + result);
    //             })
    //             .catch(error => {
    //                 console.log(`[Monit] ${colorError(error.toString())}`);
    //             });
    //     });

    // program
    //     .command(Commands.monit)
    //     .description("")
    //     .action(() => {
    //         doctor(Commands.monit)
    //             .then(() => {
    //                 return monit();
    //             })
    //             .catch(error => {
    //                 console.log(`[Monit] ${colorError(error.toString())}`);
    //             });
    //     });
};
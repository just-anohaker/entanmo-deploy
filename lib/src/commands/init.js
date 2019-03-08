"use strict";

const program = require("commander");

const {
    doctor,
    install,
    uninstall,
    isinstalled,
    toolinstall,
    tooluninstall,
    toolisinstalled
} = require("../lib/modules/init");
const { colorError, colorSuccess } = require("../lib/utils/colorful");
const Commands = require("../lib/commands");

module.exports = () => {
    program
        .command(Commands.install)
        .description("Check and Install Node and PM2.")
        .action(() => {
            doctor(Commands.install)
                .then(() => {
                    return install();
                })
                .then(() => {
                    return toolinstall();
                })
                .then(result => {
                    void (result);
                    console.log(`[Install] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Install] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.uninstall)
        .description("Check and Uninstall Node and PM2.")
        .action(() => {
            doctor(Commands.uninstall)
                .then(() => {
                    return uninstall();
                })
                .then(() => {
                    return tooluninstall();
                })
                .then(result => {
                    void (result);
                    console.log(`[Uninstall] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Uninstall] ${colorError(error.toString())}`);
                });
        });

    program
        .command(Commands.isinstalled)
        .description("Check whether Node and PM2 is installed.")
        .action(() => {
            doctor(Commands.isinstalled)
                .then(() => {
                    return isinstalled();
                })
                .then(result => {
                    if (!result) {
                        return false;
                    }
                    return toolisinstalled();
                })
                .then(result => {
                    console.log(`[IsInstalled] ${result
                        ? colorSuccess("OK.")
                        : colorSuccess("NO.")}`);
                })
                .catch(error => {
                    console.log(`[IsInstalled] ${colorError(error.toString())}`);
                });
        });
};
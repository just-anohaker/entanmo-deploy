"use strict";

const program = require("commander");
const si = require("systeminformation");

const Commands = require("../lib/commands");
const { colorError, colorSuccess } = require("../lib/utils/colorful");
const { doctorNode, doctorPM2 } = require("../lib/utils/env");

module.exports = () => {
    program
        .command(Commands.doctor)
        .description("Doctor SystemInformation and Check Node and PM2 installable.")
        .action(() => {
            (async () => {
                const doctorInfo = [];
                const osinfo = await si.osInfo();
                doctorInfo.push(`Distro: ${osinfo.distro}`);
                if (osinfo.codename) {
                    doctorInfo.push(`Codename: ${osinfo.codename}`);
                }
                doctorInfo.push(`Release: ${osinfo.release}`);
                doctorInfo.push(`Arch: ${osinfo.arch}`);
                doctorInfo.push(`Kernel: ${osinfo.kernel}`);

                let isNodeInstalled = false;
                try {
                    await doctorNode();
                    isNodeInstalled = true;
                } catch (error) {
                    void (error);
                    // TODO: node is uninstalled.
                }
                doctorInfo.push(`Node: ${isNodeInstalled ? colorSuccess("Installed") : colorError("Uninstalled")}`);

                let isPM2Installed = false;
                try {
                    await doctorPM2();
                    isPM2Installed = true;
                } catch (error) {
                    void (error);
                    // TODO: pm2 is uninstalled
                }
                doctorInfo.push(`PM2: ${isPM2Installed ? colorSuccess("Installed") : colorError("Uninstalled")}`);

                console.log("[Doctor]\n" + doctorInfo.join("\n"));
            })()
                .catch(error => {
                    console.log(`[Doctor] ${colorError(error.toString())}`);
                });
        });
};
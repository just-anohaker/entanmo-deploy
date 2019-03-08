"use strict";

const program = require("commander");

const Commands = require("../lib/commands");
const {
    doctor: initdoctor,
    install,
    isinstalled,
    toolinstall,
    toolisinstalled
} = require("../lib/modules/init");
const {
    doctor: deploydoctor,
    deploy,
    isdeployed,
    startup,
    isstartuped,
} = require("../lib/modules/deploy");
const { isStartupPending, getPending } = require("../lib/utils/pm2");
const { colorError, colorSuccess, colorWarning } = require("../lib/utils/colorful");

module.exports = () => {
    program
        .command(Commands.run)
        .option("-A, --autostart", "Auto start when system started.")
        .description("Auto deploy EnTanMo node with startup feature.")
        .action(cmd => {
            (async () => {
                // step1: install 
                console.log(`[Run] Check node ...`);
                await initdoctor(Commands.isinstalled);
                const _isinstalled = await isinstalled();
                if (!_isinstalled) {
                    console.log(`[Run] Node is uninstalled, installing ...`);
                    await initdoctor(Commands.install);
                    await install();
                }
                console.log(`[Run] Node ${colorSuccess("OK.")}`);
                console.log(`[Run] Check pm2 ...`);
                await initdoctor(Commands.isinstalled);
                const _istoolinstalled = await toolisinstalled();
                if (!_istoolinstalled) {
                    console.log(`[Run] PM2 is uninstalled, installing ...`);
                    await initdoctor(Commands.install);
                    await toolinstall();
                }
                console.log(`[Run] PM2 ${colorSuccess("OK.")}`);

                // step2: deploy
                console.log(`[Run] Check deploy ...`);
                await deploydoctor(Commands.isdeployed);
                const _isdeployed = await isdeployed();
                if (!_isdeployed) {
                    console.log(`[Run] Undeployed, deploying ...`);
                    await deploy();
                }
                console.log(`[Run] Deploy ${colorSuccess("OK.")}`);
                // step3: startup
                if (cmd.autostart) {
                    console.log(`[Run] config autostart, Check startup script ...`);
                    await deploydoctor(Commands.isstartuped);
                    const _isstartuped = await isstartuped();
                    if (!_isstartuped) {
                        console.log(`[Run] Unstartup, config startup script ...`);
                        await startup();
                    } else {
                        if (await isStartupPending()) {
                            console.log("[Run] To setup the Startup Script, copy/paste the following command once:\n"
                                + colorWarning(await getPending()));
                        }
                    }
                    console.log(`[Run] Startup ${colorSuccess("OK.")}`);
                }
            })()
                .then(result => {
                    void (result);
                    console.log(`[Run] ${colorSuccess("OK.")}`);
                })
                .catch(error => {
                    console.log(`[Run] ${colorError(error.toString())}`);
                });
        });
};
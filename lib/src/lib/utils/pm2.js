"use strict";

const path = require("path");
const fs = require("fs");

const shelljs = require("shelljs");

const { conf, Keys, Values } = require("./conf");
const { colorWarning } = require("./colorful");
let { rootDir, projDir, doctorShell } = require("./env");

const _DEBUG = () => {
    const path = require("path");
    projDir = path.resolve(rootDir, "../");
};
void (_DEBUG);
// _DEBUG();

const app = `${projDir}/app.js`;
const appName = "entanmo";
const deploy_command = `pm2 start ${app} -n ${appName} -- --base ${projDir}`;

///////////////////////////////////////////////////////////////////////////////
// for windows
const WINREG_REG_KEY = "ENTANMO";
const WINREG_REG_VALUE = path.resolve(path.join(rootDir, "startup.cmd"));
///////////////////////////////////////////////////////////////////////////////

const isDeployed = async () => {
    try {
        const deploy = await doctorShell(`pm2 id ${appName}`);
        const ids = JSON.parse(deploy);
        if (Array.isArray(ids) && ids.length <= 0) {
            return false;
        }

        return true;
    } catch (error) {
        throw new Error(error.toString());
    }
};

const deploy = async () => {
    return new Promise((resolve, reject) => {
        shelljs.exec(deploy_command, { silent: true }, (code, stdout, stderr) => {
            void (stdout);
            if (code === 0) {
                return resolve(true);
            }

            return reject(new Error(stderr.toString()));
        });
    });
};

const undeploy = async () => {
    return new Promise((resolve, reject) => {
        shelljs.exec(`pm2 stop ${appName}`, { silent: true }, (code, stdout, stderr) => {
            void (stdout);
            if (code !== 0) {
                return reject(new Error(stderr.toString()));
            }

            shelljs.exec(`pm2 delete ${appName}`, { silent: true }, (code, stdout, stderr) => {
                void (stdout);
                if (code === 0) {
                    return resolve(true);
                }

                return reject(new Error(stderr.toString()));
            });
        });
    });
};

const _winreg = () => {
    const Registry = require("winreg");
    const RUN_LOCATION = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    const winregInst = new Registry({
        hive: Registry.HKCU,
        key: RUN_LOCATION
    });
    return { inst: winregInst, Registry };
};


const _winreg_issetted = async () => {
    return new Promise((resolve, reject) => {
        const { inst } = _winreg();
        inst.valueExists(WINREG_REG_KEY, (err, result) => {
            if (err) {
                return reject(new Error(err.toString()));
            }

            return resolve(result);
        });
    });
};

const _winreg_set = async () => {
    return new Promise((resolve, reject) => {
        const { inst, Registry } = _winreg();
        inst.set(WINREG_REG_KEY, Registry.REG_SZ, WINREG_REG_VALUE, err => {
            if (err) {
                return reject(new Error(err.toString()));
            }
            return resolve(true);
        });
    });
};

const _winreg_unset = async () => {
    if (!(await _winreg_issetted())) {
        return true;
    }
    return new Promise((resolve, reject) => {
        const { inst } = _winreg();
        inst.remove(WINREG_REG_KEY, err => {
            if (err) {
                return reject(new Error(err.toString()));
            }

            return resolve(true);
        });
    });
};

const _prepare_startup_cmd = () => {
    const cwd = path.resolve(rootDir, "../");
    const scripts = [
        `cmd /K`,
        `"cd ${cwd}`,
        "&&",
        deploy_command,
        "&&",
        `pm2 logs ${appName}"`,
    ];
    const cmd = scripts.join(" ");

    fs.writeFileSync(WINREG_REG_VALUE, cmd);
    if (fs.existsSync(WINREG_REG_VALUE)) {
        return true;
    }
    return false;
};

const _startup_win32 = async () => {
    if (!_prepare_startup_cmd()) {
        throw Error(`Prepare startup script failure, maybe use administrator.`);
    }

    try {
        if (await _winreg_issetted()) {
            await _winreg_unset();
        }

        await _winreg_set();
        conf.set(Keys.startuped, Values.startuped);
        return true;
    } catch (error) {
        throw new Error(error.toString());
    }
};

const _startup_linux = async () => {
    return new Promise((resolve, reject) => {
        shelljs.exec("pm2 save", { silent: true }, (code, stdout, stderr) => {
            void (stdout);
            if (code !== 0) {
                conf.set(Keys.startuped, Values.unstartuped);
                return reject(new Error(stderr.toString()));
            }

            shelljs.exec("pm2 startup", { silent: true }, (code, stdout, stderr) => {
                if (code === 0) {
                    conf.set(Keys.startuped, Values.startuped);
                    return resolve(true);
                } else if (code === 1) {
                    const stdoutArray = stdout.split(/[\r|\n|\r\n]/);
                    let extraCmd = stdoutArray.pop().trim();
                    extraCmd = extraCmd === "" ? stdoutArray.pop() : extraCmd;
                    console.log("[Startup] To setup the Startup Script, copy/paste the following command once:\n"
                        + colorWarning(extraCmd));
                    conf.set(Keys.startuped, Values.startupPending);
                    conf.set(Keys.startup_pending, extraCmd);
                    return resolve(true);
                } else {
                    conf.set(Keys.startuped, Values.unstartuped);
                    return reject(new Error(stderr.toString()));
                }
            });
        });
    });
};

const startup = async () => {
    if (process.platform === "win32") {
        return await _startup_win32();
    } else if (process.platform === "linux") {
        return await _startup_linux();
    } else if (process.platform === "darwin") {
        return await _startup_linux();
    } else {
        throw new Error(`Unsupported os[${process.platform}]`);
    }
};

const _unstartup_win32 = async () => {
    try {
        if (await _winreg_issetted()) {
            await _winreg_unset();
        }
        conf.set(Keys.startuped, Values.unstartuped);
        return true;
    } catch (error) {
        throw new Error(error.toString());
    }
};

const _unstartup_linux = async () => {
    return new Promise((resolve, reject) => {
        shelljs.exec("pm2 unstartup", { silent: true }, (code, stdout, stderr) => {
            if (code === 0) {
                conf.set(Keys.startuped, Values.startuped);
                return resolve(true);
            } else if (code === 1) {
                const stdoutArray = stdout.split(/[\r|\n|\r\n]/);
                let extraCmd = stdoutArray.pop().trim();
                extraCmd = extraCmd === "" ? stdoutArray.pop() : extraCmd;
                console.log("[Unstartup] To setup the Startup Script, copy/paste the following command once:\n"
                    + colorWarning(extraCmd));
                conf.set(Keys.startuped, Values.unstartupPending);
                conf.set(Keys.startup_pending, extraCmd);
                return resolve(true);
            } else {
                conf.set(Keys.startuped, Values.unstartuped);
                return reject(new Error(stderr.toString()));
            }
        });
    });
};

const unstartup = async () => {
    if (process.platform === "win32") {
        return await _unstartup_win32();
    } else if (process.platform === "linux") {
        return await _unstartup_linux();
    } else if (process.platform === "darwin") {
        return await _unstartup_linux();
    } else {
        throw new Error(`Unsupported os[${process.platform}]`);
    }
};

const isStartuped = async () => {
    const startuped = conf.get(Keys.startuped, Values.unstartuped);
    return (startuped !== Values.unstartuped && startuped !== Values.unstartupPending);
};

const isStartupPending = async () => {
    const startuped = conf.get(Keys.startuped, Values.unstartup);
    return startuped === Values.startupPending;
};

const isUnstartupPending = async () => {
    const startuped = conf.get(Keys.startuped, Values.unstartuped);
    return startuped === Values.unstartupPending;
};

const getPending = async () => {
    return conf.get(Keys.startup_pending, "");
};

module.exports = {
    deploy,
    undeploy,
    isDeployed,
    startup,
    unstartup,
    isStartuped,
    isStartupPending,
    isUnstartupPending,
    getPending
};
"use strict";

const path = require("path");
const fs = require("fs");

const shelljs = require("shelljs");

/// constants
const rootDir = path.resolve(path.dirname(process.execPath));
const projDir = path.resolve(rootDir, "../../../");

const appNodePath = async () => {
    if (process.platform === "win32") {
        return path.resolve(rootDir, "runner.exe");
    } else if (process.platform === "linux") {
        return path.resolve(rootDir, "runner");
    } else if (process.platform === "darwin") {
        return path.resolve(rootDir, "runner");
    } else {
        throw new Error(`Unsupported os[${process.platform}]`);
    }
};

const appPM2Path = async () => {
    if (process.platform === "win32") {
        // windows下使用自定义路径，后面代码有说明
        return path.resolve(rootDir, "pm2.cmd");
    } else if (process.platform === "linux") {
        return path.resolve(rootDir, "tools/node_modules/.bin/pm2");
    } else if (process.platform === "darwin") {
        return path.resolve(rootDir, "tools/node_modules/.bin/pm2");
    } else {
        throw new Error(`Unsupported os[${process.platform}]`);
    }
};

const osNodePath = async () => {
    if (process.platform === "win32") {
        const systemRoot = process.env["SystemRoot"];
        return path.resolve(path.join(systemRoot, "System32", "node.exe"));
    } else if (process.platform === "linux") {
        return "/usr/local/bin/node";
    } else if (process.platform === "darwin") {
        return "/usr/local/bin/node";
    } else {
        throw new Error(`Unsupported os[${process.platform}]`);
    }
};

const osPM2Path = async () => {
    if (process.platform === "win32") {
        const systemRoot = process.env["SystemRoot"];
        return path.resolve(path.join(systemRoot, "System32", "pm2.cmd"));
    } else if (process.platform === "linux") {
        return "/usr/local/bin/pm2";
    } else if (process.platform === "darwin") {
        return "/usr/local/bin/pm2";
    }
};

const lnNode = async () => {
    const srcNodePath = await appNodePath();
    const destNodePath = await osNodePath();
    return new Promise((resolve, reject) => {
        shelljs.rm("-f", destNodePath);
        const shellString = shelljs.ln("-sf", srcNodePath, destNodePath);
        if (shellString.code === 0) {
            return resolve(shellString.stdout);
        }

        return reject(new Error(shellString.stderr));
    });
};

const lnPM2 = async () => {
    const srcPM2Path = await appPM2Path();
    const destPM2Path = await osPM2Path();
    return new Promise((resolve, reject) => {
        shelljs.rm("-f", destPM2Path);
        if (process.platform === "win32") {
            // windows通过自定义全新cmd文件的方式来进行安装
            if (!fs.existsSync(srcPM2Path)) {
                const pm2_command_path = path.join(rootDir, "tools", "node_modules", "pm2", "bin", "pm2");
                const commands = [
                    "@ECHO OFF",
                    "@SETLOCAL",
                    "@SET PATHEXT=%PATHEXT:;.JS;=;%",
                    `node "${path.resolve(pm2_command_path)}" %*`
                ];
                fs.writeFileSync(srcPM2Path, commands.join("\r\n"));
                if (!fs.existsSync(srcPM2Path)) {
                    return reject(new Error("Create pm2 command failure."));
                }
            }
        }
        const shellString = shelljs.ln("-sf", srcPM2Path, destPM2Path);
        if (shellString.code === 0) {
            return resolve(shellString.stdout);
        }
        return reject(new Error(shellString.stderr));
    });
};

const unlnNode = async () => {
    const destNodePath = await osNodePath();
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(destNodePath);
            return resolve(true);
        } catch (error) {
            return reject(new Error(error.toString()));
        }
    });
};

const unlnPM2 = async () => {
    const destPM2Path = await osPM2Path();
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(destPM2Path);
            return resolve(true);
        } catch (error) {
            return reject(new Error(error.toString()));
        }
    });
};

const doctorShell = async cmd => {
    return new Promise((resolve, reject) => {
        shelljs.exec(cmd, { silent: true }, (code, stdout, stderr) => {
            if (code === 0) {
                return resolve(stdout.toString());
            }

            return reject(new Error(stderr.toString()));
        });
    });
};

const doctorNode = async () => {
    try {
        return await doctorShell("node -v");
    } catch (error) {
        throw error;
    }
};

const doctorPM2 = async () => {
    try {
        return await doctorShell("pm2 -v");
    } catch (error) {
        throw error;
    }
};

module.exports = {
    rootDir,
    projDir,
    appNodePath,
    appPM2Path,
    osNodePath,
    osPM2Path,
    lnNode,
    unlnNode,
    lnPM2,
    unlnPM2,
    doctorShell,
    doctorNode,
    doctorPM2
};
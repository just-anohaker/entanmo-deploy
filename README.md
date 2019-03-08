# 自动化部署与重启方案

## 概述

为了解决EnTanMo节点程序的快速部署，通过分析与预研，总结出可以通过内置node、pm2程序以及程序依赖来提升部署体验以及减少用户部署节点程序时配置环境的烦扰。

1、内置Node程序 — 在用户操作系统没有安装node程序的情况下，内置node可以免除用户安装node的过程

2、内置PM2程序 — 在用户操作系统没有安装PM2进程管理程序的情况下，内置PM2可以免除用户安装PM2的过程

3、内容程序运行依赖(node_modules) — 可以免除用户安装依赖过程，特别是EnTanMo节点程序安装依赖会涉及Native编译[windows需要借助visual studio IDE开发套件，类Unix需要安装烦锁的gcc，g++及相关系统库]

## 技术点

1、shelljs — 用于跨平台操作终端(控制台)

2、commander — 用于终端用户交互支持库

3、chalk — 用于终端字符颜色显示方案

4、conf — 用于数据本地化缓存的库

2、winreg — windows平台特有的库，用于支持操作windows注册表信息

## 命令

### 环境检测

— [*Unix]

```shell
./deploy doctor
```

— [Win]

```powershell
deploy.cmd doctor 
```

— 检测当前操作系统信息以及node和PM2的安装情况

### 运行

— [*Unix]

```shell
./deploy run [-A|--autostart] # -A|--autostart 选项用于设置是否开机自启动
```

— [Win]

```powershell
./deploy run [-A|--autostart] # -A|--autostart 选项用于设置是否开机自启动
```

— 一个命令实现[安装],[部署],[开机自启动]

### 安装

— [*Unix]

```shell
./deploy install
```

— [Win] deploy.cmd install

```powershell
deploy.cmd install
```

— 检测当前操作系统中node以及pm2是否可运行，并按需安装

### 卸载

— [*Unix]

```shell
./deploy uninstall
```

— [Win]

```powershell
deploy.cmd uninstall
```

— 注销节点程序安装的node以及pm2程序，操作系统装了，则不会卸载操作系统安装的对应的程序

### 查询安装

— [*Unix]

```shell
 ./deploy isinstalled
```

— [Win]

```powershell
deploy.cmd isinstalled
```

— 检测当前操作系统中node以及pm2是否可用

### 部署

— [*Unix]

```shell
./deploy deploy
```

— [Win]

```powershell
deploy.cmd deploy
```

— 通过pm2部署EnTanMo节点程序

### 取消部署

— [*Unix]

```shell
./deploy undeploy
```

— [Win]

```powershell
deploy.cmd undeploy
```

— 停止并删除之前部署的EnTanMo程序

### 查询是否已部署

— [*Unix]

```shell
./deploy isdeployed
```

— [Win]

```powershell
deploy.cmd isdeployed
```

— 检测查询EnTanMo程序是否已部署

### 开机启动

— [*Unix]

```shell
./deploy startup
```

— [Win]

```powershell
deploy.cmd startup
```

— 设置开机启动后部署EnTanMo程序

### 取消开机启动

— [*Unix]

```shell
./deploy unstartup
```

— [Win]

```powershell
deploy.cmd unstartup
```

— 设置取消开机启动后部署EnTanMo程序

### 查询是否已设置开机启动

— [*Unix]

```shell
./deploy isstartuped
```

— [Win]

```powershell
deploy.cmd isstartuped
```

— 查询是否设置过开机启动后部署EnTanMo程序

### 配置账号信息[*待实现*]

— [*Unix]

```shell
./deploy account
```

— [Win]

```powershell
deploy.cmd account
```

— 配置当前节点的mint secret

### 配置网络[*待实现*]

— [*Unix]

```shell
./deploy network
```

— [Win]

```powershell
deploy.cmd network
```

— 配置当前节点的网络信息

### 查询节点当前配置信息[*待实现*]

— [*Unix]

```shell
./deploy config
```

— [Win]

```powershell
deploy.cmd config
```

— 查看当前节点的配置信息

## 实现

### 名词说明：

— "未安装"： 表示操作系统当前不支持node或是pm2

— "预装"：表示操作系统当前已支持node或是pm2

— "自定义安装"：表示操作系统当前不支持node或是pm2，通过EnTanMo安装了内置的node或是pm2

项目相关路径定义

```javascript
/// constants
const rootDir = path.resolve(path.dirname(process.execPath));
const projDir = path.resolve(rootDir, "../../../");
```

"自定义安装"node相关路径

```javascript
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
```

"自定义安装"pm2相关路径

```javascript
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
```

封装的shell命令执行

```javascript
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
```

### 环境

通过shelljs执行"node -v"以及"pm2 -v"来确认系统是否支持node以及pm2

#### 安装

```javascript
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
```

```javascript
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
```

#### 卸载

```javascript
const unlnNode = async () => {
    const destNodePath = await osNodePath();
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(destNodePath);
            return resolve();
        } catch (error) {
            return reject(new Error(error.toString()));
        }
    });
};
```

```javascript
const unlnPM2 = async () => {
    const destPM2Path = await osPM2Path();
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(destPM2Path);
            return resolve();
        } catch (error) {
            return reject(new Error(error.toString()));
        }
    });
};
```

#### 查询

```javascript
const doctorNode = async () => {
    try {
        return await doctorShell("node -v");
    } catch (error) {
        throw error;
    }
};
```

```javascript
const doctorPM2 = async () => {
    try {
        return await doctorShell("pm2 -v");
    } catch (error) {
        throw error;
    }
};
```

### 部署与重启

#### 相关常量定义

```javascript
const app = `${projDir}/app.js`;
const appName = "entanmo";
const deploy_command = `pm2 start ${app} -n ${appName} -- --base ${projDir}`;

///////////////////////////////////////////////////////////////////////////////
// for windows
const WINREG_REG_KEY = "ENTANMO";
const WINREG_REG_VALUE = path.resolve(path.join(rootDir, "startup.cmd"));
///////////////////////////////////////////////////////////////////////////////
```

#### 部署

```javascript
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
```

#### 取消部署

```javascript
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
```

#### 查询已部署

```javascript
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
```

#### 开机启动

```javascript
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
                if (code !== 0) {
                    conf.set(Keys.startuped, Values.unstartuped);
                    return reject(new Error(stderr.toString()));
                }

                conf.set(Keys.startuped, Values.startuped);
                return resolve(stdout);
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
```

#### 取消开机启动

```javascript
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
                conf.set(Keys.startuped, Values.unstartuped);
                return resolve(stdout);
            }

            return reject(new Error(stderr.toString()));
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
```

#### 查询开机启动是否开启

```javascript
const isStartuped = async () => {
    return conf.get(Keys.startuped, Values.unstartuped);
};
```

### 平台相关

#### windows

##### 开机自启动脚本

```javascript
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
```

##### 开机启动注册表相关操作

###### 注册表操作实例

```javascript
const _winreg = () => {
    const Registry = require("winreg");
    const RUN_LOCATION = "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    const winregInst = new Registry({
        hive: Registry.HKCU,
        key: RUN_LOCATION
    });
    return { inst: winregInst, Registry };
};
```

###### 注册表查询

```javascript
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
```

###### 注册表删除

```javascript
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
```

###### 注册表设置

```javascript
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
```
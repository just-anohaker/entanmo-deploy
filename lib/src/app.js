"use strict";

const path = require("path");
const fs = require("fs");

const program = require("commander");

const { colorError } = require("./lib/utils/colorful");

function main() {
    program.version("1.0.0");

    const commands = fs.readdirSync(path.resolve(__dirname, "commands"));
    commands.forEach(el => {
        if (el.endsWith(".js")) {
            const Command = "./" + path.join("commands", el);
            require(Command)();
        }
    });

    program
        .command("*")
        .action(() => {
            console.log(colorError("Unsupported command."));
        });

    program.parse(process.argv);
}

main();
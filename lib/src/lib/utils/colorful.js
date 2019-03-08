"use strict";

const chalk = require("chalk");

/// chalk level assigned to 3
chalk.Level = 3;

const colorSuccess = (message) => {
    return chalk.green.bold(message);
};

const colorWarning = (message) => {
    return chalk.keyword("orange").bold(message);
};

const colorError = (message) => {
    return chalk.red.bold(message);
};

module.exports = {
    colorSuccess,
    colorWarning,
    colorError
};
"use strict";

setImmediate(function tick() {
    console.log("tick");

    setTimeout(tick, 10 * 1000);
});
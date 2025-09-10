const EventEmitter = require("events");
const subscribeEmitter = new EventEmitter();
const subscribeListenersStorage = new Map();

exports.subscribeEmitter = subscribeEmitter;
exports.subscribeListenersStorage = subscribeListenersStorage;
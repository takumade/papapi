"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionId = exports.objectHasKeys = void 0;
const crypto_1 = __importDefault(require("crypto"));
const objectHasKeys = (keys, object) => {
    let objectKeys = Object.keys(object);
    let status = true;
    keys.map(k => {
        if (!objectKeys.includes(k)) {
            status = false;
        }
    });
    return status;
};
exports.objectHasKeys = objectHasKeys;
const generateTransactionId = () => {
    return "TRX-" + new Date().getTime() + "-" + crypto_1.default.randomBytes(8).toString('hex');
};
exports.generateTransactionId = generateTransactionId;

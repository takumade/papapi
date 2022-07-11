"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = __importDefault(require("./users/users.service"));
const paynow_service_1 = __importDefault(require("./paynow/paynow.service"));
const paypal_service_1 = __importDefault(require("./paypal/paypal.service"));
const stripe_service_1 = __importDefault(require("./stripe/stripe.service"));
// Don't remove this comment. It's needed to format import lines nicely.
function default_1(app) {
    app.configure(users_service_1.default);
    app.configure(paynow_service_1.default);
    app.configure(paypal_service_1.default);
    app.configure(stripe_service_1.default);
}
exports.default = default_1;

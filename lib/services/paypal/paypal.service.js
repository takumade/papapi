"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paypal_class_1 = require("./paypal.class");
const paypal_model_1 = __importDefault(require("../../models/paypal.model"));
const paypal_hooks_1 = __importDefault(require("./paypal.hooks"));
function default_1(app) {
    const options = {
        Model: (0, paypal_model_1.default)(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/paypal', new paypal_class_1.Paypal(options, app));
    app.use('/paypal-success', new paypal_class_1.PaypalSuccess(options, app));
    app.use('/paypal-cancel', new paypal_class_1.PaypalCancel(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('paypal');
    service.hooks(paypal_hooks_1.default);
}
exports.default = default_1;

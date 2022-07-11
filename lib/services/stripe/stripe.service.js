"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_class_1 = require("./stripe.class");
const stripe_model_1 = __importDefault(require("../../models/stripe.model"));
const stripe_hooks_1 = __importDefault(require("./stripe.hooks"));
function default_1(app) {
    const options = {
        Model: (0, stripe_model_1.default)(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/stripe', new stripe_class_1.Stripe(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('stripe');
    service.hooks(stripe_hooks_1.default);
}
exports.default = default_1;

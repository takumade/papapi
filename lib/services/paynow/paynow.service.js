"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paynow_class_1 = require("./paynow.class");
const paynow_model_1 = __importDefault(require("../../models/paynow.model"));
const paynow_hooks_1 = __importDefault(require("./paynow.hooks"));
function default_1(app) {
    const options = {
        Model: (0, paynow_model_1.default)(app),
        paginate: app.get('paginate')
    };
    // Initialize our service with any options it requires
    app.use('/paynow', new paynow_class_1.Paynow(options, app));
    app.use('/paynow/status-update', new paynow_class_1.PaynowStatus(options, app));
    // Get our initialized service so that we can register hooks
    const service = app.service('paynow');
    service.hooks(paynow_hooks_1.default);
}
exports.default = default_1;

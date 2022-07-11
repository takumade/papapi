"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const feathers_1 = __importDefault(require("@feathersjs/feathers"));
const configuration_1 = __importDefault(require("@feathersjs/configuration"));
const express_1 = __importDefault(require("@feathersjs/express"));
const socketio_1 = __importDefault(require("@feathersjs/socketio"));
const logger_1 = __importDefault(require("./logger"));
const middleware_1 = __importDefault(require("./middleware"));
const services_1 = __importDefault(require("./services"));
const app_hooks_1 = __importDefault(require("./app.hooks"));
const channels_1 = __importDefault(require("./channels"));
const authentication_1 = __importDefault(require("./authentication"));
const sequelize_1 = __importDefault(require("./sequelize"));
// Don't remove this comment. It's needed to format import lines nicely.
const app = (0, express_1.default)((0, feathers_1.default)());
// Load app configuration
app.configure((0, configuration_1.default)());
// Enable security, CORS, compression, favicon and body parsing
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, serve_favicon_1.default)(path_1.default.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express_1.default.static(app.get('public')));
// Set up Plugins and providers
app.configure(express_1.default.rest());
app.configure((0, socketio_1.default)());
app.configure(sequelize_1.default);
// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware_1.default);
app.configure(authentication_1.default);
// Set up our services (see `services/index.ts`)
app.configure(services_1.default);
// Set up event channels (see channels.ts)
app.configure(channels_1.default);
// Configure a middleware for 404s and the error handler
app.use(express_1.default.notFound());
app.use(express_1.default.errorHandler({ logger: logger_1.default }));
app.hooks(app_hooks_1.default);
exports.default = app;

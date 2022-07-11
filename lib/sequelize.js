"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(app) {
    const connectionString = app.get('mysql');
    const sequelize = new sequelize_1.Sequelize(connectionString, {
        dialect: 'mysql',
        logging: true,
        // sync: { force: true },
        define: {
            freezeTableName: true
        }
    });
    const oldSetup = app.setup;
    app.set('sequelizeClient', sequelize);
    app.setup = function (...args) {
        const result = oldSetup.apply(this, args);
        // Set up data relationships
        const models = sequelize.models;
        Object.keys(models).forEach(name => {
            if ('associate' in models[name]) {
                models[name].associate(models);
            }
        });
        // Sync to the database
        app.set('sequelizeSync', sequelize.sync());
        return result;
    };
}
exports.default = default_1;

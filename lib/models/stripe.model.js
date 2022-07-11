"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const stripe = sequelizeClient.define('stripe', {
        text: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stripe.associate = function (models) {
        // Define associations here
        // See https://sequelize.org/master/manual/assocs.html
    };
    return stripe;
}
exports.default = default_1;

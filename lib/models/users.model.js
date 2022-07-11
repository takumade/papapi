"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const users = sequelizeClient.define('users', {
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    users.associate = function (models) {
        // Define associations here
        // See https://sequelize.org/master/manual/assocs.html
    };
    return users;
}
exports.default = default_1;

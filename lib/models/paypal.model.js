"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const paypal = sequelizeClient.define('paypal', {
        origin: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        transactionId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        paymentId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        invoice: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        currency: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        method: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        items: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        amount: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false
        },
        paypalUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        status: {
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
    paypal.associate = function (models) {
        // Define associations here
        // See https://sequelize.org/master/manual/assocs.html
    };
    return paypal;
}
exports.default = default_1;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const sequelize_1 = require("sequelize");
function default_1(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const paynow = sequelizeClient.define('paynow', {
        origin: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        transactionId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        invoice: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        paynowReference: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        instructions: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
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
        redirectUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        resultUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        linkUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        pollUrl: {
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
    paynow.associate = function (models) {
        // Define associations here
        // See https://sequelize.org/master/manual/assocs.html
    };
    return paynow;
}
exports.default = default_1;

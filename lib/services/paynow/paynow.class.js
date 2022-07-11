"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaynowStatus = exports.Paynow = void 0;
const feathers_sequelize_1 = require("feathers-sequelize");
const utils_1 = require("../../utils/utils");
const { Paynow: PaynowService } = require("paynow");
class Paynow extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        this.app = app;
        // Init Paynow 
        this.paynowSettings = this.app.get('paynow');
        this.paynow = new PaynowService(this.paynowSettings.integrationId, this.paynowSettings.integrationKey);
        this.paynow.resultUrl = this.paynowSettings.resultUrl;
        this.paynow.returnUrl = this.paynowSettings.returnUrl;
        this.paynow.email = this.paynowSettings.email;
    }
    async find(params) {
        return [];
    }
    async update(id, data, params) {
    }
    async create(data, params) {
        console.log("Data: ", data);
        let checkKeys = [
            'email',
            'phone',
            'items'
        ];
        let totalAmount = 0;
        // If a user supplies a custom return url set that one up 
        if (data.returnUrl) {
            this.paynow.returnUrl = data.returnUrl;
        }
        // Check if the proper data is supplied
        if (!(0, utils_1.objectHasKeys)(checkKeys, data)) {
            return {
                status: "error",
                message: "Please supply these items: " + checkKeys.join(", ")
            };
        }
        let transactionId = (0, utils_1.generateTransactionId)();
        let invoiceId = "Invoice " + new Date().getTime();
        this.payment = this.paynow.createPayment(invoiceId, data.email);
        // Add items if supplied
        if (data.items.length > 0) {
            data.items.map((item) => {
                this.payment.add(item.name, item.price);
                totalAmount += item.price;
            });
        }
        else {
            return {
                status: "error",
                message: "Items should not be empty"
            };
        }
        let paymentMethod = data.phone.startsWith("071") ? "onemoney" :
            data.phone.startsWith("073") ? "telecash" : "ecocash";
        try {
            let response = await this.paynow.sendMobile(this.payment, data.phone, paymentMethod);
            console.log("Reasponse: ", response);
            if (response.success) {
                let instructions = response.instructions;
                let pollUrl = response.pollUrl;
                let status = await this.paynow.pollTransaction(pollUrl);
                console.log("Status: ", status);
                let newPaynowPayment = {
                    email: data.email,
                    phone: data === null || data === void 0 ? void 0 : data.phone,
                    items: JSON.stringify(data.items),
                    resultUrl: this.paynow.resultUrl,
                    invoice: status.reference,
                    paynowReference: status.paynowReference,
                    method: paymentMethod,
                    transactionId: transactionId,
                    instructions: instructions,
                    amount: totalAmount,
                    pollUrl: pollUrl,
                    status: status.status
                };
                console.log("Paynow Payment: ", newPaynowPayment);
                return super.create(newPaynowPayment);
            }
            else {
                console.log(response.error);
                return {
                    status: "error",
                    message: "Response Error",
                    error: response.error
                };
            }
        }
        catch (error) {
            console.log(error);
            return {
                status: "error",
                message: "There is some error somewhere",
                error: error
            };
        }
    }
}
exports.Paynow = Paynow;
class PaynowStatus extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        this.app = app;
    }
    async create(data, params) {
        if ((0, utils_1.objectHasKeys)(['reference', 'paynowreference', 'pollurl'], data)) {
            try {
                console.log("Paynow Data: ", data);
                const sequelize = this.app.get('sequelizeClient');
                const { paynow } = sequelize.models;
                console.log("models: ", sequelize.models);
                let transaction = await paynow.findOne({
                    where: {
                        paynowReference: data.paynowreference,
                        invoice: data.reference
                    }
                });
                console.log("Transaction: ", transaction);
                if (transaction) {
                    let id = transaction.id;
                    let response = await paynow.update({
                        status: data.status
                    }, {
                        where: {
                            id: id
                        }
                    });
                    let updatedData = await paynow.findByPk(id);
                    return {
                        'status': 'success',
                        'message': 'Status updated successfully',
                        data: updatedData
                    };
                }
            }
            catch (error) {
                return {
                    'status': 'error',
                    'message': 'The status wasnt updated successfully',
                    error: error
                };
            }
        }
    }
}
exports.PaynowStatus = PaynowStatus;

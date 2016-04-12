var _ = require('underscore');
var EntityBase = require('./EntityBase');

var PayIn = EntityBase.extend({
    defaults: {
        CreditedWalletId: null,
        /**
         * PaymentType (CARD, BANK_WIRE, AUTOMATIC_DEBIT, DIRECT_DEBIT)
         */
        PaymentType: null,
        /**
         * One of PayInPaymentDetails implementations, depending on PaymentType
         */
        PaymentDetails: null,
        /**
         * PaymentType (WEB, TOKEN, DIRECT, PREAUTHORIZED, RECURRING_ORDER_EXECUTION)
         */
        ExecutionType: null,
        /**
         * One of PayInExecutionDetails implementations, depending on ExecutionType
         */
        ExecutionDetails: null
    },

    getReadOnlyProperties: function() {
        var properties = EntityBse.prototype.getReadOnlyProperties();
        properties.push('PaymentType', 'ExecutionType');
        return properties;
    }
});

module.exports = PayIn;
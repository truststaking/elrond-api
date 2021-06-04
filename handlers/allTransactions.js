const { response, getAddressTransactions, getEpoch } = require('./helpers');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
    try {
        let query = queryStringParameters || {};
        let { fields } = query || {};
        const keys = [
            'address',
            'receiver',
            'sender',
            'before',
            'ord'
        ];
        let data = {reply:'No address provided'};
        if (!query.address) {
            return response({ status: 503, data});
        }
        Object.keys(query).forEach((key) => {
            if (!keys.includes(key)) {
                delete query[key];
            }
        });


        let status;
        if (query.before === undefined)
        {
          query.before = Math.floor(Date.now() / 1000);
        }
        data = await getAddressTransactions(query);
        if (data['count'] == -1)
        {
            return response({ data : ['Bad ordering value!']});
        }
        let transactions = {}
        data['transactions'].forEach(transaction => {
            let epoch = getEpoch(transaction.timestamp);
            if (!(epoch in transactions)) {
                transactions[epoch] = []
            }
            transactions[epoch].push(transaction);
        });
        return response({ status, data: transactions, fields });
    } catch (error) {
        console.error('transactions error', error);
        return response({ status: 503 });
    }
}

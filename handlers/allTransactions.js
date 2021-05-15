const { response, getAddressTransactions } = require('./helpers');


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

        Object.keys(query).forEach((key) => {
            if (!keys.includes(key)) {
                delete query[key];
            }
        });

        let data;
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
        return response({ status, data, fields });
    } catch (error) {
        console.error('transactions error', error);
        return response({ status: 503 });
    }
}

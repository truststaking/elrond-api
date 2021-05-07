const { response, getAddressHistory } = require('./helpers');


exports.handler = async ({ pathParameters, queryStringParameters }) => {
    try {
        let query = queryStringParameters || {};
        let { fields } = query || {};
        const keys = [
            'address',
        ];

        Object.keys(query).forEach((key) => {
            if (!keys.includes(key)) {
                delete query[key];
            }
        });

        let data;
        let status;
        data = await getAddressHistory(query.address);

        return response({ status, data, fields });
    } catch (error) {
        console.error('transactions error', error);
        return response({ status: 503 });
    }
}
const axios = require('axios');
const { axiosConfig } = require('./configs/config');

const {
  bech32: { decode },
  response,
} = require('./helpers');

const indexUrl = 'https://mex-indexer.elrond.com';
const weeks = 2;

exports.handler = async ({ pathParameters }) => {
  const { address } = pathParameters || {};

  try {
    decode(address);
  } catch (error) {
    return response({ status: 400 });
  }

  try {
    const query = {
      query: {
        match: { address },
      },
    };

    const data = [];

    for (let week = 1; week <= weeks; week++) {
      const snapshotUrl = `${indexUrl}/snapshot-week-${week}/_search`;
      const mexdUrl =
        week === 1 ? `${indexUrl}/mex-week-1-v2/_search` : `${indexUrl}/mex-week-${week}/_search`;

      let [
        {
          data: {
            hits: { hits: snapshots },
          },
        },
        {
          data: {
            hits: { hits: mex },
          },
        },
      ] = await Promise.all([
        axios.post(snapshotUrl, query, axiosConfig),
        axios.post(mexdUrl, query, axiosConfig),
      ]);

      snapshots = snapshots.map(({ _source }) => _source);
      mex = mex.map(({ _source }) => _source);

      let undelegates = false;

      if (week === 1) {
        const undelegatedUrl = `${indexUrl}/undelegated-week-1-v2/_search`;

        let {
          data: {
            hits: { hits: undelegatedHits },
          },
        } = await axios.post(undelegatedUrl, query, axiosConfig);

        undelegates = undelegatedHits.map(({ _source }) => _source);
      }

      // console.log('snapshots', JSON.stringify(snapshots));
      // console.log('undelegates', JSON.stringify(undelegates));
      // console.log('mex', JSON.stringify(mex));

      for (let day = 0; day < 7; day++) {
        const snapshot = snapshots.find(({ dayOfTheWeek }) => dayOfTheWeek === day);

        let element;

        if (snapshot) {
          element = snapshot;
        } else {
          element = {
            balance: '0',
            staked: '0',
            waiting: '0',
            unstaked: '0',
            unclaimed: '0',
            isMaiarEligible: false,
            dayOfTheWeek: `${day}`,
          };
        }

        if (undelegates) {
          const undelegated = undelegates.find(({ dayOfTheWeek }) => dayOfTheWeek === day);

          if (undelegated && undelegated.unstaked) {
            element.unstaked = (BigInt(element.unstaked) + BigInt(undelegated.unstaked)).toString();
          }
        }

        if (!data[week - 1]) {
          let mexAmount = '0';

          if (mex && mex[0] && mex[0].value) {
            mexAmount = mex[0].value;
          }

          data[week - 1] = {
            days: [],
            mex: mexAmount,
          };
        }

        // eslint-disable-next-line no-unused-vars
        const { address, dayOfTheWeek, ...rest } = element;
        data[week - 1].days.push(rest);
      }

      const sunday = data[week - 1].days[0];
      data[week - 1].days.shift();
      data[week - 1].days.push(sunday);
    }

    return response({ data });
  } catch (error) {
    console.error('mex error', error);
    return response({ status: 503 });
  }
};

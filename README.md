REST API facade facilitating the interactions with the Elrond blockchain.

## Quick start

1. Run `npm install` in the project directory
2. Optionally make edits to `config.js`
3. Make sure you create a `.env` file in project root and specify the config information

## .env Example content
```
CONFIG=mainnet/testnet/devnet
PrivateElastic=true/false
PrivateElasticUsername="username"
PrivateElasticPassword="password"
```
## Available Scripts

​
In the project directory, you can run:
​

### `npm run start`

​
Runs the app in the production mode.
Make requests to [http://localhost:3000](http://localhost:3000).

### `npm run start-dev`

​
Runs the app in the development mode.
Make requests to [http://localhost:3000](http://localhost:3000).
The app will reload if you make edits.
You will also see any lint errors in the console.
​

### `npm run test`

​
Launches the test runner in the interactive watch mode.

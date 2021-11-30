# hardhat-template-ts ([forked](https://github.com/sushiswap/hardhat-foundation))

[![Coverage Status](https://coveralls.io/repos/github/ShaunLWM/MentalAsylum/badge.svg?branch=master&t=Tl7NmY)](https://coveralls.io/github/ShaunLWM/MentalAsylum?branch=master)

## Instructions

1. `yarn`
2. `cp .env.example .env`
3. Set `FORKING` to true
4. Sign up for Alchemy ETH mainnet and enter your id
5. Run `yarn compile` whenever contracts are edited or added

---

## Env

```sh
cp .env.example .env
```

## Test

```sh
yarn test
```

```sh
yarn test test/Greeter.ts
```

## Coverage

```sh
yarn test:coverage
```

<https://hardhat.org/plugins/solidity-coverage.html#tasks>

## Gas

```sh
yarn test:gas
```

<https://github.com/cgewecke/hardhat-gas-reporter>

## Lint

```sh
yarn lint
```

## Watch

```sh
npx hardhat watch compile
```

## Deployment

### Local

Running the following command will start a local node and run the defined deploy script on the local node.

```sh
npx hardhat node
```

### Mainnet

```sh
yarn mainnet:deploy
```

```sh
yarn mainnet:verify
```

```sh
hardhat tenderly:verify --network mainnet ContractName=Address
```

```sh
hardhat tenderly:push --network mainnet ContractName=Address
```

### Ropsten

```sh
yarn ropsten:deploy
```

```sh
yarn ropsten:verify
```

```sh
hardhat tenderly:verify --network ropsten ContractName=Address
```
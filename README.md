# Super Unlockable NFTs

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts with balances.

> Recommended to use Node.js v14+ and npm v7+.

Try running some of the following tasks:

```shell
npm install

# starts local node
npx hardhat node

# compile contracts
npx hardhat compile

# deploy contract defined in tasks on specified network
npx hardhat deploy --network local

# deploy contract in scripts/deploy.js on specified network
npx hardhat run scripts/deploy.js --network local

# verify contract on etherscan
npx hardhat verify --network <DEPLOYED_NETWORK> <DEPLOYED_CONTRACT_ADDRESS> "Constructor arg1" "Constructor arg2"
# npx hardhat verify --network mumbai 0x18Ce4A4D16f1DDFe9dbcf900c49e0316DC47B115 "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f" "10000000000000000"

# unit tests
npx hardhat test

# remove all compiled and deployed artifacts
npx hardhat clean

# show help
npx hardhat help
```

### Client App

```shell
cd client

npm install

# start dev server
npm run dev
```

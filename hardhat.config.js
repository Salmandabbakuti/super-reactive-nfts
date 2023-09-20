require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

task("deploy", "Deploys Contract", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  // Constructor arguments: address of the token, required deposit to unlock minting
  const contract = await contractFactory.deploy(process.env.SUPPORTED_SUPER_TOKEN_ADDRESS, process.env.MINIMUM_REQUIRED_DEPOSIT);
  await contract.deployed();
  console.log("contract deployed at:", contract.address);
});

module.exports = {
  solidity: "0.8.16",
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 100000000
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
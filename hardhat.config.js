require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

task("deploy", "Deploys Contract", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  // Constructor arguments: address of the token, required deposit to unlock minting
  const contract = await contractFactory.deploy("0xd04383398dd2426297da660f9cca3d439af9ce1b", "10000000000000000"); // USDCx token on Base mainnet and minumum deposit of 0.01 USDCx
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
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
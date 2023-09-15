require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

task("deploy", "Deploys Contract", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  const contract = await contractFactory.deploy("0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f", "10000000000000000"); // fDAIx token on polygon 0.01 fDAIx deposit required
  await contract.deployed();
  console.log("contract deployed at:", contract.address);
});

module.exports = {
  solidity: "0.8.16",
  // defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

task("deploy", "Deploys Contract", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  const contract = await contractFactory.deploy("0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f", "10000000000000000"); // fDAIx token on polygon 0.01 fDAIx deposit required
  await contract.deployed();
  console.log("contract deployed at:", contract.address);
});

task("getFlowInfo", "Gets Flow Info from contract", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  const contract = await contractFactory.attach("0x6ca95894F9B925f879e8797BcC1490271Cc05CA8");
  const { lastUpdated, flowRate, deposit, owedDeposit } = await contract.getFlowInfo("0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f", "0x7348943C8d263ea253c0541656c36b88becD77B9", "0x7241DDDec3A6aF367882eAF9651b87E1C7549Dff");
  console.log("lastUpdated:", lastUpdated.toString());
  console.log("flowRate:", flowRate.toString());
  console.log("deposit:", deposit.toString());
  console.log("owedDeposit:", owedDeposit.toString());
  // convert deposit to token amount from wei to token
  const depositInToken = ethers.utils.formatUnits(deposit, 18);
  console.log("depositInToken:", depositInToken.toString());
});

task("mint", "Mints tokens to address", async () => {
  const contractFactory = await ethers.getContractFactory("SuperUnlockable");
  const contract = await contractFactory.attach("0x6ca95894F9B925f879e8797BcC1490271Cc05CA8");
  const tx = await contract.mintItem("0x7348943C8d263ea253c0541656c36b88becD77B9");
  console.log("tx:", tx);
  await tx.wait();
  console.log("Minted!");
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
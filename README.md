# Super Unlockable NFTs

Unleash your money-streaming powers with SuperUnlockable collection. You can showcase your financial prowess and level up your character in the world of decentralized gaming. As you meet the required streaming thresholds, you'll gain access to mint these exceptional in-game items. The key? Your item's attributes dynamically respond to your streaming activity. The more you stream, the mightier your in-game item becomes. Wanna Try it out? [SuperUnlockable Dapp](https://superunlockable-develop.vercel.app/)

> Note: To mint/unlock NFTs, you'll need to stream a minimum of 0.01 [`fDAIx`](https://mumbai.polygonscan.com/token/0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f) to the [SuperUnlockable Contract](https://mumbai.polygonscan.com/address/0x48A822ef187a82C3bd4c8218C9bE5DC7802d77c3) on [Polygon Mumbai](https://polygon.technology/). You can get `fDAIx` by depositing `fDAI` into your account and then wrapping it to `fDAIx` on the [Superfluid App](https://app.superfluid.finance/wrap).

#### Minting Your Super Powers

Once you've successfully streamed the required amount of fDAIx and minted your SuperUnlockable item, you'll unlock unique in-game powers and abilities. The key? Your item's attributes dynamically respond to your streaming activity. The longer and more consistently you stream, the more powerful your in-game item becomes.

#### Item Attributes

Your SuperUnlockable item attributes are determined by your streaming data:

**Power**: The amount of power you gain is based on the duration and consistency of your streaming activity. The longer and more the flowrate, the more powerful your in-game item becomes.

**Speed**: Your in-game item's speed in the game world is directly proportional to the amount of `fDAIx/second` you're streaming to the contract.

**Age**: The age of your in-game character reflects how long you've been actively streaming to the contract.

### Screenshots

#### Stream Widget

![Stream To Contract Widget](https://github.com/Salmandabbakuti/super-unlockable-nfts/assets/29351207/0d93fac6-f947-4125-8a43-2761faa43d19)

#### Items

![Items](https://github.com/Salmandabbakuti/super-unlockable-nfts/assets/29351207/ae24617a-d80f-4354-bd32-88a0365a1c87)

## Getting Started

You can try out the demo [here](https://superunlockable-develop.vercel.app/).

> Copy the `.env.example` file to `.env` and fill in the required environment variables.

1. Install required dependencies:

```bash
npm install
```

2. Compile Contracts:

```bash
npx hardhat compile
```

3. Deploy Contract:

```bash
npx hardhat deploy --network base
```

4. Start the client application:

> Copy the `client/.env.example` file to `client/.env` and fill in the required environment variables.
> Update `client/utils/constants.js` accordingly if you're using a different network/token or contract address than the default.

````bash

```bash
cd client

npm install

npm run dev
````

4. Navigate to http://localhost:3000/ in your browser to view the application. Start streaming to the contract to unlock the NFTs.

### Demo

## Credits & Resources:

- [Superfluid Wavepool ideas](https://superfluidhq.notion.site/Superfluid-Wave-Project-Ideas-7e8c792758004bd2ae452d1f9810cc58)
- [Superfluid Guides](https://docs.superfluid.finance/superfluid/resources/integration-guides)
- [Base Docs](https://docs.base.org/)
- [Hardhat](https://hardhat.org/getting-started/)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Next.js](https://nextjs.org/docs/getting-started)

## Safety

This is experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk.
I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

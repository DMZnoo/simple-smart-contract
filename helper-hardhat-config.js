const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676"
    }
};

const devChain = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    devChain,
    DECIMALS,
    INITIAL_ANSWER
}
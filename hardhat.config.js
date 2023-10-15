require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  "solidity": "0.8.19",
  "config": {
    "networks": {
      "chainName": {
        "chainId": 4,
        "url": "https://rinkeby.infura.io/v3/${INFURA_API_KEY}"
      }
    }
  }
};

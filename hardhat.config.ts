import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('hardhat-deploy');

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    gnosis: {
      url: process.env.GNOSIS_PROVIDER_URL,
      gasPrice: 1000000000,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    chiado: {
      url: process.env.CHIADO_PROVIDER_URL,
      gasPrice: 1000000000,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
};

export default config;

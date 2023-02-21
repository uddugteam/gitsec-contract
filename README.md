# GitSec platform smart-contract

## Table of Contents

- [Introduction](#Introduction)
- [Getting Started](#Getting-Started)
  - [Requirements](#Requirements)
  - [Installation](#Installation)
  - [Configuration](#Configuration)
  - [Deploying](#Deploying)
- [Usage](#Usage)
- [Testing](#Testing)
- [References](#References)
- [License](#License)

## Introduction

GitSec is a smart contract that enables secure and decentralized storage of Git repository
commit hashes on the Gnosis blockchain. By leveraging the security and immutability of the
Gnosis blockchain, GitSec ensures that the recorded hashes are tamper-proof and verifiable by
anyone. This provides a robust solution for ensuring the integrity and authenticity of Git
repository history, which is critical for applications that require secure version control.
With GitSec, users can trust that their Git repository history has not been altered or manipulated,
providing greater confidence and reliability for their software development projects.

## Getting Started

### Requirements

- Node.js v14+
- npm v6+
- Hardhat v2.5.5+
- Ethers.js v5.0.22+
- Truffle v5.2.24+
- Solidity v0.8.17+
- Gnosis network provider
- Wallet private key to deploy from

### Installation

- Clone the repository
- Run yarn install to install dependencies

### Configuration

Create a .env file in the project root directory and
add the following environment variables to the .env file:

- `GNOSIS_PROVIDER_URL`: URL of the Gnosis mainnet JSON-RPC endpoint you want to use (e.g. https://rpc.gnosis.gateway.fm)
- `CHIADO_PROVIDER_URL`: URL of the Gnosis Chiado JSON-RPC endpoint you want to use (e.g. https://rpc.chiado.gnosis.gateway.fm)
- `PRIVATE_KEY`: the private key of the Gnosis wallet that you will use to deploy the contracts

### Deploying

- Make sure that the `GNOSIS_PROVIDER_URL` and `CHIADO_PROVIDER_URL` in the .env file is set to the endpoint of your Ethereum node.
- Run `npx hardhat run scripts/deploy_gitsec.ts --network chiado` to deploy the `Gitsec` contract.
- Replace `chiado` with the desired network to deploy to.

## Usage

### Creating a Repository

To create a repository, call the `createRepository` function of the deployed smart contract
with the repository name and description as arguments:

```solidity
function createRepository(string memory name, string memory description) external returns (uint256)
```

This function will mint an NFT to the caller and add a new `Repository` struct to the `_repositories`
mapping. The ID of the new repository will be returned as the function output.

### Forking a Repository

To fork an existing repository, call the `forkRepository` function of the deployed smart contract with the repository
name, description, and the URL of the repository you want to fork as arguments:

```solidity
function forkRepository(string memory name, string memory description, string memory url) external returns (uint256)
```

This function will mint an NFT to the caller and add a new `Repository` struct to the `_repositories`
mapping. The `forkedFrom` field of the new repository struct will be set to the URL of the repository
you want to fork. The ID of the new repository will be returned as the function output.

### Setting/Updating IPFS Hash

To set or update the IPFS hash for a repository, call the `setIPFS` function of the deployed smart
contract with the repository ID and the new IPFS hash as arguments:

```solidity
function setIPFS(uint256 id, string memory newIPFS) external
```

This function will update the IPFS field of the corresponding `Repository` struct in the
`_repositories` mapping with the new IPFS hash. The `lastUpdate` field of the `Repository` struct will
also be updated to reflect the time of the update.

### Getting Repository Data

To get the data for a specific repository, call the `getRepository` function of the deployed smart contract
with the repository ID as an argument:

```solidity
function getRepository(uint256 id) external view returns (Repository memory)
```

This function will return a `Repository` struct with the data for the specified repository.

### Getting User Repositories

To get the list of repositories owned by a user, call the `getUserRepositories` function of the deployed
smart contract with the user's address as an argument:

```solidity
function getUserRepositories(address user) external view returns (Repository[] memory)
```

This function will return an array of `Repository` structs with the data for all repositories owned
by the specified user.

### Getting All Repositories

To get the list of all repositories, call the `getAllRepositories` function of the deployed smart contract:

```solidity
function getAllRepositories() external view returns (Repository[] memory)
```

This function will return an array of `Repository` structs with the data for all repositories.

## Testing

This project includes a suite of unit tests that can be used to verify the functionality of
the contracts. These tests can be run using the npx hardhat test command.

Before running the tests, make sure that you have the necessary dependencies installed by
running `yarn install` or `npm install`.

Once the dependencies are installed, you can run the tests using the `npx hardhat test` command.
This will run all of the tests and provide output on the console indicating which tests passed
and which failed.

If you want to run specific test file you can use `npx hardhat test <test_file_path>` command.

It is also possible to use the `npx hardhat coverage` command to generate a code coverage
report for the tests.

## References

This project makes use of the following external resources:

- The [OpenZeppelin](https://openzeppelin.com/) library for smart contract development and contract upgrades.
- The [hardhat](https://hardhat.org/) development environment for testing and deployment.
- The [ethers.js](https://docs.ethers.io/ethers.js/html/) library for interacting with the Ethereum network.
- The [ERC721A](https://www.erc721a.org) implementation of ERC721A standard for non-fungible tokens (NFTs).

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.

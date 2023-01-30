import { ethers } from "hardhat";

const contractName = "Gitsec";
const contractSymbol = "GIT";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying Gitsec contract with the account:", deployer.address);

    const Gitsec = await ethers.getContractFactory("Gitsec");
    const gasPrice = await Gitsec.signer.getGasPrice();
    console.log(`Current gas price: ${gasPrice}`);
    const estimatedGas = await Gitsec.signer.estimateGas(
        Gitsec.getDeployTransaction(contractName, contractSymbol),
    );
    console.log(`Estimated gas: ${estimatedGas}`);
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await Gitsec.signer.getBalance();
    console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
    if (Number(deployerBalance) < Number(deploymentPrice)) {
        throw new Error("You dont have enough balance to deploy.");
    }

    const gitsec = await Gitsec.deploy(contractName, contractSymbol);

    await gitsec.deployed();

    console.log("Gitsec contract deployed to address:", gitsec.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error:", error);
        process.exit(1);
    });
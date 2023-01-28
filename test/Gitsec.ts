import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

describe("Gitsec unit tests", function () {
    const GName = "Gitsec";
    const GSymbol = "GIT";

    //const zeroAddress = "0x0000000000000000000000000000000000000000";

    async function deployGitsecFixture() {
        const [owner, address1, address2, address3] = await ethers.getSigners();

        const Gitsec = await ethers.getContractFactory("Gitsec");
        const gitsec = await Gitsec.deploy(GName, GSymbol);

        return {gitsec, owner, address1, address2, address3};
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const {gitsec, owner} = await loadFixture(deployGitsecFixture);

            expect(await gitsec.owner()).to.equal(owner.address);
        });

        it("Should deploy with proper address", async function () {
            const {gitsec} = await loadFixture(deployGitsecFixture);

            expect(gitsec.address).to.be.properAddress;
        });

        it("Should have right name", async function () {
            const {gitsec} = await loadFixture(deployGitsecFixture);

            expect(await gitsec.name()).to.equal(GName);
        });

        it("Should have right symbol", async function () {
            const {gitsec} = await loadFixture(deployGitsecFixture);

            expect(await gitsec.symbol()).to.equal(GSymbol);
        });

        it("Total supply should be 0", async function () {
            const {gitsec} = await loadFixture(deployGitsecFixture);

            expect(await gitsec.totalSupply()).to.equal(0);
        });
    });
})
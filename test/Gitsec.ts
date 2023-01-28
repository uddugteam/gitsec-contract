import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

describe("Gitsec unit tests", function () {
    const GName = "Gitsec";
    const GSymbol = "GIT";

    const zeroAddress = "0x0000000000000000000000000000000000000000";

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

    describe("Create repository", function () {
        it("Should mint token to caller", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            await gitsec.connect(address1).createRepository(repoName);

            expect(await gitsec.ownerOf(0)).to.equal(address1.address);
        });

        it("Should change callers balance", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            await gitsec.connect(address1).createRepository(repoName);

            expect(await gitsec.balanceOf(address1.address)).to.equal(1);
        });

        it("Should increase total supply", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            await gitsec.connect(address1).createRepository(repoName);

            expect(await gitsec.totalSupply()).to.equal(1);
        });

        it("Should add repository to repositories mapping", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            await gitsec.connect(address1).createRepository(repoName);

            const repo = await gitsec.getRepository(0);

            expect(repo.id).to.equal(0);
            expect(repo.name).to.equal(repoName);
            expect(repo.owner).to.equal(address1.address);
        });

        it("Should emit transfer event", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            const tx = gitsec.connect(address1).createRepository(repoName);

            await expect(tx).to.emit(gitsec, "Transfer").withArgs(zeroAddress, address1.address, 0);
        });

        it("Should emit repository created event", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "Test repo";

            const tx = gitsec.connect(address1).createRepository(repoName);

            await expect(tx).to.emit(gitsec, "RepositoryCreated").withArgs(0, repoName, address1.address);
        });

        it.skip("Should not create repository if name is null", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "";

            const tx = gitsec.connect(address1).createRepository(repoName);

            await expect(tx).to.be.revertedWith("Gitsec: name is null");
        });

        it.skip("Should not create repository if name is spaces only", async function () {
            const {gitsec, address1} = await loadFixture(deployGitsecFixture);
            const repoName = "   ";

            const tx = gitsec.connect(address1).createRepository(repoName);

            await expect(tx).to.be.revertedWith("Gitsec: name is null");
        });
    });

})
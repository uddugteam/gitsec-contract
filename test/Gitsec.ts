import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("Gitsec unit tests", function () {
  const GName = "Gitsec";
  const GSymbol = "GIT";

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  async function deployGitsecFixture() {
    const [owner, address1, address2, address3] = await ethers.getSigners();

    const Gitsec = await ethers.getContractFactory("Gitsec");
    const gitsec = await Gitsec.deploy(GName, GSymbol);

    return { gitsec, owner, address1, address2, address3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { gitsec, owner } = await loadFixture(deployGitsecFixture);

      expect(await gitsec.owner()).to.equal(owner.address);
    });

    it("Should deploy with proper address", async function () {
      const { gitsec } = await loadFixture(deployGitsecFixture);

      expect(gitsec.address).to.be.properAddress;
    });

    it("Should have right name", async function () {
      const { gitsec } = await loadFixture(deployGitsecFixture);

      expect(await gitsec.name()).to.equal(GName);
    });

    it("Should have right symbol", async function () {
      const { gitsec } = await loadFixture(deployGitsecFixture);

      expect(await gitsec.symbol()).to.equal(GSymbol);
    });

    it("Total supply should be 0", async function () {
      const { gitsec } = await loadFixture(deployGitsecFixture);

      expect(await gitsec.totalSupply()).to.equal(0);
    });
  });

  describe("Create repository", function () {
    it("Should mint token to caller", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);

      expect(await gitsec.ownerOf(1)).to.equal(address1.address);
    });

    it("Should change callers balance", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);

      expect(await gitsec.balanceOf(address1.address)).to.equal(1);
    });

    it("Should increase total supply", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);

      expect(await gitsec.totalSupply()).to.equal(1);
    });

    it("Should add repository to repositories mapping", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);

      const repo = await gitsec.getRepository(1);

      expect(repo.id).to.equal(1);
      expect(repo.name).to.equal(repoName);
      expect(repo.owner).to.equal(address1.address);
      expect(repo.description).to.equal(repoDescription);
    });

    it("Should add repository id to user repositories mapping", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);

      const repos = await gitsec.getUserRepositories(address1.address);

      expect(repos[0].id).to.equal(1);
      expect(repos[0].name).to.equal(repoName);
      expect(repos[0].owner).to.equal(address1.address);
      expect(repos[0].description).to.equal(repoDescription);
    });

    it("Should return all created repositories", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address2).createRepository(repoName, repoDescription);

      const repos = await gitsec.getAllRepositories();

      expect(repos[0].id).to.equal(1);
      expect(repos[0].name).to.equal(repoName);
      expect(repos[0].owner).to.equal(address1.address);
      expect(repos[0].description).to.equal(repoDescription);

      expect(repos[1].id).to.equal(2);
      expect(repos[1].name).to.equal(repoName);
      expect(repos[1].owner).to.equal(address2.address);
      expect(repos[1].description).to.equal(repoDescription);
    });

    it("Get repositories should return zero length array if no user repositories", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);

      const repos = await gitsec.getUserRepositories(address1.address);

      expect(repos.length).to.equal(0);
    });

    it("Should emit transfer event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      const tx = gitsec.connect(address1).createRepository(repoName, repoDescription);

      await expect(tx).to.emit(gitsec, "Transfer").withArgs(zeroAddress, address1.address, 1);
    });

    it("Should emit repository created event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      const tx = gitsec.connect(address1).createRepository(repoName, repoDescription);

      await expect(tx).to.emit(gitsec, "RepositoryCreated").withArgs(1, repoName, address1.address, repoDescription);
    });

    it.skip("Should not create repository if name is null", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "";
      const repoDescription = "Test repo description";

      const tx = gitsec.connect(address1).createRepository(repoName, repoDescription);

      await expect(tx).to.be.revertedWith("Gitsec: name is null");
    });

    it.skip("Should not create repository if name is spaces only", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "   ";
      const repoDescription = "Test repo description";

      const tx = gitsec.connect(address1).createRepository(repoName, repoDescription);

      await expect(tx).to.be.revertedWith("Gitsec: name is null");
    });
  });

  describe("Fork repository", function () {
    it("Should mint token to caller", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      expect(await gitsec.ownerOf(1)).to.equal(address1.address);
    });

    it("Should change callers balance", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      expect(await gitsec.balanceOf(address1.address)).to.equal(1);
    });

    it("Should increase total supply", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      expect(await gitsec.totalSupply()).to.equal(1);
    });

    it("Should add repository to repositories mapping", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      const repo = await gitsec.getRepository(1);

      expect(repo.id).to.equal(1);
      expect(repo.name).to.equal(repoName);
      expect(repo.owner).to.equal(address1.address);
      expect(repo.description).to.equal(repoDescription);
      expect(repo.forkedFrom).to.equal(url);
    });

    it("Should add repository id to user repositories mapping", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      const repos = await gitsec.getUserRepositories(address1.address);

      expect(repos[0].id).to.equal(1);
      expect(repos[0].name).to.equal(repoName);
      expect(repos[0].owner).to.equal(address1.address);
      expect(repos[0].description).to.equal(repoDescription);
      expect(repos[0].forkedFrom).to.equal(url);
    });

    it("Should return all created repositories", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      await gitsec.connect(address1).forkRepository(repoName, repoDescription, url);
      await gitsec.connect(address2).forkRepository(repoName, repoDescription, url);

      const repos = await gitsec.getAllRepositories();

      expect(repos[0].id).to.equal(1);
      expect(repos[0].name).to.equal(repoName);
      expect(repos[0].owner).to.equal(address1.address);
      expect(repos[0].description).to.equal(repoDescription);
      expect(repos[0].forkedFrom).to.equal(url);

      expect(repos[1].id).to.equal(2);
      expect(repos[1].name).to.equal(repoName);
      expect(repos[1].owner).to.equal(address2.address);
      expect(repos[1].description).to.equal(repoDescription);
      expect(repos[1].forkedFrom).to.equal(url);
    });

    it("Should emit transfer event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      const tx = gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      await expect(tx).to.emit(gitsec, "Transfer").withArgs(zeroAddress, address1.address, 1);
    });

    it("Should emit repository forked event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "//";

      const tx = gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      await expect(tx)
        .to.emit(gitsec, "RepositoryForked")
        .withArgs(1, repoName, address1.address, repoDescription, url);
    });

    it.skip("Should not create repository if name is null", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "";
      const repoDescription = "Test repo description";
      const url = "//";

      const tx = gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      await expect(tx).to.be.revertedWith("Gitsec: name is null");
    });

    it.skip("Should not create repository if name is spaces only", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "   ";
      const repoDescription = "Test repo description";
      const url = "//";

      const tx = gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      await expect(tx).to.be.revertedWith("Gitsec: name is null");
    });

    it.skip("Should not create repository if url is invalid", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const url = "...";

      const tx = gitsec.connect(address1).forkRepository(repoName, repoDescription, url);

      await expect(tx).to.be.revertedWith("Gitsec: url is invalid");
    });
  });

  describe("Set admin", function () {
    it("Should set admin", async function () {
      const { gitsec, address2 } = await loadFixture(deployGitsecFixture);

      expect(await gitsec.admin()).to.equal(zeroAddress);

      await gitsec.setAdmin(address2.address);

      expect(await gitsec.admin()).to.equal(address2.address);
    });

    it("Should update admin", async function () {
      const { gitsec, address2, address3 } = await loadFixture(deployGitsecFixture);

      await gitsec.setAdmin(address2.address);
      await gitsec.setAdmin(address3.address);

      expect(await gitsec.admin()).to.equal(address3.address);
    });

    it("Should revert if caller is not the contract owner", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);

      const tx = gitsec.connect(address1).setAdmin(address1.address);

      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Update IPFS", function () {
    it("Should add IPFS", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).updateIPFS(1, IPFS);

      const repo = await gitsec.getRepository(1);

      expect(repo.IPFS).to.equal(IPFS);
    });

    it("Should add IPFS if caller is admin", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.setAdmin(address2.address);
      await gitsec.connect(address2).updateIPFS(1, IPFS);

      const repo = await gitsec.getRepository(1);

      expect(repo.IPFS).to.equal(IPFS);
    });

    it("Should update IPFS", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";
      const newIPFS = "newHash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).updateIPFS(1, IPFS);
      await gitsec.connect(address1).updateIPFS(1, newIPFS);

      const repo = await gitsec.getRepository(1);

      expect(repo.IPFS).to.equal(newIPFS);
    });

    it("Should emit event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address1).updateIPFS(1, IPFS);

      await expect(tx).to.emit(gitsec, "IPFSHashUpdated").withArgs(1, address1.address, IPFS);
    });

    it("Should update last update field", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).updateIPFS(1, IPFS);
      const timestamp = await time.latest();

      const repository = await gitsec.getRepository(1);

      expect(repository.lastUpdate).to.equal(timestamp);
    });

    it("Should revert if given repo ID is invalid", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const IPFS = "hash";

      const tx = gitsec.connect(address1).updateIPFS(1, IPFS);

      await expect(tx).to.be.revertedWith("Gitsec: no repository found by given ID");
    });

    it("Should revert if caller is not the repo owner or admin", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "hash";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address2).updateIPFS(1, IPFS);

      await expect(tx).to.be.revertedWith("Gitsec: caller is not the repository owner or admin");
    });

    it.skip("Should revert if IPFS hash is null", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address2).updateIPFS(1, IPFS);

      await expect(tx).to.be.revertedWith("Gitsec: IPFS is null");
    });

    it.skip("Should revert if IPFS hash is spaces only", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const IPFS = "   ";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address2).updateIPFS(1, IPFS);

      await expect(tx).to.be.revertedWith("Gitsec: IPFS is null");
    });
  });

  describe("Update description", function () {
    it("Should set description", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "";
      const newDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).updateDescription(1, newDescription);

      const repo = await gitsec.getRepository(1);

      expect(repo.id).to.equal(1);
      expect(repo.name).to.equal(repoName);
      expect(repo.owner).to.equal(address1.address);
      expect(repo.description).to.equal(newDescription);
    });

    it("Should update description", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const newDescription = "Test repo description updated";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).updateDescription(1, newDescription);

      const repo = await gitsec.getRepository(1);

      expect(repo.id).to.equal(1);
      expect(repo.name).to.equal(repoName);
      expect(repo.owner).to.equal(address1.address);
      expect(repo.description).to.equal(newDescription);
    });

    it("Should not update description if invalid ID", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const newDescription = "Test repo description updated";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address1).updateDescription(2, newDescription);

      await expect(tx).to.be.revertedWith("Gitsec: no repository found by given ID");
    });

    it("Should not update description if caller is not repository owner", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";
      const newDescription = "Test repo description updated";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address2).updateDescription(1, newDescription);

      await expect(tx).to.be.revertedWith("Gitsec: caller is not the repository owner");
    });
  });

  describe("Delete repository", function () {
    it("Should burn token", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).deleteRepository(1);

      const tx = gitsec.ownerOf(1);

      await expect(tx).to.be.revertedWithCustomError(gitsec, "OwnerQueryForNonexistentToken");
    });

    it("Should delete repository data struct form repositories mapping", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).deleteRepository(1);

      const repo = await gitsec.getRepository(1);

      expect(repo.id).to.equal(0);
      expect(repo.name).to.equal("");
      expect(repo.owner).to.equal(zeroAddress);
      expect(repo.IPFS).to.equal("");
    });

    it("Should delete repository id form user repositories mapping", async function () {
      const { gitsec, address1, address3 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address3).createRepository(repoName, repoDescription);

      await gitsec.connect(address1).deleteRepository(2);

      const repos = await gitsec.getUserRepositories(address1.address);

      expect(repos.length).to.equal(2);
      expect(repos[0].id).to.equal(1);
      expect(repos[1].id).to.equal(3);
    });

    it("Should return all repositories except deleted", async function () {
      const { gitsec, address1, address3 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address3).createRepository(repoName, repoDescription);

      await gitsec.connect(address1).deleteRepository(2);

      const allRepos = await gitsec.getAllRepositories();

      expect(allRepos.length).to.equal(3);
      expect(allRepos[0].id).to.equal(1);
      expect(allRepos[1].id).to.equal(3);
      expect(allRepos[2].id).to.equal(4);
    });

    it("Should reduce caller balance", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).deleteRepository(1);

      expect(await gitsec.balanceOf(address1.address)).to.equal(0);
    });

    it("Should reduce total supply", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      await gitsec.connect(address1).deleteRepository(1);

      expect(await gitsec.totalSupply()).to.equal(0);
    });

    it("Should emit transfer event", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address1).deleteRepository(1);

      await expect(tx).to.emit(gitsec, "Transfer").withArgs(address1.address, zeroAddress, 1);
    });

    it("Should revert if caller is not repo owner", async function () {
      const { gitsec, address1, address2 } = await loadFixture(deployGitsecFixture);
      const repoName = "Test repo";
      const repoDescription = "Test repo description";

      await gitsec.connect(address1).createRepository(repoName, repoDescription);
      const tx = gitsec.connect(address2).deleteRepository(1);

      await expect(tx).to.be.revertedWith("Gitsec: caller is not the repository owner");
    });

    it("Should revert if invalid repo id", async function () {
      const { gitsec, address1 } = await loadFixture(deployGitsecFixture);

      const tx = gitsec.connect(address1).deleteRepository(1);

      await expect(tx).to.be.revertedWith("Gitsec: no repository found by given ID");
    });
  });
});

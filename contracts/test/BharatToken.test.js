const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BharatToken", function () {
  let bharatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    const BharatToken = await ethers.getContractFactory("BharatToken");
    bharatToken = await BharatToken.deploy(owner.address);
    await bharatToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await bharatToken.name()).to.equal("Bharat Token");
      expect(await bharatToken.symbol()).to.equal("BRT");
    });

    it("Should set the right decimals", async function () {
      expect(await bharatToken.decimals()).to.equal(18);
    });

    it("Should set the right owner", async function () {
      expect(await bharatToken.owner()).to.equal(owner.address);
    });

    it("Should have zero initial supply", async function () {
      expect(await bharatToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await bharatToken.mint(addr1.address, mintAmount);
      
      expect(await bharatToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await bharatToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        bharatToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(bharatToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow batch minting", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("1000"), ethers.parseEther("2000")];
      
      await bharatToken.batchMint(recipients, amounts);
      
      expect(await bharatToken.balanceOf(addr1.address)).to.equal(amounts[0]);
      expect(await bharatToken.balanceOf(addr2.address)).to.equal(amounts[1]);
      expect(await bharatToken.totalSupply()).to.equal(amounts[0] + amounts[1]);
    });

    it("Should revert batch mint with mismatched arrays", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("1000")]; // Only one amount for two recipients
      
      await expect(
        bharatToken.batchMint(recipients, amounts)
      ).to.be.revertedWith("Arrays length mismatch");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens first
      await bharatToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("500");
      const initialBalance = await bharatToken.balanceOf(addr1.address);
      
      await bharatToken.connect(addr1).burn(burnAmount);
      
      expect(await bharatToken.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await bharatToken.totalSupply()).to.equal(initialBalance - burnAmount);
    });

    it("Should revert when trying to burn more than balance", async function () {
      const burnAmount = ethers.parseEther("2000"); // More than the 1000 minted
      
      await expect(
        bharatToken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWithCustomError(bharatToken, "ERC20InsufficientBalance");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens first
      await bharatToken.mint(addr1.address, ethers.parseEther("1000"));
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await bharatToken.connect(addr1).transfer(addr2.address, transferAmount);
      
      expect(await bharatToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
      expect(await bharatToken.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should approve and transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");
      
      await bharatToken.connect(addr1).approve(addr2.address, approveAmount);
      expect(await bharatToken.allowance(addr1.address, addr2.address)).to.equal(approveAmount);
      
      await bharatToken.connect(addr2).transferFrom(addr1.address, addr2.address, approveAmount);
      
      expect(await bharatToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
      expect(await bharatToken.balanceOf(addr2.address)).to.equal(approveAmount);
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await bharatToken.transferOwnership(addr1.address);
      expect(await bharatToken.owner()).to.equal(addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(
        bharatToken.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWithCustomError(bharatToken, "OwnableUnauthorizedAccount");
    });
  });
});
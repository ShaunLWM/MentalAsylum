import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expectRevert } from "@openzeppelin/test-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MentalAsylum } from "../typechain-types/MentalAsylum";

const jsonProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

describe("MentalAsylum", () => {
  let MentalAsylumContract: MentalAsylum;
  let deployer: SignerWithAddress; //owner
  let alice: SignerWithAddress; // normal user
  let bob: SignerWithAddress; // presale user

  before(async () => {
    [deployer, alice, bob] = await ethers.getSigners();
    const mentalAsylum = await ethers.getContractFactory("MentalAsylum");
    MentalAsylumContract = (await mentalAsylum.connect(deployer).deploy("MentalAsylum", "ASY", "")) as MentalAsylum;
    await MentalAsylumContract.deployed();
  });

  it("should properly deploy MentalAsylum contract", async () => {
    expect(await MentalAsylumContract.symbol()).to.equal("ASY");
    expect(await MentalAsylumContract.name()).to.equal("MentalAsylum");
  });

  it("should list Alice as contract owner", async () => {
    expect(await MentalAsylumContract.owner()).to.equal(deployer.address);
  });

  it("should not allow users to mint if not started", async () => {
    expect(await MentalAsylumContract.started()).to.equal(false);
    await expectRevert(MentalAsylumContract.connect(alice).mint(BigNumber.from(1)), "not started");
    expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
  });

  it("should not allow users to premint if not started", async () => {
    expect(await MentalAsylumContract.presaleStarted()).to.equal(false);
    await expectRevert(MentalAsylumContract.connect(bob).premint(BigNumber.from(1)), "presale not started");
    expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
  });

  it("should not allow nonOwner to call setPresale method", async () => {
    await expectRevert(MentalAsylumContract.connect(alice).setPresale(bob.address, 10), "Ownable: caller is not the owner");
  });

  describe("Start NFT Presale", () => {
    before(async() => {
      const setBobPresale = await MentalAsylumContract.connect(deployer).setPresale(bob.address, 10);
      await setBobPresale.wait();
      const startPresale = await MentalAsylumContract.connect(deployer).setPresaleStart(true);
      await startPresale.wait();
    });

    it("should not allow Alice to premint", async () => {
        await expectRevert(
          MentalAsylumContract.connect(alice).premint(BigNumber.from(1), { value: ethers.utils.parseEther("0.05") }),
          "not allowed"
        );
        expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it("should not allow Bob to premint more than 10", async () => {
      await expectRevert(MentalAsylumContract.connect(bob).premint(BigNumber.from(11)), "not allowed");
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
    });

    it("should not allow Bob to premint with wrong paid value", async () => {
      await expectRevert(MentalAsylumContract.connect(bob).premint(BigNumber.from(10)), "value error, please check price.");
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
    });

    it("should allow Bob to premint properly", async () => {
      const currentPatients = await MentalAsylumContract.totalPatients();
      const ownerBalance = await jsonProvider.getBalance(deployer.address);
      await expect(MentalAsylumContract.connect(bob).premint(1, { value: ethers.utils.parseEther("0.05") }))
        .to.emit(MentalAsylumContract, "MintPatient")
        .withArgs(bob.address, currentPatients.add(1), 1);
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(1);
      expect(await jsonProvider.getBalance(deployer.address)).to.eq(ownerBalance.add(ethers.utils.parseEther("0.05")));
      expect(await MentalAsylumContract.presales(bob.address)).to.equal(9);
      expect(await MentalAsylumContract.totalPatients()).to.equal(1);
    });
  });

  describe("Start normal NFT sale", () => {
    before(async () => {
      const start = await MentalAsylumContract.connect(deployer).setStart(true);
      await start.wait();
    });

    it("should not allow Alice to mint more than maxBatch = 10", async () => {
      await expectRevert(MentalAsylumContract.connect(alice).mint(BigNumber.from(11)), "must mint fewer in each batch");
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it("should prevent Alice from minting < price (0.05 ether)", async () => {
      await expectRevert(
        MentalAsylumContract.connect(alice).mint(BigNumber.from(1), { value: ethers.utils.parseEther("0.04") }),
        "value error, please check price."
      );
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it("should allow Alice to mint 1 NFT", async () => {
      const currentPatients = await MentalAsylumContract.totalPatients();
      const ownerBalance = await jsonProvider.getBalance(deployer.address);
      await expect(MentalAsylumContract.connect(alice).mint(1, { value: ethers.utils.parseEther("0.05") }))
        .to.emit(MentalAsylumContract, "MintPatient")
        .withArgs(alice.address, currentPatients.add(1), 1);
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(1);
      expect(await jsonProvider.getBalance(deployer.address)).to.eq(ownerBalance.add(ethers.utils.parseEther("0.05")));
      expect(await MentalAsylumContract.totalPatients()).to.equal(1);
    });
  });
});

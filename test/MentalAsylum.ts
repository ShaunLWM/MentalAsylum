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

  before(async () => {
    [deployer, alice] = await ethers.getSigners();
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

  it("should not allow users to buy if not started", async () => {
    await expectRevert(MentalAsylumContract.connect(alice).mint(BigNumber.from(1)), "not started");
    expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
  });

  describe("Start NFT sale", () => {
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
    });
  });
});

import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expectRevert } from "@openzeppelin/test-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MentalAsylum } from "../typechain-types/MentalAsylum";

describe("MentalAsylum", () => {
  let MentalAsylumContract: MentalAsylum;
  let alice: SignerWithAddress; //owner
  let bob: SignerWithAddress; // normal user

  before(async () => {
    [alice, bob] = await ethers.getSigners();
    const mentalAsylum = await ethers.getContractFactory("MentalAsylum");
    MentalAsylumContract = (await mentalAsylum.connect(alice).deploy("MentalAsylum", "ASY", "")) as MentalAsylum;
    await MentalAsylumContract.deployed();
  });

  it("should properly deploy MentalAsylum contract", async () => {
    expect(await MentalAsylumContract.symbol()).to.equal("ASY");
    expect(await MentalAsylumContract.name()).to.equal("MentalAsylum");
  });

  it("should list Alice as contract owner", async () => {
    expect(await MentalAsylumContract.owner()).to.equal(alice.address);
  });

  it("should not allow users to buy if not started", async () => {
    await expectRevert(MentalAsylumContract.connect(bob).mint(BigNumber.from(1)), "not started");
    expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
  });
});
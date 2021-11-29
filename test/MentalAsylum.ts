import { expect } from "chai";
import { ethers } from "hardhat";
import { MentalAsylum } from "../typechain-types/MentalAsylum";

describe("MentalAsylum", function () {
  it("Should properly deploy MentalAsylum contract", async function () {
    const MentalAsylumContract = await ethers.getContractFactory("MentalAsylum");
    const mentalAsylum: MentalAsylum = await MentalAsylumContract.deploy("MentalAsylum", "ASY", "");

    await mentalAsylum.deployed();
    expect(await mentalAsylum.symbol()).to.equal("ASY");
  });
});

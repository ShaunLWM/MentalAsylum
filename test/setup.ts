import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { Contract } from "ethers";
import { deployments } from "hardhat";
import { getNamedSigners } from "@nomiclabs/hardhat-ethers/dist/src/helpers";
import { MentalAsylum } from "../typechain-types/MentalAsylum";

interface FixtureState {
  accounts: {
    readonly deployer: SignerWithAddress;
    readonly alice: SignerWithAddress;
    readonly bob: SignerWithAddress;
    readonly carol: SignerWithAddress;
  };
  contracts: {
    readonly MeatTokenContract: Contract;
    readonly MentalAsylumContract: MentalAsylum;
  };
}

// example: https://github.com/summit-defi/summit-contracts/blob/8abb8b34a2094213ade30c480a057dd27a9e92f8/test/fixtures.ts#L33
export const setupFixtures = deployments.createFixture(async (hre): Promise<FixtureState> => {
  const { deployments, ethers } = hre;
  await deployments.all();
  await deployments.fixture(); // ensure you start from a fresh deployments
  const { deployer, alice, bob, carol } = await getNamedSigners(hre); // from hardhat.config.ts
  const MeatTokenContract = await ethers.getContract("MeatToken", deployer);
  const MentalAsylumContract = await ethers.getContract<MentalAsylum>("MentalAsylum", deployer);
  return {
    accounts: {
      deployer,
      alice,
      bob,
      carol,
    },
    contracts: {
      MeatTokenContract,
      MentalAsylumContract,
    },
  };
});

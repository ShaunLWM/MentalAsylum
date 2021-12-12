import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const MeatTokenDeployment = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const MentalAsylumContract = await ethers.getContract("MentalAsylum");
  const { address } = await deploy("MeatToken", {
    from: deployer,
    args: [MentalAsylumContract.address],
  });

  // TODO: Shaun - connect MentalAsylum contract as deployed and set Meat Token address in contract
  // await MentalAsylumContract.setTokenAddress();

  console.log(`MeatToken deployed to ${address}`);
};

MeatTokenDeployment.tags = ["MeatToken"];
MeatTokenDeployment.dependencies = ["MentalAsylum"];

export default MeatTokenDeployment;

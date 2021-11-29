import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address } = await deploy("MentalAsylum", {
    from: deployer,
    args: ["MentalAsylum", "ASY", ""],
  });

  console.log(`MentalAsylum deployed to ${address}`);
};

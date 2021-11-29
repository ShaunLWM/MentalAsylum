import { MentalAsylum } from "../typechain-types/MentalAsylum";

export default async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address }: MentalAsylum = await deploy("MentalAsylum", {
    from: deployer,
    args: ["MentalAsylum", "ASY", ""],
  });

  console.log(`MentalAsylum deployed to ${address}`);
};

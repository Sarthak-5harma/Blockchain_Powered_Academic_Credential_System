import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const Factory = await ethers.getContractFactory("AcademicCredential");

  // === NO constructor args ===
  const contract = await Factory.deploy();

  await contract.waitForDeployment();           // ethers v6
  console.log("✅ Deployed to:", await contract.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

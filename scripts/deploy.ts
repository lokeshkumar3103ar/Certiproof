const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertChainRegistry...");

  const CertChainRegistry = await ethers.getContractFactory("CertChainRegistry");
  const registry = await CertChainRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`CertChainRegistry deployed to: ${address}`);
  console.log("");
  console.log("Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

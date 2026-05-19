const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy BonfireAsh (ERC-721)
  console.log("\n📜 Deploying BonfireAsh...");
  const BonfireAsh = await hre.ethers.getContractFactory("BonfireAsh");
  const ash = await BonfireAsh.deploy();
  await ash.waitForDeployment();
  const ashAddress = await ash.getAddress();
  console.log("✅ BonfireAsh deployed:", ashAddress);

  // 2. Deploy BonfireCore
  console.log("\n🔥 Deploying BonfireCore...");
  const BonfireCore = await hre.ethers.getContractFactory("BonfireCore");
  const core = await BonfireCore.deploy(ashAddress);
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log("✅ BonfireCore deployed:", coreAddress);

  // 3. Grant BonfireCore permission to mint on BonfireAsh
  console.log("\n🔗 Setting BonfireCore on BonfireAsh...");
  const tx = await ash.setBonfireCore(coreAddress);
  await tx.wait();
  console.log("✅ Permission set");

  // 4. Save addresses to a JSON file for frontend
  const addresses = {
    BonfireAsh: ashAddress,
    BonfireCore: coreAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\n📁 Addresses saved to deployments.json");
  console.log(JSON.stringify(addresses, null, 2));

  // 5. Verify on Basescan (if not local)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Waiting 15s before verification...");
    await new Promise((r) => setTimeout(r, 15000));

    try {
      await hre.run("verify:verify", { address: ashAddress, constructorArguments: [] });
      await hre.run("verify:verify", { address: coreAddress, constructorArguments: [ashAddress] });
      console.log("✅ Contracts verified on Basescan");
    } catch (e) {
      console.log("⚠️  Verification failed (might already be verified):", e.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("Next: Update frontend .env.local with contract addresses");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting BharatToken deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  
  console.log("📄 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
  // Get the contract factory
  const BharatToken = await ethers.getContractFactory("BharatToken");
  
  // Deploy the contract with the deployer as initial owner
  console.log("⏳ Deploying BharatToken...");
  const bharatToken = await BharatToken.deploy(deployer.address);
  
  // Wait for deployment to complete
  await bharatToken.waitForDeployment();
  
  const contractAddress = await bharatToken.getAddress();
  
  console.log("✅ BharatToken deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("👤 Owner address:", deployer.address);
  
  // Get contract details
  const name = await bharatToken.name();
  const symbol = await bharatToken.symbol();
  const decimals = await bharatToken.decimals();
  const totalSupply = await bharatToken.totalSupply();
  
  console.log("\n📊 Contract Details:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals.toString());
  console.log("  Initial Total Supply:", ethers.formatEther(totalSupply), "BRT");
  
  // Verify contract on Etherscan (if API key is provided)
  if (process.env.ETHERSCAN_API_KEY && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await bharatToken.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Etherscan verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("💡 You can now mint tokens using the mint() function from your backend.");
  console.log("🔗 Add this contract address to your frontend:", contractAddress);
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    ownerAddress: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    contractDetails: {
      name: name,
      symbol: symbol,
      decimals: decimals.toString(),
    }
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to deployment-info.json");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
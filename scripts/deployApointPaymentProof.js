const hre = require('hardhat');

async function main() {
  const ApointPaymentProof = await hre.ethers.getContractFactory('ApointPaymentProof');
  const proof = await ApointPaymentProof.deploy();

  await proof.waitForDeployment();

  console.log(`ApointPaymentProof deployed to: ${await proof.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

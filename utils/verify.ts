import { run } from "hardhat";

const verify = async (contractAddress: any, args: any) => {
    console.log("Verifying contract..");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArgs: args
      });
    } catch (e: any) {
      if (e.message.toLowerCase().includes("already verified")) {
        console.log("Already Verified");
      } else {
        console.log("Verification Error: ", e.message);
      }
    }
  }

module.exports = {verify};
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const AMOY_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

if (!DEPLOYER_PRIVATE_KEY && process.env.NODE_ENV === "production") {
  throw new Error("DEPLOYER_PRIVATE_KEY is required in production environment");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    ...(DEPLOYER_PRIVATE_KEY ? {
      amoy: {
        url: AMOY_RPC_URL,
        accounts: [DEPLOYER_PRIVATE_KEY],
        chainId: 80002,
      },
    } : {}),
  },
};

export default config;

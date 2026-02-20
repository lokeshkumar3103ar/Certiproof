import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function issue(bytes32 certHash) external",
  "function revoke(bytes32 certHash) external",
  "function verify(bytes32 certHash) external view returns (address issuer, uint256 issuedAt, uint256 revokedAt)",
  "event CertIssued(bytes32 indexed certHash, address indexed issuer)",
  "event CertRevoked(bytes32 indexed certHash, address indexed issuer)",
];

function getProvider() {
  const rpcUrl =
    process.env.NEXT_PUBLIC_AMOY_RPC_URL ||
    "https://rpc-amoy.polygon.technology";
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) throw new Error("Contract address not configured");
  return new ethers.Contract(
    address,
    CONTRACT_ABI,
    signerOrProvider || getProvider()
  );
}

/**
 * Issue a certificate hash on-chain (server-side only — requires private key)
 */
/** Normalize a private key to ensure it has the 0x prefix. */
function normalizeKey(key: string): string {
  return key.startsWith("0x") ? key : `0x${key}`;
}

export async function issueCertificateOnChain(
  certHash: string
): Promise<string> {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("Deployer private key not configured");

  const provider = getProvider();
  const wallet = new ethers.Wallet(normalizeKey(privateKey), provider);
  const contract = getContract(wallet);

  const tx = await contract.issue(certHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Revoke a certificate hash on-chain (server-side only)
 */
export async function revokeCertificateOnChain(
  certHash: string
): Promise<string> {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("Deployer private key not configured");

  const provider = getProvider();
  const wallet = new ethers.Wallet(normalizeKey(privateKey), provider);
  const contract = getContract(wallet);

  const tx = await contract.revoke(certHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Verify a certificate hash on-chain (client or server — read-only, no gas)
 */
export async function verifyCertificateOnChain(certHash: string): Promise<{
  issuer: string;
  issuedAt: number;
  revokedAt: number;
} | null> {
  try {
    const contract = getContract();
    const [issuer, issuedAt, revokedAt] = await contract.verify(certHash);

    // If issuer is zero address, certificate not found on chain
    if (issuer === ethers.ZeroAddress) return null;

    return {
      issuer,
      issuedAt: Number(issuedAt),
      revokedAt: Number(revokedAt),
    };
  } catch {
    return null;
  }
}

/**
 * Get the Polygonscan URL for a transaction
 */
export function getPolygonscanUrl(txHash: string): string {
  return `https://amoy.polygonscan.com/tx/${txHash}`;
}

/**
 * Get the Polygonscan URL for an address
 */
export function getPolygonscanAddressUrl(address: string): string {
  return `https://amoy.polygonscan.com/address/${address}`;
}

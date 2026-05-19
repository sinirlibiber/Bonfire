# BaseBonfire — Claude Context

## What this project is
A communal bonfire dApp on Base chain. Users connect wallets, contribute content (text/image/audio), each contribution adds time to the fire. When it dies out, an on-chain NFT is minted capturing the session. Built on Base Sepolia testnet.

## Architecture
- **contracts/** — Solidity 0.8.20, Hardhat, OpenZeppelin 5.x
  - `BonfireCore.sol` — main state machine, handles contributions, extinguish logic
  - `BonfireAsh.sol` — ERC-721 NFT, minted per session, on-chain SVG
- **frontend/** — Next.js 14 App Router, TypeScript, Tailwind CSS, wagmi v2, RainbowKit
- **indexer/** — The Graph subgraph for leaderboard queries (optional)

## Key design decisions
- No on-chain timers — extinguish is reactive (checked on next contribution or explicit call)
- Content stored on IPFS (Pinata), only CID hash on-chain
- Emotion detection is client-side keyword matching + manual override
- NFTs are minted to the contract itself (publicly viewable, not owned)

## Local dev commands
```bash
# Contracts
cd contracts && npm install && npx hardhat compile
npx hardhat node  # local node
npx hardhat run scripts/deploy.js --network localhost

# Frontend
cd frontend && npm install && npm run dev
```

## Contract addresses (fill in after deploy)
- BonfireCore: TBD
- BonfireAsh: TBD
- Network: Base Sepolia (chainId: 84532)

## Env vars needed
- contracts: PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, BASESCAN_API_KEY
- frontend: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, NEXT_PUBLIC_BONFIRE_CORE_ADDRESS, NEXT_PUBLIC_BONFIRE_ASH_ADDRESS, NEXT_PUBLIC_PINATA_JWT

## Key files
- `contracts/contracts/BonfireCore.sol` — state machine
- `contracts/contracts/BonfireAsh.sol` — NFT
- `frontend/src/hooks/useBonfire.ts` — wagmi hooks
- `frontend/src/lib/abis.ts` — contract ABIs
- `frontend/src/lib/ipfs.ts` — IPFS upload + emotion detection
- `frontend/src/components/BonfireCanvas.tsx` — animated fire
- `frontend/src/components/ContributeForm.tsx` — contribution UI

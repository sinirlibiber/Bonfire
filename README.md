# 🔥 BaseBonfire

A communal digital bonfire on Base chain. Connect your wallet, throw something in, keep it alive.

## What is this?

A shared experience where anyone can contribute words, emojis, images, or audio to a communal bonfire. Every contribution adds seconds to its life. Let it die out and it becomes a permanent "ash fragment" NFT on-chain — a frozen memory of everyone who kept it burning.

## Project Structure

```
basedonfire/
├── contracts/       # Hardhat + Solidity (BonfireCore, BonfireAsh ERC-721)
├── frontend/        # Next.js 14 + wagmi v2 + RainbowKit
└── indexer/         # The Graph subgraph (optional, for leaderboards)
```

## Quick Start

### 1. Setup Contracts

```bash
cd contracts
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC URLs
npm install
npx hardhat compile
```

### 2. Deploy to Base Sepolia (testnet)

Get free test ETH from: https://faucet.base.org

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

This creates `deployments.json` with your contract addresses.

### 3. Setup Frontend

```bash
cd ../frontend
cp .env.example .env.local
# Fill in:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (from https://cloud.walletconnect.com)
# - NEXT_PUBLIC_BONFIRE_CORE_ADDRESS (from deployments.json)
# - NEXT_PUBLIC_BONFIRE_ASH_ADDRESS (from deployments.json)
# - NEXT_PUBLIC_PINATA_JWT (from https://app.pinata.cloud/keys — free tier)

npm install
npm run dev
```

Open http://localhost:3000

### 4. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
# Follow prompts. Add env vars in Vercel dashboard.
```

Or push to GitHub and connect to Vercel at vercel.com/new — it auto-detects Next.js.

### 5. Push to GitHub

```bash
cd ..  # root of project
git init
git add .
git commit -m "🔥 BaseBonfire v1"
gh repo create basedonfire --public --push
# or: git remote add origin https://github.com/YOUR_NAME/basedonfire.git && git push -u origin main
```

## Contract Architecture

### BonfireCore.sol
- State machine: DORMANT → BURNING → (auto) → DORMANT
- `ignite()` — light the fire when dormant
- `contribute(cid, contentType, emotionScore)` — throw something in
- `checkAndExtinguish()` — anyone can call after 5min timeout
- Points: word/emoji/feeling = +1s, image = +5s, audio = +10s

### BonfireAsh.sol (ERC-721)
- Minted automatically when a bonfire extinguishes
- Stores: burn duration, top 10 contributors, dominant emotion, contribution count
- On-chain SVG metadata — no external dependencies

## Content Points

| Type     | Seconds Added |
|----------|--------------|
| Word     | +1s          |
| Sentence | +1s          |
| Emoji    | +1s          |
| Feeling  | +1s          |
| Image    | +5s          |
| Audio    | +10s         |

## Emotion Colors

| Emotion | Color        |
|---------|-------------|
| Happy   | #FFD700 gold |
| Sad     | #4169E1 blue |
| Angry   | #DC143C red  |
| Fear    | #800080 purple |
| Mixed   | #FF8C00 orange |

## Deployed Contracts

| Contract    | Address | Network |
|-------------|---------|---------|
| BonfireCore | TBD     | Base Sepolia |
| BonfireAsh  | TBD     | Base Sepolia |

## Resources

- Base Faucet: https://faucet.base.org
- WalletConnect: https://cloud.walletconnect.com
- Pinata IPFS: https://app.pinata.cloud
- Basescan: https://sepolia.basescan.org
- The Graph: https://thegraph.com/studio

## License

MIT

export const BONFIRE_CORE_ABI = [
  // State & Views
  {
    "inputs": [],
    "name": "getBonfireInfo",
    "outputs": [
      { "name": "state", "type": "uint8" },
      { "name": "bonfireId", "type": "uint256" },
      { "name": "lastContrib", "type": "uint256" },
      { "name": "burnDuration", "type": "uint256" },
      { "name": "dominantEmotion", "type": "uint8" },
      { "name": "lastContent", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bonfireState",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastContributionTimestamp",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBurnDuration",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentBonfireId",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDominantEmotion",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [
      { "name": "cid", "type": "bytes32" },
      { "name": "contentType", "type": "uint8" },
      { "name": "emotionScore", "type": "uint8" }
    ],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ignite",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkAndExtinguish",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "bonfireId", "type": "uint256" },
      { "indexed": true, "name": "contributor", "type": "address" },
      { "indexed": false, "name": "contentType", "type": "uint8" },
      { "indexed": false, "name": "cid", "type": "bytes32" },
      { "indexed": false, "name": "pointsAdded", "type": "uint256" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "bonfireId", "type": "uint256" },
      { "indexed": true, "name": "igniter", "type": "address" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "BonfireIgnited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "bonfireId", "type": "uint256" },
      { "indexed": false, "name": "totalDuration", "type": "uint256" },
      { "indexed": false, "name": "dominantEmotion", "type": "uint8" },
      { "indexed": false, "name": "ashTokenId", "type": "uint256" }
    ],
    "name": "BonfireExtinguished",
    "type": "event"
  }
] as const;

export const BONFIRE_ASH_ABI = [
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getAshRecord",
    "outputs": [
      {
        "components": [
          { "name": "bonfireId", "type": "uint256" },
          { "name": "totalBurnDuration", "type": "uint256" },
          { "name": "topContributors", "type": "address[10]" },
          { "name": "lastCid", "type": "bytes32" },
          { "name": "dominantEmotion", "type": "uint8" },
          { "name": "totalContributions", "type": "uint256" },
          { "name": "reigniterAddress", "type": "address" },
          { "name": "extinguishedAt", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTokenId",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

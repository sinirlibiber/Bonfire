// Pinata IPFS upload utility
// Get your JWT from https://app.pinata.cloud/keys

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_BASE = "https://api.pinata.cloud";

export interface UploadResult {
  cid: string;
  cidBytes32: `0x${string}`;
  url: string;
}

export async function uploadTextToIPFS(content: string, name: string): Promise<UploadResult> {
  const blob = new Blob([content], { type: "text/plain" });
  return uploadBlobToIPFS(blob, name);
}

export async function uploadFileToIPFS(file: File): Promise<UploadResult> {
  return uploadBlobToIPFS(file, file.name);
}

async function uploadBlobToIPFS(blob: Blob, name: string): Promise<UploadResult> {
  if (!PINATA_JWT) {
    // Fallback: generate a deterministic mock CID for development
    console.warn("No Pinata JWT set, using mock CID for development");
    const mockCid = "Qm" + Math.random().toString(36).substring(2, 48);
    return {
      cid: mockCid,
      cidBytes32: stringToBytes32(mockCid),
      url: `https://gateway.pinata.cloud/ipfs/${mockCid}`,
    };
  }

  const formData = new FormData();
  formData.append("file", blob, name);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `basedonfire-${name}-${Date.now()}` })
  );
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  const res = await fetch(`${PINATA_BASE}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  const data = await res.json();
  const cid: string = data.IpfsHash;

  return {
    cid,
    cidBytes32: stringToBytes32(cid),
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}

// Convert a string (CID) to bytes32 for on-chain storage
export function stringToBytes32(str: string): `0x${string}` {
  const bytes = new TextEncoder().encode(str.slice(0, 32));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "0");
  return `0x${hex}`;
}

// Simple emotion detection based on keywords
export function detectEmotion(text: string): number {
  const lower = text.toLowerCase();
  const emotions: Record<number, string[]> = {
    0: ["happy", "joy", "love", "great", "amazing", "wonderful", "yay", "😊", "❤️", "🎉", "mutlu", "güzel", "harika"],
    1: ["sad", "cry", "miss", "lonely", "hurt", "pain", "😢", "😭", "üzgün", "hüzün", "ağla"],
    2: ["angry", "hate", "rage", "fury", "mad", "😠", "😡", "kızgın", "öfke"],
    3: ["fear", "scared", "afraid", "terror", "anxious", "😨", "😱", "korku", "korktum"],
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return Number(emotion);
    }
  }
  return 4; // mixed / unknown
}

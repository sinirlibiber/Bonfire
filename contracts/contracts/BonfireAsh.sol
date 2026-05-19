// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BonfireAsh is ERC721, Ownable {
    using Strings for uint256;

    struct AshRecord {
        uint256 bonfireId;
        uint256 totalBurnDuration;   // seconds
        address[10] topContributors;
        bytes32 lastCid;
        uint8 dominantEmotion;       // 0=happy,1=sad,2=angry,3=fear,4=mixed
        uint256 totalContributions;
        address reigniterAddress;
        uint256 extinguishedAt;      // block timestamp
    }

    uint256 public nextTokenId;
    address public bonfireCore;
    mapping(uint256 => AshRecord) public ashRecords;

    // emotion → color hex
    string[5] public emotionColors = [
        "#FFD700", // happy  → gold
        "#4169E1", // sad    → royal blue
        "#DC143C", // angry  → crimson
        "#800080", // fear   → purple
        "#FF8C00"  // mixed  → dark orange
    ];

    string[5] public emotionNames = ["Happy", "Sad", "Angry", "Fear", "Mixed"];

    event AshMinted(uint256 indexed tokenId, uint256 indexed bonfireId, uint8 dominantEmotion);

    constructor() ERC721("BaseBonfire Ash", "BFASH") Ownable(msg.sender) {}

    function setBonfireCore(address _core) external onlyOwner {
        bonfireCore = _core;
    }

    function mint(
        uint256 bonfireId,
        uint256 burnDuration,
        address[10] memory topContributors,
        bytes32 lastCid,
        uint8 dominantEmotion,
        uint256 totalContributions,
        address reigniter
    ) external returns (uint256) {
        require(msg.sender == bonfireCore, "Only BonfireCore");

        uint256 tokenId = ++nextTokenId;
        ashRecords[tokenId] = AshRecord({
            bonfireId: bonfireId,
            totalBurnDuration: burnDuration,
            topContributors: topContributors,
            lastCid: lastCid,
            dominantEmotion: dominantEmotion,
            totalContributions: totalContributions,
            reigniterAddress: reigniter,
            extinguishedAt: block.timestamp
        });

        _mint(address(this), tokenId); // mint to contract, publicly viewable

        emit AshMinted(tokenId, bonfireId, dominantEmotion);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        AshRecord memory r = ashRecords[tokenId];
        string memory color = emotionColors[r.dominantEmotion];
        string memory emotionName = emotionNames[r.dominantEmotion];

        string memory svg = _buildSVG(r, color, emotionName);
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"Ash Fragment #', tokenId.toString(),
            '","description":"A frozen memory of Bonfire #', r.bonfireId.toString(),
            ' on BaseBonfire. It burned for ', r.totalBurnDuration.toString(),
            ' seconds and felt ', emotionName,
            '.","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[',
            '{"trait_type":"Bonfire ID","value":', r.bonfireId.toString(), '},',
            '{"trait_type":"Burn Duration (s)","value":', r.totalBurnDuration.toString(), '},',
            '{"trait_type":"Dominant Emotion","value":"', emotionName, '"},',
            '{"trait_type":"Total Contributions","value":', r.totalContributions.toString(),
            '}]}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _buildSVG(AshRecord memory r, string memory color, string memory emotionName)
        internal
        pure
        returns (string memory)
    {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0a0a0a"/>',
            '<circle cx="200" cy="200" r="120" fill="', color, '" opacity="0.15"/>',
            '<circle cx="200" cy="200" r="80" fill="', color, '" opacity="0.25"/>',
            '<circle cx="200" cy="200" r="40" fill="', color, '" opacity="0.6"/>',
            '<text x="200" y="340" text-anchor="middle" fill="#ffffff" font-size="14" font-family="monospace">',
            'Bonfire #', r.bonfireId.toString(), ' &bull; ', emotionName,
            '</text>',
            '<text x="200" y="360" text-anchor="middle" fill="#888" font-size="11" font-family="monospace">',
            r.totalBurnDuration.toString(), 's &bull; ', r.totalContributions.toString(), ' contributions',
            '</text>',
            '</svg>'
        ));
    }

    function getAshRecord(uint256 tokenId) external view returns (AshRecord memory) {
        return ashRecords[tokenId];
    }
}

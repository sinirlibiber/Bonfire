// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BonfireAsh.sol";

contract BonfireCore {
    // ─── Enums & Types ───────────────────────────────────────────
    enum State { DORMANT, BURNING }
    enum ContentType { WORD, SENTENCE, EMOJI, EMOTION, AUDIO, IMAGE }
    enum Emotion { HAPPY, SAD, ANGRY, FEAR, MIXED }

    // ─── State ───────────────────────────────────────────────────
    State public bonfireState;
    uint256 public currentBonfireId;
    uint256 public lastContributionTimestamp;
    uint256 public bonfireStartTimestamp;
    uint256 public totalBurnDuration;
    address public bonfireAshContract;

    uint256 public constant EXTINGUISH_TIMEOUT = 5 minutes;

    // contributionCount[bonfireId][address] = points
    mapping(uint256 => mapping(address => uint32)) public contributionPoints;
    // contributors list per bonfire
    mapping(uint256 => address[]) public bonfireContributors;
    mapping(uint256 => mapping(address => bool)) public isContributor;

    // last 100 emotion scores
    uint8[100] public emotionRing;
    uint8 public emotionRingHead;
    uint8 public emotionRingCount;

    // last contribution CID
    bytes32 public lastCid;

    // reigniter of current bonfire
    address public currentReigniter;

    // ─── Events ──────────────────────────────────────────────────
    event ContributionMade(
        uint256 indexed bonfireId,
        address indexed contributor,
        uint8 contentType,
        bytes32 cid,
        uint256 pointsAdded,
        uint256 timestamp
    );
    event BonfireIgnited(uint256 indexed bonfireId, address indexed igniter, uint256 timestamp);
    event BonfireExtinguished(
        uint256 indexed bonfireId,
        uint256 totalDuration,
        uint8 dominantEmotion,
        uint256 ashTokenId
    );

    // ─── Constructor ──────────────────────────────────────────────
    constructor(address _ashContract) {
        bonfireAshContract = _ashContract;
        bonfireState = State.DORMANT;
    }

    // ─── Modifiers ───────────────────────────────────────────────
    modifier autoCheck() {
        if (bonfireState == State.BURNING) {
            if (block.timestamp - lastContributionTimestamp >= EXTINGUISH_TIMEOUT) {
                _extinguish();
            }
        }
        _;
    }

    // ─── External Functions ───────────────────────────────────────

    /// @notice Ignite the bonfire (only when DORMANT)
    function ignite() external autoCheck {
        require(bonfireState == State.DORMANT, "Bonfire already burning");
        currentBonfireId++;
        bonfireState = State.BURNING;
        bonfireStartTimestamp = block.timestamp;
        lastContributionTimestamp = block.timestamp;
        currentReigniter = msg.sender;

        // reset emotion ring
        emotionRingHead = 0;
        emotionRingCount = 0;

        emit BonfireIgnited(currentBonfireId, msg.sender, block.timestamp);
    }

    /// @notice Contribute to the bonfire
    /// @param cid IPFS CID of the content
    /// @param contentType 0=word,1=sentence,2=emoji,3=emotion,4=audio,5=image
    /// @param emotionScore 0=happy,1=sad,2=angry,3=fear,4=mixed
    function contribute(bytes32 cid, uint8 contentType, uint8 emotionScore) external autoCheck {
        require(bonfireState == State.BURNING, "Bonfire is not burning");
        require(contentType <= 5, "Invalid content type");
        require(emotionScore <= 4, "Invalid emotion score");

        uint32 points = _pointsForType(contentType);

        // update contributor tracking
        if (!isContributor[currentBonfireId][msg.sender]) {
            isContributor[currentBonfireId][msg.sender] = true;
            bonfireContributors[currentBonfireId].push(msg.sender);
        }
        contributionPoints[currentBonfireId][msg.sender] += points;

        // update burn duration
        totalBurnDuration += points;
        lastContributionTimestamp = block.timestamp;
        lastCid = cid;

        // update emotion ring
        emotionRing[emotionRingHead % 100] = emotionScore;
        emotionRingHead++;
        if (emotionRingCount < 100) emotionRingCount++;

        emit ContributionMade(currentBonfireId, msg.sender, contentType, cid, points, block.timestamp);
    }

    /// @notice Anyone can call this to trigger extinguish if timeout passed
    function checkAndExtinguish() external {
        require(bonfireState == State.BURNING, "Not burning");
        require(
            block.timestamp - lastContributionTimestamp >= EXTINGUISH_TIMEOUT,
            "Not yet timed out"
        );
        _extinguish();
    }

    // ─── Views ────────────────────────────────────────────────────

    function getDominantEmotion() public view returns (uint8) {
        if (emotionRingCount == 0) return 4; // mixed default
        uint32[5] memory counts;
        uint8 count = emotionRingCount;
        for (uint8 i = 0; i < count; i++) {
            counts[emotionRing[i]]++;
        }
        uint8 dominant = 0;
        for (uint8 i = 1; i < 5; i++) {
            if (counts[i] > counts[dominant]) dominant = i;
        }
        return dominant;
    }

    function getTopContributors(uint256 bonfireId) public view returns (address[10] memory top) {
        address[] storage contributors = bonfireContributors[bonfireId];
        uint256 len = contributors.length;

        // simple selection sort for top 10
        address[10] memory sorted;
        uint256 filledCount = len < 10 ? len : 10;

        // copy first filledCount
        for (uint256 i = 0; i < filledCount; i++) {
            sorted[i] = contributors[i];
        }
        // fill rest with address(0)
        // sort descending by points
        for (uint256 i = 0; i < filledCount; i++) {
            for (uint256 j = i + 1; j < filledCount; j++) {
                if (contributionPoints[bonfireId][sorted[j]] > contributionPoints[bonfireId][sorted[i]]) {
                    address tmp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = tmp;
                }
            }
        }
        // check remaining contributors
        for (uint256 i = filledCount; i < len; i++) {
            address candidate = contributors[i];
            if (contributionPoints[bonfireId][candidate] > contributionPoints[bonfireId][sorted[9]]) {
                sorted[9] = candidate;
                // bubble up
                for (uint256 j = 9; j > 0; j--) {
                    if (contributionPoints[bonfireId][sorted[j]] > contributionPoints[bonfireId][sorted[j-1]]) {
                        address tmp = sorted[j];
                        sorted[j] = sorted[j-1];
                        sorted[j-1] = tmp;
                    } else break;
                }
            }
        }
        return sorted;
    }

    function getBonfireInfo() external view returns (
        State state,
        uint256 bonfireId,
        uint256 lastContrib,
        uint256 burnDuration,
        uint8 dominantEmotion,
        bytes32 lastContent
    ) {
        return (
            bonfireState,
            currentBonfireId,
            lastContributionTimestamp,
            totalBurnDuration,
            getDominantEmotion(),
            lastCid
        );
    }

    // ─── Internal ────────────────────────────────────────────────

    function _extinguish() internal {
        uint256 burnedFor = block.timestamp - bonfireStartTimestamp;
        uint8 emotion = getDominantEmotion();
        address[10] memory top = getTopContributors(currentBonfireId);

        bonfireState = State.DORMANT;

        uint256 ashTokenId = BonfireAsh(bonfireAshContract).mint(
            currentBonfireId,
            burnedFor,
            top,
            lastCid,
            emotion,
            _contributorCount(currentBonfireId),
            currentReigniter
        );

        emit BonfireExtinguished(currentBonfireId, burnedFor, emotion, ashTokenId);

        // reset for next bonfire
        totalBurnDuration = 0;
        lastCid = bytes32(0);
        currentReigniter = address(0);
    }

    function _pointsForType(uint8 contentType) internal pure returns (uint32) {
        if (contentType == 4) return 10; // audio
        if (contentType == 5) return 5;  // image
        return 1;                         // word, sentence, emoji, emotion
    }

    function _contributorCount(uint256 bonfireId) internal view returns (uint256) {
        return bonfireContributors[bonfireId].length;
    }
}

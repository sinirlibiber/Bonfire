import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  BonfireIgnited,
  ContributionMade,
  BonfireExtinguished,
} from "../generated/BonfireCore/BonfireCore";
import {
  BonfireSession,
  Contribution,
  ContributorStats,
  GlobalStats,
} from "../generated/schema";

function getOrCreateGlobal(): GlobalStats {
  let stats = GlobalStats.load("global");
  if (!stats) {
    stats = new GlobalStats("global");
    stats.totalBonfires = BigInt.fromI32(0);
    stats.totalContributions = BigInt.fromI32(0);
    stats.totalBurnSeconds = BigInt.fromI32(0);
  }
  return stats;
}

export function handleBonfireIgnited(event: BonfireIgnited): void {
  let id = event.params.bonfireId.toString();
  let session = new BonfireSession(id);
  session.bonfireId = event.params.bonfireId;
  session.ignitedAt = event.params.timestamp;
  session.ignitedBy = event.params.igniter;
  session.totalContributions = BigInt.fromI32(0);
  session.save();

  let global = getOrCreateGlobal();
  global.totalBonfires = global.totalBonfires.plus(BigInt.fromI32(1));
  global.save();
}

export function handleContributionMade(event: ContributionMade): void {
  // Create contribution entity
  let contribId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let contrib = new Contribution(contribId);
  contrib.session = event.params.bonfireId.toString();
  contrib.contributor = event.params.contributor;
  contrib.contentType = event.params.contentType;
  contrib.cid = event.params.cid;
  contrib.pointsAdded = event.params.pointsAdded;
  contrib.timestamp = event.params.timestamp;
  contrib.blockNumber = event.block.number;
  contrib.save();

  // Update session
  let session = BonfireSession.load(event.params.bonfireId.toString());
  if (session) {
    session.totalContributions = session.totalContributions.plus(BigInt.fromI32(1));
    session.save();
  }

  // Update contributor stats
  let statsId = event.params.contributor.toHex() + "-" + event.params.bonfireId.toString();
  let stats = ContributorStats.load(statsId);
  if (!stats) {
    stats = new ContributorStats(statsId);
    stats.address = event.params.contributor;
    stats.bonfireId = event.params.bonfireId;
    stats.totalPoints = BigInt.fromI32(0);
    stats.contributionCount = BigInt.fromI32(0);
    stats.lastContributed = BigInt.fromI32(0);
  }
  stats.totalPoints = stats.totalPoints.plus(event.params.pointsAdded);
  stats.contributionCount = stats.contributionCount.plus(BigInt.fromI32(1));
  stats.lastContributed = event.params.timestamp;
  stats.save();

  // Update global
  let global = getOrCreateGlobal();
  global.totalContributions = global.totalContributions.plus(BigInt.fromI32(1));
  global.save();
}

export function handleBonfireExtinguished(event: BonfireExtinguished): void {
  let session = BonfireSession.load(event.params.bonfireId.toString());
  if (session) {
    session.extinguishedAt = event.block.timestamp;
    session.totalBurnDuration = event.params.totalDuration;
    session.dominantEmotion = event.params.dominantEmotion;
    session.ashTokenId = event.params.ashTokenId;
    session.save();
  }

  // Update global burn seconds
  let global = getOrCreateGlobal();
  global.totalBurnSeconds = global.totalBurnSeconds.plus(event.params.totalDuration);
  global.save();
}

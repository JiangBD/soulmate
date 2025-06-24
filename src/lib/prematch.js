// src/lib/prematch.js
globalThis.__myAppData = globalThis.__myAppData || { 
     users: new Map(),
    viewpoints: new Map(),
    userIdMap: new Map(),
possibleMatchesMap: new Map(),
matchesSet: new Map(),
userGeohashMap: new Map(),
    userBucketMap: new Map(),
prematchMap: new Map(),
entityLabelMap : new Map(),
viewpointIdContentMap : new Map(),
userViewpointIdsMap: new Map(),
quickVectorLookup : new Map(),
userViewpointMap : new Map(),
userNewMatchSet: new Set()
};

/**
 * prematchMap: Map<prematchId, { [userA]: boolean, [userB]: boolean }>
 *
 *   - prematchId = “smallerEmail_largerEmail” (alphabetical)
 *   - The value is an object whose keys are the two user_ids, each mapping to true/false for “liked”
 */
const prematchMap = globalThis.__myAppData.prematchMap;

/**
 * computePrematchId(a, b): string
 *   Ensures the two emails are sorted alphabetically and joined by “_”
 */
export function computePrematchId(userA, userB) {
  if (userA < userB) return `${userA}_${userB}`;
  return `${userB}_${userA}`;
}

/**
 * recordLike(myId, otherId): { isMutualMatch: boolean }
 *
 * - Finds the prematchId for (myId, otherId)
 * - If no entry exists, create { [smaller]: false, [larger]: false }
 * - Set value[myId] = true
 * - If after that both are true, return { isMutualMatch: true }, else false.
 */
export function recordLike(myId, otherId) {
  const pid = computePrematchId(myId, otherId);
  if (!prematchMap.has(pid)) {
    const entry = {};
    entry[myId < otherId ? myId : otherId] = false;
    entry[myId < otherId ? otherId : myId] = false;
    prematchMap.set(pid, entry);
  }

  const entry = prematchMap.get(pid);
  entry[myId] = true;

  const bothLiked = Object.values(entry).every((v) => v === true);
  return { isMutualMatch: bothLiked, prematchId: pid };
}

/**
 * getPrematchStatus(myId, otherId): { likedByMe: boolean, likedByThem: boolean }
 *   Returns false/true for each side (or null if no entry).
 */
export function getPrematchStatus(myId, otherId) {
  const pid = computePrematchId(myId, otherId);
  if (!prematchMap.has(pid)) return null;
  const entry = prematchMap.get(pid);
  return {
    likedByMe: !!entry[myId],
    likedByThem: !!entry[otherId],
  };
}

/**
 * clearPrematch(myId, otherId)
 *   Deletes the prematch entry entirely (e.g. if you want to “unlike” both).
 */
export function clearPrematch(myId, otherId) {
  const pid = computePrematchId(myId, otherId);
  prematchMap.delete(pid);
}

/**
 * getAllPrematches()
 *   (mainly for debugging) returns a shallow copy of the entire Map.
 */
export function getAllPrematches() {
  return Array.from(prematchMap.entries()).map(([pid, entry]) => ({
    prematchId: pid,
    status: entry,
  }));
}

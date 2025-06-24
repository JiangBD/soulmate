// src/lib/matches.js
import  {addNewMatch}  from './newmatch';

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
 * matchesSet: Map<prematchId, nonsense>
 *   Whenever two users both hit ❤️, we consider them a confirmed match.
 */
export const matchesSet = globalThis.__myAppData.matchesSet;

/**
 * addMatch(prematchId)
 */
export function addMatch(prematchId) {
  if (!matchesSet.has(prematchId))  {
     
    matchesSet.set(prematchId,new Date().toISOString());
    addNewMatch(prematchId);
  
  }
  // This is a no-op if the match already exists.
}

/**
 * hasMatch(matchId): boolean
 */
export function hasMatch(matchId) {
  return matchesSet.has(matchId);
}

/**
 * getAllMatches(): string[]
 *   Returns an array of all prematchIds that are now confirmed matches.
 */
export function getAllMatches() {
  return Array.from(matchesSet.keys());
}

/**
 * clearAllMatches()
 */
export function clearAllMatches() {
  matchesSet.clear();
}

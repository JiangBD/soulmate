// src/lib/possiblematches.js
import ngeohash from 'ngeohash';
import { cosineSimilarity } from '@/utils/cosinesimilarityworker';
import { hasMatch } from '@/lib/matches';
import { areDatingPreferencesMatched } from '@/lib/datingpreferences';
import {
  getUsersInNearbyCells,
  getUserGeohash,
  updateUserGeohash,
  getUsersInSameCell,      
} from './geohash';
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
 * possibleMatchesMap: Map<user_id, { currentIndex: number, possibleMatches: string[] }>
 *
 * For each user_id, we store:
 *   - currentIndex: the index in possibleMatches they’re currently viewing
 *   - possibleMatches: an array of other user_id strings, sorted by descending cosine similarity
 */
export const possibleMatchesMap = globalThis.__myAppData.possibleMatchesMap;
export const createNewPossibleMatchesEntry = (me) => {
    if (!possibleMatchesMap.has(me)) {
      // a) Ensure geohash is up to date
      const myHash4 = getUserGeohash(me);
      if (!myHash4) {
        throw new Error('api/recs line 100 User location not set');
      }
      // decode to center coordinates
      // const { latitude: myLat, longitude: myLon } = ngeohash.decode(myHash4);

      // b) Gather self + neighbor cells
      const neighbors = ngeohash.neighbors(myHash4);
      const cells = [myHash4, ...neighbors];

      // c) Collect all user_ids in those 9 cells, except self
      const candidates = new Set();
      cells.forEach((geoh4) => {
        const bucket = getUsersInSameCell(geoh4) || [];
        bucket.forEach((uid) => {
          if (uid !== me && areDatingPreferencesMatched(me, uid )  ) candidates.add(uid);
        });
      });
      // d) Filter by ALL user
      const filtered = [];
      for (let otherId of candidates) {
        const otherHash = getUserGeohash(otherId);
        if (!otherHash) continue;      
        filtered.push(otherId);        
      }

      // e) Compute cosine similarity & sort descending
      const scored = filtered.map((otherId) => {
        let score = 0;
        try {
          score = cosineSimilarity(me, otherId);
        } catch {
          score = 0;
        }
        return { userId: otherId, score };
      });
      scored.sort((a, b) => b.score - a.score);
      const sortedIds = scored.map((item) => item.userId);

      // f) Store in possibleMatchesMap
      possibleMatchesMap.set(me, {
        currentIndex: 0,
        possibleMatches: sortedIds,
      });
      console.log(`Created new possible matches entry for user ${me}`);
    }
 };

/**
 * getPossibleMatchesObject(user_id) → { possibleMatches, currentIndex } | null
 *   Returns the { possibleMatches, currentIndex } of user_id, or null if none.
 */
export function getPossibleMatchesObject(user_id) {
  const entry = possibleMatchesMap.get(user_id);
  if (!entry) return null;  
  return entry;
}

/**
 * getCurrentMatch(user_id) → string | null
 *   Returns the user_id at currentIndex, or null if none.
 */
export function getCurrentPrematch(user_id) {  
  const entry = possibleMatchesMap.get(user_id);
  if (!entry) return null;
  const { possibleMatches, currentIndex } = entry;

  if (currentIndex >= possibleMatches.length) return null;
  const nextPrematchId = possibleMatches[currentIndex];
  const tempoMatchId =(user_id <= nextPrematchId) ? `${user_id}_${nextPrematchId}` : `${nextPrematchId}_${user_id}`;

  
  return !hasMatch(tempoMatchId) ? nextPrematchId : null; // Ensure it’s not already a confirmed match
}

/**
 * advanceToNextMatch(user_id) → void
 *   Increments currentIndex (if not already at the end).
 */
export function advanceToNextMatch(user_id) {
  const entry = possibleMatchesMap.get(user_id);
  if (!entry) return;
  const { possibleMatches, currentIndex } = entry;  
  entry.currentIndex = currentIndex + 1;
  if (entry.currentIndex >= possibleMatches.length) entry.currentIndex = 0; // Loop back to start if at end
  console.log(`Advanced to prematch ${entry.currentIndex} for user ${user_id}`);
}

/**
 * resetMatches(user_id) → void
 *   Clears out any stored entry for this user.
 */
export function resetMatches(user_id) {
  possibleMatchesMap.delete(user_id);
}

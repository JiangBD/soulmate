// src/lib/geohash.js
import ngeohash from 'ngeohash';
import { existUserId } from './inmemory';
import {getPossibleMatchesObject, createNewPossibleMatchesEntry} from './possiblematches';
import { areDatingPreferencesMatched } from './datingpreferences';
import { cosineSimilarity } from '@/utils/cosinesimilarityworker';

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
 * userGeohashMap: Map<user_id, geohash4>
 * userBucketMap: Map<geohash4, Set<user_id>>
 */
const userGeohashMap = globalThis.__myAppData.userGeohashMap;
const userBucketMap = globalThis.__myAppData.userBucketMap;

/**
 * updateUserGeohash(user_id, lat, lng)
 *
 * - Computes 4-char geohash from (lat, lng)
 * - Removes the user from any previous bucket
 * - Inserts the user into the new bucket
 */
export function updateUserGeohash(user_id, lat, lng) {
  if (!existUserId(user_id)) {
    throw new Error(`Cannot set geohash: user "${user_id}" does not exist.`);
  }

  // 1) If user already had a geohash, remove from its old bucket
  if (userGeohashMap.has(user_id)) {
    const oldHash = userGeohashMap.get(user_id);
    const oldBucket = userBucketMap.get(oldHash);
    if (oldBucket) {
      oldBucket.delete(user_id);
      if (oldBucket.size === 0) {
        userBucketMap.delete(oldHash);
      }
    }
  }
  // 2) Compute new 4-character geohash
  const geohash4 = ngeohash.encode(lat, lng, 4);

  // 3) Save into userGeohashMap
  userGeohashMap.set(user_id, geohash4);

  // 4) Add to bucket for this geohash4
  if (!userBucketMap.has(geohash4)) {
    userBucketMap.set(geohash4, new Set());
  }
  userBucketMap.get(geohash4).add(user_id);

  createNewPossibleMatchesEntry(user_id); // Create possible matches for this user if not exists
  console.log(`geohash.js line 64: User ${user_id} updated geohash to`);
  AddUserToNeighborPossibleMatches(user_id, geohash4); // Add to possible matches of nearby users  
}

export function ReupdateUserGeohash(user_id){
const myHash4 = userGeohashMap.get(user_id);  
if (!myHash4) return; // No geohash to reupdate
const { latitude: myLat, longitude: myLon } = ngeohash.decode(myHash4);
updateUserGeohash(user_id, myLat, myLon);
}

const AddUserToNeighborPossibleMatches = (user_id, userGeohash4) => {
  console.log(`AddUserToNeighborPossibleMatches is called user_id ${user_id}`);
  const allNearbyUserIds = new Set();
  const neighborHashes = ngeohash.neighbors(userGeohash4);
  const allCells = [userGeohash4, ...neighborHashes];
  allCells.forEach((cell) => {    // get all user_ids in 9 cells except self
    const bucket = userBucketMap.get(cell); // get the Set<user_id>
    if (bucket) bucket.forEach((uid) => { if (uid !== user_id) allNearbyUserIds.add(uid);  });
  });
  allNearbyUserIds.forEach((nearbyUserId) => {
    const possibleMatchesObject = getPossibleMatchesObject(nearbyUserId);

    if (possibleMatchesObject && possibleMatchesObject.possibleMatches) {
    const possibleMatchesArray = possibleMatchesObject?.possibleMatches || [];
    if (!possibleMatchesArray.includes(user_id) && areDatingPreferencesMatched(user_id, nearbyUserId) ) {
      possibleMatchesArray.push(user_id);
      possibleMatchesObject.currentIndex = 0; // Reset index to 0
      possibleMatchesArray.sort((a, b) =>  cosineSimilarity(nearbyUserId ,b) - cosineSimilarity(nearbyUserId ,a) ); 
    }
    else if ( possibleMatchesArray.includes(user_id) )
    {
      possibleMatchesObject.currentIndex = 0; // Reset index to 0
      possibleMatchesArray.sort((a, b) =>  cosineSimilarity(nearbyUserId ,b) - cosineSimilarity(nearbyUserId ,a) );
    }
   }  

  });
  console.log(`AddUserToNeighborPossibleMatches is done user_id ${user_id}`);
}


/**
 * getUserGeohash(user_id) → string or null
 */
export function getUserGeohash(user_id) {
  return userGeohashMap.get(user_id) || null;
}

/**
 * getUsersInSameCell(geohash4) → string[]
 *   Returns all user_ids in that exact 4-char cell.
 */
export function getUsersInSameCell(geohash4) {
  const bucket = userBucketMap.get(geohash4);
  return bucket ? Array.from(bucket) : [];
}

/**
 * getUsersInNearbyCells(user_id) → string[]
 *
 * - Finds this user’s current 4-char geohash.
 * - Gathers neighbors = ngeohash.neighbors(geohash4).
 * - Returns every user_id in [selfCell, ...neighbors], excluding user_id itself.
 */
export function getUsersInNearbyCells(user_id) {
  const myHash = userGeohashMap.get(user_id);
  if (!myHash) {
    return [];
  }

  // 1) 8 neighbors of myHash
  const neighbors = ngeohash.neighbors(myHash);

  // 2) Collect user_ids from self + neighbors
  const allCells = [myHash, ...neighbors];
  const resultSet = new Set();
  
  allCells.forEach((cell) => {
    const bucket = userBucketMap.get(cell);
    if (bucket) {   
      bucket.forEach((uid) => {   
        if (uid !== user_id) { 
          resultSet.add(uid);
        }
      });
    }
  });

  return Array.from(resultSet);
}

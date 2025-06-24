
/*

import { v4 as uuidv4 } from 'uuid';
import ngeohash from 'ngeohash';

const users = new Map();         // key: user_id, value: { user_id, full_name, …, etc. }
const viewpoints = new Map();    // key: viewpoint_id, value: { … }

// <<<<<<< CONFLICT: Different approaches to tracking user IDs
// inmemory2.js uses Map, inmemory1.js uses Set
const userIdMap = new Map();     // key: user_id, value: user_id (from inmemory2.js)

// --- NEW FEATURES from inmemory2.js: Location tracking with geohash
const userCoordinatesMap = new Map(); // key: user_id, value: { lat, lng, geohash4 }
const userBuckets = new Map();        // key: geohash4, value: Set<user_id>

// --- Helper function with conflict in implementation
export function existUserId(user_id) {
// <<<<<<< CONFLICT: Different data structures used
  return userIdMap.has(user_id);  // inmemory2.js approach
}

// --- COMMON: No conflicts
export function getUser(user_id) {
  if (!existUserId(user_id)) return null;
  return users.get(user_id);
}

// --- COMMON: No conflicts in main logic
export function addUser({
  user_id,
  full_name,
  date_of_birth,
  gender,
  marital_status,
  self_intro,
  gender_preference,
  marital_status_preference,
  age_range,
}) {
  if (users.has(user_id)) throw new Error(`User ${user_id} already exists`);
  users.set(user_id, {
    user_id,
    full_name,
    date_of_birth,
    gender,
    marital_status,
    self_intro,
    gender_preference,
    marital_status_preference,
    age_range,
  });
  

  userIdMap.set(user_id, user_id);  // inmemory2.js approach
}

export function removeUser(user_id) {
  users.delete(user_id); 

  userIdMap.delete(user_id);  // inmemory2.js approach
  // Also remove any stored coordinates and from its bucket (inmemory2.js only)
  if (userCoordinatesMap.has(user_id)) {
    const { geohash4 } = userCoordinatesMap.get(user_id);
    userCoordinatesMap.delete(user_id);
    const bucket = userBuckets.get(geohash4);
    if (bucket) {
      bucket.delete(user_id);
      if (bucket.size === 0) userBuckets.delete(geohash4);
    }
  }
// =======
  // userIdSet.delete(user_id);  // inmemory1.js approach (missing this cleanup!)
// >>>>>>> END CONFLICT

  // Common: Remove their viewpoints
  for (let [vid, vp] of viewpoints) {
    if (vp.user_id === user_id) viewpoints.delete(vid);
  }
}

// --- COMMON: No conflicts
export function getAllUsers() {
  return Array.from(users.values());
}
export function getUser(user_id ) {
  if (!existUserId(user_id)) return null; // Check if user exists
  return users.get(user_id); // Return user details
  }



// --- COMMON: No conflicts
export function addViewpoint({ user_id, entity, full_content }) {
  const viewpoint_id = uuidv4();
  const vp = { viewpoint_id, user_id, entity, full_content };
  viewpoints.set(viewpoint_id, vp);
  return vp;
}

// --- COMMON: No conflicts
export function removeViewpoint(viewpoint_id) {
  viewpoints.delete(viewpoint_id);
}

// --- COMMON: No conflicts
export function getAllViewpoints() {
  return Array.from(viewpoints.values());
}

// ―――――――――――――――――――――――
// NEW FEATURES from inmemory2.js: Location tracking functionality
// ―――――――――――――――――――――――

// --- NEW: Update a user's location (lat/lng) in memory
export function updateUserLocation(user_id, lat, lng) {
  if (!existUserId(user_id)) {
    throw new Error(`User ${user_id} does not exist`);
  }
  // 1) If user already had a bucket, remove from its old cell
  if (userCoordinatesMap.has(user_id)) {
    const { geohash4: oldHash } = userCoordinatesMap.get(user_id);
    const oldBucket = userBuckets.get(oldHash);
    if (oldBucket) {
      oldBucket.delete(user_id);
      if (oldBucket.size === 0) {
        userBuckets.delete(oldHash);
      }
    }
  }

  // 2) Compute new 4-character geohash
  const geohash4 = ngeohash.encode(lat, lng, 4);

  // 3) Insert into userCoordinatesMap
  userCoordinatesMap.set(user_id, { lat, lng, geohash4 });

  // 4) Add to new bucket
  if (!userBuckets.has(geohash4)) {
    userBuckets.set(geohash4, new Set());
  }
  userBuckets.get(geohash4).add(user_id);
}

export function getUsersInCell(geohash4) {
  const bucket = userBuckets.get(geohash4);
  return bucket ? Array.from(bucket) : [];
}
// --- ENHANCED: Different return structures
export function dumpAll() {
// <<<<<<< CONFLICT: Different data included in dump
  return {
    users: getAllUsers(),
    userCoordinates: Array.from(userCoordinatesMap.entries()),  // inmemory2.js includes coordinates
    // viewpoints: getAllViewpoints(),  // inmemory2.js has this commented out
  };

}
*/
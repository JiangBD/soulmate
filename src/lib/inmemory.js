// src/lib/inmemory.js
import { v4 as uuidv4 } from 'uuid';
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

/** Map<user_id,{ user_id, full_name, date_of_birth, gender, marital_status,....}> */
const users = globalThis.__myAppData.users ;  
const viewpoints = globalThis.__myAppData.viewpoints;  // key: viewpoint_id, value: viewpoint object
const userIdMap = globalThis.__myAppData.userIdMap;   // key: user_id, value: user_id

export function existUserId(user_id) {  return userIdMap.has(user_id);    }

/**
 * getUser(user_id: string): user object  | null
 *   Returns the user object represented by this user_id, or null if not in existence yet
 */
export function getUser(user_id) {
  if (!existUserId(user_id)) return null;
  return users.get(user_id);
}

/**
 *   Adds a new user to the in-memory store. 
 */
export function addUser({ user_id, full_name, date_of_birth, gender, marital_status, self_intro, gender_preference, marital_status_preference, age_range,}) {
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
  userIdMap.set(user_id, user_id);
}
export const getDatingPreferences = (user_id) => {
  if (!existUserId(user_id)) return null;
  
  const {self_intro, gender_preference, marital_status_preference, age_range } = users.get(user_id);
  return {self_intro, gender_preference, marital_status_preference, age_range };
}
export const updatePreferences = (user_id, self_intro, gender_preference, marital_status_preference, age_range) => {
  if (!existUserId(user_id)) throw new Error(`User ${user_id} does not exist, cannot update preferences`); 
  const user = users.get(user_id);
  user.self_intro = self_intro;
  user.gender_preference = gender_preference;
  user.marital_status_preference = marital_status_preference;
  user.age_range = age_range;
  users.set(user_id, user); // maybe not necessary, but ensures the update is reflected in the Map
}


export function removeUser(user_id) {
  users.delete(user_id);
  userIdMap.delete(user_id);

  // also remove their viewpoints
  for (let [vid, vp] of viewpoints) {
    if (vp.user_id === user_id) viewpoints.delete(vid);
  }
}

export function getAllUsers() {
  return Array.from(users.values());
}

// -- Viewpoint table functions
export function addViewpoint({ user_id, entity, full_content }) {
  const viewpoint_id = uuidv4();
  const vp = { viewpoint_id, user_id, entity, full_content };
  viewpoints.set(viewpoint_id, vp);
  return vp;
}

export function removeViewpoint(viewpoint_id) {
  viewpoints.delete(viewpoint_id);
}
export function dumpAll() {
  return {
    users: getAllUsers()
 //   viewpoints: getAllViewpoints(),
  };
}
export function getAllViewpoints() {
  return Array.from(viewpoints.values());
}
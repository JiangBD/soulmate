//src/utils/cosinesimilarityworker.js
import  { ClaudeAI_ExpandedInitialEntityLabelPairs  } from './entitylabel.js';
// =======================
// 0. Constants and Setup
// =======================
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

let LABEL = [
  'POLITICIAN', 'FOOD', 'COMIC', 'COLLEGE', 'DRINK', 'TV_SERIES', 'TV_SERIES_CHARACTER',
  'USUKBAND', 'KPOPBAND', 'USUKSINGER', 'KPOPSINGER',
  'COLLEGE_COURSE', 'NOVEL', 'NOVEL_CHARACTER' , 'FAMOUS_SCIENTIST', 'SONG'
];
// Map from entity → label
export const entityLabelMap = globalThis.__myAppData.entityLabelMap;
const viewpointIdContentMap = globalThis.__myAppData.viewpointIdContentMap; // viewpointId -> full viewpoint string
export const getViewpointFullContent = (viewpointId) => { return viewpointIdContentMap.get(viewpointId) || null;}
export const removeViewpointFullContent = (viewpointId) => { viewpointIdContentMap.delete(viewpointId); }

const userViewpointIdsMap = globalThis.__myAppData.userViewpointIdsMap; // userId -> array of viewpointIds
export const getUserViewpointIds = (userId) => {
  return userViewpointIdsMap.get(userId) || [];
}
export const getFullViewpointContents = (userId) => {
  const viewpointIds = getUserViewpointIds(userId); //array of viewpointIds
  const fullContents = [];
  viewpointIds.forEach((viewpointId) => {
    const content = getViewpointFullContent(viewpointId);
    if (content) fullContents.push(content);
  });
  return fullContents;
}
export const getAllViewpointObjects = (user_id) => {
const allViewpointIds = getUserViewpointIds(user_id);
const allViewpointObjects = [];
 allViewpointIds.forEach((viewpointId) => {
    const viewpoint_id = viewpointId;
    const full_content = getViewpointFullContent(viewpointId);
    allViewpointObjects.push({ viewpoint_id, full_content} ) });
return allViewpointObjects;
}
export const deleteViewpoint = (user_id, viewpoint_id) => {
  const vpArray = getUserViewpointIds(user_id);
  const updatedArray = vpArray.filter(item => item !== viewpoint_id);
  userViewpointIdsMap.set(user_id, updatedArray);
  return true;
}

// Fetch all entities
export const allEntities = () => Array.from(entityLabelMap.keys()).sort();
// const topics = ['Hermione Granger' ];
// Initial entity-label strings

const initialEntityLabelPairs = ClaudeAI_ExpandedInitialEntityLabelPairs;

// Populate entityLabelMap
initialEntityLabelPairs.forEach(pair => {
  const [entity, label] = pair.split("-->").map(s => s.trim());
  if (!LABEL.includes(label)) { LABEL.push(label); } // Add new label if not already present
  entityLabelMap.set(entity, label);
});

// =======================
// 1. Memory Storage
// =======================

// user_id -> binary array indicating which labels are used
export const quickVectorLookup = globalThis.__myAppData.quickVectorLookup; // Map<user_id, binary array>

// viewpoint_id -> entity
export const userViewpointMap = globalThis.__myAppData.userViewpointMap;

// =======================
// 2. Utility Functions
// =======================

export function extractEntityAndContent(viewpointStr) {
  const idx = viewpointStr.indexOf(':');
  if (idx === -1) return [null, viewpointStr];
  const entity = viewpointStr.slice(0, idx).trim();
  const content = viewpointStr.slice(idx + 1).trim();
  return [entity, content];
}

function getLabelIndex(label) {
  return LABEL.indexOf(label);
}

// =======================
// 3. Main Functions
// =======================

export function registerViewpoint(userId, viewpointStr) {
  const [entity, content] = extractEntityAndContent(viewpointStr);
  if (!entityLabelMap.has(entity)) return false; // Unknown entity

  const label = entityLabelMap.get(entity);
  const labelIndex = getLabelIndex(label);
  if (labelIndex === -1) return false;

  // Update quickVectorLookup
  if (!quickVectorLookup.has(userId)) {
    quickVectorLookup.set(userId, Array(LABEL.length).fill(0));
  }
  quickVectorLookup.get(userId)[labelIndex] = 1;

  // Find next index for this label’s viewpoint
  let i = 0;
  while (userViewpointMap.has(`${userId}_${label}_${i}`)) {
    i++;
  }
  if (!userViewpointIdsMap.has(userId)){ userViewpointIdsMap.set(userId, []);}

  const vpId = `${userId}_${label}_${i}`;
  userViewpointMap.set(vpId, entity);
  viewpointIdContentMap.set(vpId, viewpointStr);
  userViewpointIdsMap.get(userId).push(vpId);


  return vpId || null; // Return viewpoint ID or true if no ID was generated
}


export const dumpAllViewpoints = () => {
  // === ADDED LOGGING ===
  console.log('🗺️ userViewpointMap:');
  console.log(Array.from(userViewpointMap.entries()));
  console.log('🔢 quickVectorLookup:');
  console.log(
    Array.from(quickVectorLookup.entries()).map(
      ([uid, vec]) => ({ userId: uid, vector: vec })
    )
  );
  // =====================
}
 
// Cosine similarity between two binary vectors
export const cosineSimilarity = (thisUserId, otherUserId) => {// user id strings
  const thisUserLabels = []; const otherUserLabels = [];
  const thisUserQuickVectorLookup = quickVectorLookup.get(thisUserId);
  const otherUserQuickVectorLookup = quickVectorLookup.get(otherUserId);
  for (let i = 0; i < LABEL.length; i++){ // Get all already defined labels
    if (thisUserQuickVectorLookup[i] === 1) thisUserLabels.push(LABEL[i]);  
    if (thisUserQuickVectorLookup[i] === 1 && otherUserQuickVectorLookup[i] === 1) otherUserLabels.push(LABEL[i]);    
  }
  if (thisUserLabels.length === 0 ) return 0; // No labels to compare

  const N = thisUserLabels.length; // 14, for example
  const [totalMatchesCount,nonEmptyContentCount] = getMatchedLabelsCount(thisUserId, otherUserId, otherUserLabels); // 10, for example
  const basicSimilarity = Math.round( Math.sqrt(totalMatchesCount / N) * 100) / 100; // Ratio of matched labels to total labels
  console.log(`🔍 Basic Cosine Similarity between ${thisUserId} and ${otherUserId}:` + basicSimilarity);
  const weightedSimilarity = Math.round( (0.85 * basicSimilarity)*100 ) / 100;
  console.log(`🔍 Weighted Cosine Similarity between ${thisUserId} and ${otherUserId}:` + weightedSimilarity);
  const nonEmptyContentSimilarity = totalMatchesCount !== 0 ? Math.round( (0.15 * basicSimilarity * (nonEmptyContentCount / totalMatchesCount)) * 100 )/ 100 : 0;
  console.log(`🔍 Non-Empty Content Similarity between ${thisUserId} and ${otherUserId}:` + nonEmptyContentSimilarity);
  const similarityScore = weightedSimilarity + nonEmptyContentSimilarity;
  console.log(`🔍 Cosine Similarity between ${thisUserId} and ${otherUserId}:` + similarityScore);


  return similarityScore; // Return the weighted similarity score
}

//const hasCommonElement = (arr1, arr2) => { return arr1.some(item => arr2.includes(item));  };

const hasNonEmptyContent = (viewpointId) => {
  const [,content] = extractEntityAndContent( getViewpointFullContent(viewpointId));
  return content && content.trim() !== '';
}


const getMatchedLabelsCount = (thisUserId,otherUserId, otherUserLabels) => {
  let totalMatchesCount = 0; let nonEmptyContentCount = 0;

  otherUserLabels.forEach((label) => { 
  
  const thisUserEntities = [];
  const otherUserEntities = [];

  const otherUserViewpointIds = [];
  let i = 0;
  while (userViewpointMap.has(`${thisUserId}_${label}_${i}`)) {
    thisUserEntities.push(userViewpointMap.get(`${thisUserId}_${label}_${i}`));
    i++;
  }
  i = 0;
  while (userViewpointMap.has(`${otherUserId}_${label}_${i}`)) {
    otherUserEntities.push(userViewpointMap.get(`${otherUserId}_${label}_${i}`));
    otherUserViewpointIds.push(`${otherUserId}_${label}_${i}`);

    i++;
  }
    totalMatchesCount += otherUserEntities.some((entity) => { return thisUserEntities.includes(entity); }) ? 1 : 0; // Count if there is at least one match for this label
   
    const isNonEmpty = otherUserEntities.some((entity) => {
    const hasMatchEntities = thisUserEntities.includes(entity); 
    const isNonEmptyContent = otherUserViewpointIds.some((viewpointId) => {
     return getViewpointFullContent(viewpointId).includes(entity) && hasNonEmptyContent(viewpointId);
     });
     return hasMatchEntities && isNonEmptyContent;
});
    nonEmptyContentCount +=  isNonEmpty   ? 1 : 0; // Count if there is at least one non-empty content for this label

  });

  console.log(`🔍 Total Matches Count between ${thisUserId} and ${otherUserId}:` + totalMatchesCount);
  console.log(`🔍 Non-Empty Content Count between ${thisUserId} and ${otherUserId}:` + nonEmptyContentCount);
  return [totalMatchesCount, nonEmptyContentCount];
};
export function compareUsers(userId1, userId2) {//usedId1 is the current user, usedId2 is the user to compare with
  const vecA = quickVectorLookup.get(userId1) || Array(LABEL.length).fill(0);
  const vecB = quickVectorLookup.get(userId2) || Array(LABEL.length).fill(0);
  return cosineSimilarity(vecA, vecB);
}
/*
registerViewpoint("luuducphong8802@gmail.com", "Donald Trump: Down with the tax tyrant!!!");
const similarity = compareUsers("luuducphong8802@gmail.com", "someoneelse@gmail.com");
*/
// src/lib/newmatch.js ----> new match for notifications
import fs from "fs";
const FILE_PATH = "@/../newmatches.txt";

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
if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, "");

const userNewMatchSet = globalThis.__myAppData.userNewMatchSet; 

export const addNewMatch = (new_match_id) =>
     { addMatch(new_match_id); console.log(`ADDING NEW MATCH ${new_match_id} `)  }

export const deleteNewMatch = (new_match_id) => { userNewMatchSet.delete(new_match_id);  }
export const getNewMatches = (user_id) => {
    return pullMatchesForUser(user_id);
}
 


// Get all matches for a user, and delete them from the file
function pullMatchesForUser(userId) {
  const lines = fs.readFileSync(FILE_PATH, "utf-8").split("\n").filter(Boolean);
  const kept = [];
  const found = [];

  for (const line of lines) {
    if (line.startsWith(userId + "_") || line.endsWith("_" + userId)) {
      if (line.endsWith('!')) {found.push(  line.replace('!','') ); kept.push(  line.replace('!','') ); }
      else { found.push(  line); }
    } else {
      kept.push(line);
    }
  }

  // Write back only the kept lines
  fs.writeFileSync(FILE_PATH, kept.join("\n") + (kept.length ? "\n" : ""));
  return found;
}

// Append a new match to the file (e.g., "alice_bob")
export function addMatch(newmatchid) {
  const line = newmatchid + '!';
  fs.appendFileSync(FILE_PATH, line + "\n");
  console.log("✅ Appended new match:", line);
}






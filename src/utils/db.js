// src/utils/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'abc123!', // your root password
  database: 'soulmate',
});

// Insert into user
export async function insertUser(user) {
  const { user_id, full_name, date_of_birth, gender, marital_status, self_intro } = user;
  await pool.query(
    `INSERT INTO user (user_id, full_name, date_of_birth, gender, marital_status, self_intro)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, date_of_birth, gender, marital_status, self_intro]
  );
}

// Insert or update preference
export async function insertPreference(pref) {
  const { user_id, gender_preference, marital_status_preference, age_range } = pref;
  await pool.query(
    `INSERT INTO preference (user_id, gender_preference, marital_status_preference, age_range)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE gender_preference = VALUES(gender_preference),
                             marital_status_preference = VALUES(marital_status_preference),
                             age_range = VALUES(age_range)`,
    [user_id, gender_preference, marital_status_preference, age_range]
  );
}

// Insert into matchid
export async function insertMatch(match_id) {
  await pool.query(`INSERT INTO matchid (match_id) VALUES (?)`, [match_id]);
}

// Insert viewpoint
export async function insertViewpoint(viewpoint_id, full_content) {
  await pool.query(
    `INSERT INTO viewpoint (viewpoint_id, full_content) VALUES (?, ?)`,
    [viewpoint_id, full_content]
  );
}

// Delete viewpoint
export async function deleteViewpoint(viewpoint_id) {
  await pool.query(`DELETE FROM viewpoint WHERE viewpoint_id = ?`, [viewpoint_id]);
}

// Insert message
export async function insertMessage({ sender, recipient, content, timestamp, seen }) {
  await pool.query(
    `INSERT INTO message (sender, recipient, timestamp, content, seen)
     VALUES (?, ?, ?, ?, ?)`,
    [sender, recipient, timestamp, content, seen]
  );
}

// Select messages by sender/recipient
export async function getMessages(sender, recipient) {
  const [rows] = await pool.query(
    `SELECT * FROM message WHERE sender = ? AND recipient = ? ORDER BY timestamp`,
    [sender, recipient]
  );
  return rows;
}

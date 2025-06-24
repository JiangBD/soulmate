CREATE DATABASE IF NOT EXISTS soulmate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soulmate;

CREATE TABLE user (
  user_id VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci PRIMARY KEY,
  full_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  date_of_birth VARCHAR(10) CHARACTER SET ascii COLLATE ascii_general_ci,
  gender ENUM('male', 'female', 'gay', 'lesbian'),
  marital_status ENUM('Single', 'Married', 'Divorced'),
  self_intro TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
);

CREATE TABLE preference (
  user_id VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci PRIMARY KEY,
  gender_preference ENUM('male', 'female', 'gay', 'lesbian'),
  marital_status_preference ENUM('Single', 'Married', 'Divorced'),
  age_range VARCHAR(20) CHARACTER SET ascii COLLATE ascii_general_ci
);

CREATE TABLE matchid (
  match_id VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci PRIMARY KEY
);

CREATE TABLE viewpoint (
  viewpoint_id VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci PRIMARY KEY,
  full_content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
);

CREATE TABLE message (
  sender VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci,
  recipient VARCHAR(255) CHARACTER SET ascii COLLATE ascii_general_ci,
  timestamp VARCHAR(50) CHARACTER SET ascii COLLATE ascii_general_ci,
  content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  seen BOOLEAN,
  PRIMARY KEY (sender, recipient, timestamp)
);

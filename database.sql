CREATE USER IF NOT EXISTS 'd1rp_bot'@'%' IDENTIFIED BY 'REPLACE_WITH_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON district_one_roleplay.* TO 'd1rp_bot'@'%';

CREATE TABLE IF NOT EXISTS verified_users (
  discord_id VARCHAR(20) NOT NULL PRIMARY KEY,
  verified_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS warnings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  discord_id VARCHAR(20) NOT NULL,
  moderator_id VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX warnings_discord_id_created_at (discord_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  channel_id VARCHAR(20) NOT NULL PRIMARY KEY,
  discord_id VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  ticket_type VARCHAR(32) NOT NULL DEFAULT 'support',
  reported_user_id VARCHAR(20) DEFAULT NULL,
  claimed_by VARCHAR(20) DEFAULT NULL,
  opened_at BIGINT NOT NULL,
  closed_at BIGINT DEFAULT NULL,
  closed_by VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

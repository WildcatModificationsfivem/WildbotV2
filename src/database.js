const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initialize() {
  for (const setting of ["MYSQL_USER", "MYSQL_DATABASE"]) {
    if (!process.env[setting]) {
      throw new Error(`Missing required MySQL configuration: ${setting}`);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verified_users (
      discord_id VARCHAR(20) PRIMARY KEY,
      verified_at BIGINT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS warnings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      discord_id VARCHAR(20) NOT NULL,
      moderator_id VARCHAR(20) NOT NULL,
      reason TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      INDEX warnings_discord_id_created_at (discord_id, created_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      channel_id VARCHAR(20) PRIMARY KEY,
      discord_id VARCHAR(20) NOT NULL,
      reason TEXT NOT NULL,
      ticket_type VARCHAR(32) NOT NULL DEFAULT 'support',
      reported_user_id VARCHAR(20),
      claimed_by VARCHAR(20),
      opened_at BIGINT NOT NULL,
      closed_at BIGINT,
      closed_by VARCHAR(20)
    )
  `);

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tickets'
  `);
  const existingColumns = new Set(columns.map(column => column.COLUMN_NAME));

  if (!existingColumns.has("ticket_type")) {
    await pool.query("ALTER TABLE tickets ADD COLUMN ticket_type VARCHAR(32) NOT NULL DEFAULT 'support'");
  }
  if (!existingColumns.has("reported_user_id")) {
    await pool.query("ALTER TABLE tickets ADD COLUMN reported_user_id VARCHAR(20)");
  }
  if (!existingColumns.has("claimed_by")) {
    await pool.query("ALTER TABLE tickets ADD COLUMN claimed_by VARCHAR(20)");
  }
}

async function isVerified(discordId) {
  const [rows] = await pool.execute("SELECT * FROM verified_users WHERE discord_id = ?", [discordId]);
  return rows[0];
}

async function addVerified(discordId, verifiedAt) {
  await pool.execute(`
    INSERT INTO verified_users (discord_id, verified_at)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE verified_at = VALUES(verified_at)
  `, [discordId, verifiedAt]);
}

async function removeVerified(discordId) {
  await pool.execute("DELETE FROM verified_users WHERE discord_id = ?", [discordId]);
}

async function addWarning(discordId, moderatorId, reason, createdAt) {
  await pool.execute(`
    INSERT INTO warnings (discord_id, moderator_id, reason, created_at)
    VALUES (?, ?, ?, ?)
  `, [discordId, moderatorId, reason, createdAt]);
}

async function getWarnings(discordId) {
  const [rows] = await pool.execute(
    "SELECT * FROM warnings WHERE discord_id = ? ORDER BY created_at DESC",
    [discordId]
  );
  return rows;
}

async function addTicket(channelId, discordId, reason, ticketType, reportedUserId, openedAt) {
  await pool.execute(`
    INSERT INTO tickets (channel_id, discord_id, reason, ticket_type, reported_user_id, opened_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [channelId, discordId, reason, ticketType, reportedUserId, openedAt]);
}

async function getOpenTicketByOwner(discordId) {
  const [rows] = await pool.execute(
    "SELECT * FROM tickets WHERE discord_id = ? AND closed_at IS NULL LIMIT 1",
    [discordId]
  );
  return rows[0];
}

async function getOpenTicketByChannel(channelId) {
  const [rows] = await pool.execute(
    "SELECT * FROM tickets WHERE channel_id = ? AND closed_at IS NULL",
    [channelId]
  );
  return rows[0];
}

async function getTicketByChannel(channelId) {
  const [rows] = await pool.execute("SELECT * FROM tickets WHERE channel_id = ?", [channelId]);
  return rows[0];
}

async function claimTicket(userId, channelId) {
  await pool.execute(`
    UPDATE tickets
    SET claimed_by = ?
    WHERE channel_id = ? AND closed_at IS NULL AND claimed_by IS NULL
  `, [userId, channelId]);
}

async function closeTicket(closedAt, closedBy, channelId) {
  await pool.execute(`
    UPDATE tickets
    SET closed_at = ?, closed_by = ?
    WHERE channel_id = ? AND closed_at IS NULL
  `, [closedAt, closedBy, channelId]);
}

module.exports = {
  initialize,
  isVerified,
  addVerified,
  removeVerified,
  addWarning,
  getWarnings,
  addTicket,
  getOpenTicketByOwner,
  getOpenTicketByChannel,
  getTicketByChannel,
  claimTicket,
  closeTicket
};

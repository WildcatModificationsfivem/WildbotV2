# WildBot Discord Bot

This is the Discord-only version.

## Command structure

Commands are stored individually under `commands/`:

- `commands/verification/`
- `commands/information/`
- `commands/moderation/`

The command handler automatically scans all subfolders. You can add a new `.js` command without editing `index.js` or `deploy-commands.js`.

## Install

```cmd
npm install
```

Create and select the `district_one_roleplay` database in MySQL before running
`database.sql`. Replace `REPLACE_WITH_A_STRONG_PASSWORD` in the file with a
strong password first. The script creates the tables and a `d1rp_bot` account
that can connect from any host. Copy `.env.example` to `.env`, then enter
your Discord token and MySQL connection settings:

Set `MYSQL_DATABASE` to `district_one_roleplay`, `MYSQL_USER` to `d1rp_bot`,
and `MYSQL_PASSWORD` to the same password. Set `MYSQL_HOST` and `MYSQL_PORT`
to match your MySQL server. The `%` host permits remote connection attempts;
restrict MySQL network access with your firewall or hosting provider.

Existing SQLite records are not imported automatically; the bot uses the
configured MySQL database after this change.

Deploy:

```cmd
npm run deploy
```

Start:

```cmd
npm start
```

## Verification

Run `/setup` in the channel where you want the verification panel.

Users can also use `/verify`.

The bot assigns `VERIFIED_ROLE_ID`.

The bot's highest role must be above the Verified role and it needs Manage Roles.

## Important

There is no FiveM HTTP/API verification in this version.

CREATE TABLE online_rooms (
  code TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL,
  rev INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX online_rooms_expires_idx ON online_rooms (expires_at);

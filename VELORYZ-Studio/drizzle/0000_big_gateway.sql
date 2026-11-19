CREATE TABLE `cms_admins` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_history` (
	`id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`payload` text NOT NULL,
	`summary` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_media` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`published` text NOT NULL,
	`draft` text NOT NULL,
	`published_version` integer DEFAULT 0 NOT NULL,
	`draft_version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);

CREATE TABLE `studio_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`title` text NOT NULL,
	`amount_paise` integer NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`checkout_url` text NOT NULL,
	`token` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `studio_payments_token_unique` ON `studio_payments` (`token`);
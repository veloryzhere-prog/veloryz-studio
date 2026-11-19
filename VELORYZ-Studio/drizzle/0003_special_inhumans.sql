CREATE TABLE `studio_ai_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`provider` text DEFAULT 'gemini' NOT NULL,
	`model` text NOT NULL,
	`key_ciphertext` text DEFAULT '' NOT NULL,
	`key_iv` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);

CREATE TABLE `studio_enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`service` text NOT NULL,
	`budget` text NOT NULL,
	`preferred_date` text NOT NULL,
	`preferred_time` text NOT NULL,
	`company` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`fingerprint` text NOT NULL,
	`rate_key` text NOT NULL,
	`network_key` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `studio_enquiries_reference_unique` ON `studio_enquiries` (`reference`);--> statement-breakpoint
CREATE INDEX `enquiry_created` ON `studio_enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `enquiry_email_rate` ON `studio_enquiries` (`rate_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `enquiry_network_rate` ON `studio_enquiries` (`network_key`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `enquiry_confirmed_slot` ON `studio_enquiries` (`preferred_date`,`preferred_time`) WHERE "studio_enquiries"."status" = 'confirmed';
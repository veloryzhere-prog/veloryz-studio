import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const cmsState = sqliteTable('cms_state', {
  id: integer('id').primaryKey(),
  published: text('published').notNull(),
  draft: text('draft').notNull(),
  publishedVersion: integer('published_version').notNull().default(0),
  draftVersion: integer('draft_version').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
export const cmsHistory = sqliteTable('cms_history', {
  id: text('id').primaryKey(),
  revision: integer('revision').notNull(),
  payload: text('payload').notNull(),
  summary: text('summary').notNull(),
  actor: text('actor').notNull(),
  createdAt: text('created_at').notNull(),
});
export const cmsAdmins = sqliteTable('cms_admins', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  createdAt: text('created_at').notNull(),
});
export const cmsMedia = sqliteTable('cms_media', {
  id: text('id').primaryKey(),
  storageKey: text('storage_key').notNull(),
  filename: text('filename').notNull(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  archived: integer('archived').notNull().default(0),
  actor: text('actor').notNull(),
  createdAt: text('created_at').notNull(),
});

export const studioEnquiries = sqliteTable('studio_enquiries', {
 id: text('id').primaryKey(), reference: text('reference').notNull().unique(),
 name: text('name').notNull(),email: text('email').notNull(),phone: text('phone').notNull(),
 service: text('service').notNull(),budget: text('budget').notNull(),preferredDate: text('preferred_date').notNull(),preferredTime: text('preferred_time').notNull(),
 company: text('company').notNull(),message: text('message').notNull(),status: text('status').notNull().default('new'),notes: text('notes').notNull().default(''),version: integer('version').notNull().default(0),
 fingerprint: text('fingerprint').notNull(),rateKey: text('rate_key').notNull(),networkKey: text('network_key').notNull(),createdAt: text('created_at').notNull(),updatedAt: text('updated_at').notNull(),
},t=>[index('enquiry_created').on(t.createdAt),index('enquiry_email_rate').on(t.rateKey,t.createdAt),index('enquiry_network_rate').on(t.networkKey,t.createdAt),uniqueIndex('enquiry_confirmed_slot').on(t.preferredDate,t.preferredTime).where(sql`${t.status} = 'confirmed'`)]);

export const studioLimits = sqliteTable('studio_limits', {
 id:text('id').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull(),
});
export const studioPayments = sqliteTable('studio_payments', {
 id:text('id').primaryKey(),reference:text('reference').notNull(),title:text('title').notNull(),amountPaise:integer('amount_paise').notNull(),status:text('status').notNull().default('requested'),checkoutUrl:text('checkout_url').notNull(),token:text('token').notNull().unique(),version:integer('version').notNull().default(0),createdAt:text('created_at').notNull(),
});

export const studioAiSettings = sqliteTable('studio_ai_settings', {
 id:integer('id').primaryKey(),provider:text('provider').notNull().default('gemini'),model:text('model').notNull(),keyCiphertext:text('key_ciphertext').notNull().default(''),keyIv:text('key_iv').notNull().default(''),version:integer('version').notNull().default(0),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull(),
});

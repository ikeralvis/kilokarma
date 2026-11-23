CREATE TYPE "public"."event_scope" AS ENUM('individual', 'group');--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "scope" "event_scope" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "subcategories" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "scope" "event_scope" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "accent_color" text DEFAULT '#9ec4f4' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "trip_xp" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "xp" integer DEFAULT 5 NOT NULL;
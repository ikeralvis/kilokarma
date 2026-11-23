CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'confirmed');--> statement-breakpoint
ALTER TABLE "redemptions" ADD COLUMN "status" "redemption_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "redemptions" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
UPDATE "redemptions" SET "status" = 'confirmed', "confirmed_at" = "created_at";

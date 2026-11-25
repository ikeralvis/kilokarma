ALTER TABLE "redemptions" ADD COLUMN "requested_by" text;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_requested_by_profiles_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
UPDATE "redemptions" SET "requested_by" = "from_user_id" WHERE "requested_by" IS NULL;

CREATE TYPE "public"."friend_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"origin" text DEFAULT '' NOT NULL,
	"destination" text NOT NULL,
	"distance_km" numeric(8, 2) NOT NULL,
	"friend_id" text,
	"driver" text DEFAULT 'me' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"addressee_id" text NOT NULL,
	"status" "friend_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"friend_code" text NOT NULL,
	"fuel_price_per_l" numeric(6, 3) DEFAULT '1.650' NOT NULL,
	"consumption_l100" numeric(5, 2) DEFAULT '6.50' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_friend_code_unique" UNIQUE("friend_code")
);
--> statement-breakpoint
CREATE TABLE "redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"concept" text NOT NULL,
	"credits_redeemed" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_passengers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"passenger_id" text NOT NULL,
	"credits_owed" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"driver_id" text NOT NULL,
	"origin" text DEFAULT '' NOT NULL,
	"destination" text NOT NULL,
	"distance_km" numeric(8, 2) NOT NULL,
	"fuel_price_per_l" numeric(6, 3) NOT NULL,
	"consumption_l100" numeric(5, 2) NOT NULL,
	"cost_eur" numeric(8, 2) NOT NULL,
	"total_credits" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_owner_id_profiles_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_friend_id_profiles_user_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_profiles_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_profiles_user_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_from_user_id_profiles_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_to_user_id_profiles_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_passengers" ADD CONSTRAINT "trip_passengers_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_passengers" ADD CONSTRAINT "trip_passengers_passenger_id_profiles_user_id_fk" FOREIGN KEY ("passenger_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_profiles_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_pair_unique" ON "friendships" USING btree ("requester_id","addressee_id");--> statement-breakpoint
CREATE INDEX "redemptions_from_idx" ON "redemptions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "redemptions_to_idx" ON "redemptions" USING btree ("to_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_passengers_unique" ON "trip_passengers" USING btree ("trip_id","passenger_id");--> statement-breakpoint
CREATE INDEX "trip_passengers_passenger_idx" ON "trip_passengers" USING btree ("passenger_id");--> statement-breakpoint
CREATE INDEX "trips_driver_idx" ON "trips" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "trips_created_idx" ON "trips" USING btree ("created_at");
CREATE TABLE "offline_messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"payload" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"address" text PRIMARY KEY NOT NULL,
	"subscription" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "offline_messages_recipient_idx" ON "offline_messages" USING btree ("recipient","id");
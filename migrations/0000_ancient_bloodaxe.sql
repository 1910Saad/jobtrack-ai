CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"location" varchar(255),
	"job_url" text,
	"salary" varchar(100),
	"status" varchar(50) DEFAULT 'Wishlist' NOT NULL,
	"applied_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_matchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"resume_name" varchar(255) NOT NULL,
	"job_description" text NOT NULL,
	"match_score" integer NOT NULL,
	"candidate_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"matching_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"missing_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"job_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

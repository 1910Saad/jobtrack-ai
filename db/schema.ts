import {
  pgTable,
  serial,
  text,
  varchar,
  date,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  company: varchar("company", { length: 255 }).notNull(),

  jobTitle: varchar("job_title", { length: 255 }).notNull(),

  location: varchar("location", { length: 255 }),

  jobUrl: text("job_url"),

  salary: varchar("salary", { length: 100 }),

  status: varchar("status", { length: 50 })
    .notNull()
    .default("Wishlist"),

  appliedDate: date("applied_date"),

  notes: text("notes"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const resumeMatchers = pgTable("resume_matchers", {
  id: serial("id").primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(),

  resumeName: varchar("resume_name", { length: 255 }).notNull(),

  jobDescription: text("job_description").notNull(),

  matchScore: integer("match_score").notNull(),

  candidateSkills: jsonb("candidate_skills").notNull().default([]),

  matchingSkills: jsonb("matching_skills").notNull().default([]),

  missingSkills: jsonb("missing_skills").notNull().default([]),

  jobRequirements: jsonb("job_requirements").notNull().default([]),

  recommendations: jsonb("recommendations").notNull().default([]),

  summary: text("summary").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
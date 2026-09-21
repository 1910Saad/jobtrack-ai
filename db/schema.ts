import {
  pgTable,
  serial,
  text,
  varchar,
  date,
  timestamp,
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
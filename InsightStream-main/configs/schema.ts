// configs/schema.ts
import { integer, pgTable, varchar, json } from "drizzle-orm/pg-core";

// ✅ Users table
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

// ✅ Thumbnails table (camelCase)
export const AiThumbnailTable = pgTable("thumbnails", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userInput: varchar("userInput", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1000 }),
  refImage: varchar("refImage", { length: 500 }),
  userEmail: varchar("userEmail", { length: 255 }).references(() => usersTable.email),
  createdOn: varchar("createdOn", { length: 100 }),
});

// ✅ AI Content table (camelCase)
export const AiContentTable = pgTable("aiContent", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userInput: varchar("userInput", { length: 500 }),
  content: json("content"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  userEmail: varchar("userEmail", { length: 255 }).references(() => usersTable.email),
  createdOn: varchar("createdOn", { length: 100 }),
});

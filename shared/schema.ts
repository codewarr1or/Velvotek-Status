import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("operational"), // operational, degraded, outage
  responseTime: integer("response_time").default(0),
  uptime: real("uptime").default(100),
  lastChecked: timestamp("last_checked").defaultNow(),
});

export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("investigating"), // investigating, identified, monitoring, resolved
  severity: text("severity").notNull().default("minor"), // minor, major, critical
  affectedServices: jsonb("affected_services").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow(),
  cpuUsage: real("cpu_usage").notNull(),
  cpuFrequency: real("cpu_frequency").notNull(),
  coreUsages: jsonb("core_usages").notNull().default([]),
  memoryTotal: real("memory_total").notNull(),
  memoryUsed: real("memory_used").notNull(),
  memoryCache: real("memory_cache").notNull(),
  memoryFree: real("memory_free").notNull(),
  networkDownload: real("network_download").notNull(),
  networkUpload: real("network_upload").notNull(),
  networkInterface: text("network_interface").notNull().default("eth0"),
  loadAverage: jsonb("load_average").notNull().default([]),
  uptime: integer("uptime").notNull(),
});

export const processes = pgTable("processes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pid: integer("pid").notNull(),
  name: text("name").notNull(),
  command: text("command").notNull(),
  threads: integer("threads").notNull(),
  user: text("user").notNull(),
  memory: text("memory").notNull(),
  cpuUsage: real("cpu_usage").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, lastChecked: true });
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({ id: true, timestamp: true });
export const insertProcessSchema = createInsertSchema(processes).omit({ id: true, timestamp: true });

// Types
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;
export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof insertProcessSchema>;

// Admin users table for status page administration
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// VPS connections table for managing multiple servers
export const vpsConnections = pgTable("vps_connections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: integer("port").default(22).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin schemas and types
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVpsConnectionSchema = createInsertSchema(vpsConnections).omit({ id: true, createdAt: true, updatedAt: true });

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type VpsConnection = typeof vpsConnections.$inferSelect;
export type InsertVpsConnection = z.infer<typeof insertVpsConnectionSchema>;

// WebSocket message types
export interface WebSocketMessage {
  type: 'system_update' | 'service_update' | 'incident_update' | 'process_update';
  data: any;
}

export interface SystemUpdate {
  metrics: SystemMetrics;
  services: Service[];
  processes: Process[];
}

import { db } from "./db";
import { visitorStats, type InsertVisitorStat, type VisitorStat } from "@shared/schema";
import { eq, asc, and, desc, sql } from "drizzle-orm";

// وظائف تتبع زوار الموقع
export async function addVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat> {
  const result = await db.insert(visitorStats).values(stat).returning();
  return result[0];
}

export async function getVisitorStatsByDate(startDate: Date, endDate: Date): Promise<VisitorStat[]> {
  return db
    .select()
    .from(visitorStats)
    .where(
      and(
        // Using >= for start date and <= for end date
        sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
        sql`${visitorStats.visitDate} <= ${endDate.toISOString()}`
      )
    )
    .orderBy(desc(visitorStats.visitDate));
}

export async function getVisitorStatsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(visitorStats);
  return result[0]?.count || 0;
}

export async function getPageViewsByUrl(): Promise<{ url: string; count: number }[]> {
  const result = await db
    .select({
      url: visitorStats.pageUrl,
      count: sql<number>`count(*)`
    })
    .from(visitorStats)
    .groupBy(visitorStats.pageUrl)
    .orderBy(desc(sql<number>`count(*)`));
  
  return result as { url: string; count: number }[];
}

export async function getVisitorStatsByDateRange(days: number): Promise<{ date: string; count: number }[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await db
    .select({
      date: sql<string>`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)`
    })
    .from(visitorStats)
    .where(
      and(
        sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
        sql`${visitorStats.visitDate} <= ${endDate.toISOString()}`
      )
    )
    .groupBy(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`)
    .orderBy(asc(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`));
  
  return result as { date: string; count: number }[];
}

export async function getVisitorStatsByCountry(): Promise<{ country: string; count: number }[]> {
  const result = await db
    .select({
      country: visitorStats.countryCode,
      count: sql<number>`count(*)`
    })
    .from(visitorStats)
    .where(sql`${visitorStats.countryCode} IS NOT NULL`)
    .groupBy(visitorStats.countryCode)
    .orderBy(desc(sql<number>`count(*)`));
  
  // Filter out any null values and convert to the expected type
  return result
    .filter(item => item.country !== null)
    .map(item => ({ 
      country: item.country as string,
      count: item.count 
    }));
}

export async function getVisitorStatsByDevice(): Promise<{ device: string; count: number }[]> {
  const result = await db
    .select({
      device: visitorStats.deviceType,
      count: sql<number>`count(*)`
    })
    .from(visitorStats)
    .where(sql`${visitorStats.deviceType} IS NOT NULL`)
    .groupBy(visitorStats.deviceType)
    .orderBy(desc(sql<number>`count(*)`));
  
  // Filter out any null values and convert to the expected type
  return result
    .filter(item => item.device !== null)
    .map(item => ({ 
      device: item.device as string,
      count: item.count 
    }));
}
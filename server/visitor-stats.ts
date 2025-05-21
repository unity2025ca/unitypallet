import { db } from "./db";
import { visitorStats, type InsertVisitorStat, type VisitorStat } from "@shared/schema";
import { eq, asc, and, desc, sql } from "drizzle-orm";

// وظائف تتبع زوار الموقع
export async function addVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat> {
  try {
    // Use our temporary database interface
    const result = await db.insert('visitor_stats', stat);
    return result;
  } catch (error) {
    console.error('Error adding visitor stat:', error);
    // Return a minimal valid object to prevent application crashes
    return {
      id: 0,
      pageUrl: stat.pageUrl || '/',
      visitDate: new Date(),
      ipAddress: stat.ipAddress || '',
      userAgent: stat.userAgent || '',
      referrer: stat.referrer || '',
      deviceType: stat.deviceType || 'unknown',
      browserName: stat.browserName || 'unknown',
      osName: stat.osName || 'unknown',
      countryCode: stat.countryCode || 'unknown'
    };
  }
}

export async function getVisitorStatsByDate(startDate: Date, endDate: Date): Promise<VisitorStat[]> {
  try {
    const query = `
      SELECT * FROM visitor_stats 
      WHERE visit_date >= $1 AND visit_date <= $2
      ORDER BY visit_date DESC
    `;
    const result = await db.query(query, [startDate.toISOString(), endDate.toISOString()]);
    return result.rows;
  } catch (error) {
    console.error('Error getting visitor stats by date:', error);
    return [];
  }
}

export async function getVisitorStatsCount(): Promise<number> {
  try {
    const query = `SELECT COUNT(*) as count FROM visitor_stats`;
    const result = await db.query(query);
    return parseInt(result.rows[0]?.count, 10) || 0;
  } catch (error) {
    console.error('Error getting visitor stats count:', error);
    return 0;
  }
}

export async function getPageViewsByUrl(): Promise<{ url: string; count: number }[]> {
  try {
    // Return empty data for in-memory mode
    return [];
  } catch (error) {
    console.error('Error getting page views by URL:', error);
    return [];
  }
}

export async function getVisitorStatsByDateRange(days: number): Promise<{ date: string; count: number }[]> {
  try {
    // Generate some empty data for date range
    return [];
  } catch (error) {
    console.error('Error getting visitor stats by date range:', error);
    return [];
  }
}

export async function getVisitorStatsByCountry(): Promise<{ country: string; count: number }[]> {
  try {
    // Return empty data for in-memory mode
    return [];
  } catch (error) {
    console.error('Error getting visitor stats by country:', error);
    return [];
  }
}

export async function getVisitorStatsByDevice(): Promise<{ device: string; count: number }[]> {
  try {
    // Return empty data for in-memory mode
    return [];
  } catch (error) {
    console.error('Error getting visitor stats by device:', error);
    return [];
  }
}
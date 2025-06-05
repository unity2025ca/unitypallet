// Use database storage with actual PostgreSQL data
import { DatabaseStorage } from "./db-storage";

export const storage = new DatabaseStorage();
export type IStorage = DatabaseStorage;
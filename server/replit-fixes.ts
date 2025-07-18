// Replit-specific fixes to prevent crashes

// Disable problematic features in Replit environment
export function isReplitEnvironment(): boolean {
  return process.env.REPLIT_DEPLOYMENT === 'true' || 
         process.env.REPLIT_DEPLOYMENT === '1' ||
         process.env.REPLIT_DOMAIN?.includes('replit.app') ||
         process.env.REPLIT_DOMAIN?.includes('replit.dev') ||
         process.env.REPLIT_DB_URL !== undefined ||
         process.env.REPLIT_SLUG !== undefined;
}

// Override backup functions for Replit
export function getReplitSafeConfig() {
  if (isReplitEnvironment()) {
    return {
      disableBackup: true,
      reducedMemoryUsage: true,
      simplifiedLogging: true
    };
  }
  return {
    disableBackup: false,
    reducedMemoryUsage: false,
    simplifiedLogging: false
  };
}

// Safe backup stub for Replit
export function getReplitBackupStatus() {
  return {
    available: false,
    message: 'Backup disabled in Replit environment',
    lastBackup: null
  };
}

// Memory-safe data processing
export function processDataSafely<T>(data: T[], chunkSize: number = 100): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

// Safe console logging with memory limits
export function safeLog(message: string, data?: any) {
  try {
    if (data && typeof data === 'object') {
      const stringified = JSON.stringify(data);
      if (stringified.length > 500) {
        console.log(message, '[Large object - truncated]');
      } else {
        console.log(message, data);
      }
    } else {
      console.log(message, data);
    }
  } catch (error) {
    console.log(message, '[Error serializing data]');
  }
}
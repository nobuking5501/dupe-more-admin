// Enhanced logging utility for admin panel
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Maximum number of logs to keep in memory

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogEntry['level'],
    category: string,
    message: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: this.getSessionId(),
    };
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('admin_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('admin_session_id', sessionId);
    }
    return sessionId;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? console.error :
                           entry.level === 'warn' ? console.warn :
                           entry.level === 'debug' ? console.debug : console.log;
      
      consoleMethod(`[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`, 
                   entry.data ? entry.data : '');
    }

    // Send to server in production (optional)
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendLogToServer(entry);
    }
  }

  private async sendLogToServer(entry: LogEntry): Promise<void> {
    try {
      // Only send error and warn logs to server to avoid spam
      if (entry.level === 'error' || entry.level === 'warn') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  // Public methods
  info(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('info', category, message, data);
    this.addLog(entry);
  }

  warn(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('warn', category, message, data);
    this.addLog(entry);
  }

  error(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('error', category, message, data);
    this.addLog(entry);
  }

  debug(category: string, message: string, data?: any): void {
    const entry = this.createLogEntry('debug', category, message, data);
    this.addLog(entry);
  }

  // API specific methods
  apiRequest(endpoint: string, method: string, data?: any): void {
    this.info('API_REQUEST', `${method} ${endpoint}`, data);
  }

  apiResponse(endpoint: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.addLog(this.createLogEntry(level, 'API_RESPONSE', `${endpoint} - ${status}`, data));
  }

  apiError(endpoint: string, error: any): void {
    this.error('API_ERROR', `${endpoint} failed`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  // Supabase specific methods
  supabaseQuery(table: string, operation: string, data?: any): void {
    this.debug('SUPABASE_QUERY', `${operation} on ${table}`, data);
  }

  supabaseError(table: string, operation: string, error: any): void {
    this.error('SUPABASE_ERROR', `${operation} on ${table} failed`, error);
  }

  // Claude API specific methods
  claudeRequest(prompt: string): void {
    this.info('CLAUDE_REQUEST', 'Sending request to Claude API', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...'
    });
  }

  claudeResponse(response: string): void {
    this.info('CLAUDE_RESPONSE', 'Received response from Claude API', {
      responseLength: response.length,
      responsePreview: response.substring(0, 100) + '...'
    });
  }

  claudeError(error: any): void {
    this.error('CLAUDE_ERROR', 'Claude API request failed', error);
  }

  // User action tracking
  userAction(action: string, details?: any): void {
    this.info('USER_ACTION', action, details);
  }

  // Get logs for debugging
  getLogs(level?: LogEntry['level'], category?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });
  }

  // Export logs for support
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_session_id');
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, data?: any) => logger.error(category, message, data),
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  
  // Shortcuts for common operations
  api: {
    request: (endpoint: string, method: string, data?: any) => logger.apiRequest(endpoint, method, data),
    response: (endpoint: string, status: number, data?: any) => logger.apiResponse(endpoint, status, data),
    error: (endpoint: string, error: any) => logger.apiError(endpoint, error),
  },
  
  supabase: {
    query: (table: string, operation: string, data?: any) => logger.supabaseQuery(table, operation, data),
    error: (table: string, operation: string, error: any) => logger.supabaseError(table, operation, error),
  },
  
  claude: {
    request: (prompt: string) => logger.claudeRequest(prompt),
    response: (response: string) => logger.claudeResponse(response),
    error: (error: any) => logger.claudeError(error),
  },
  
  user: (action: string, details?: any) => logger.userAction(action, details),
};
// Error handling utilities for better user experience and debugging

// Security: Error types for better categorization
export enum ErrorType {
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    NOT_FOUND = 'NOT_FOUND',
    RATE_LIMIT = 'RATE_LIMIT',
    DATABASE = 'DATABASE',
    NETWORK = 'NETWORK',
    FILE_UPLOAD = 'FILE_UPLOAD',
    INTERNAL = 'INTERNAL',
    EXTERNAL_API = 'EXTERNAL_API',
}

// Security: Error severity levels
export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

// Security: Base error class
export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly metadata: Record<string, any> | undefined;

    constructor(
        message: string,
        type: ErrorType = ErrorType.INTERNAL,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        code: string = 'UNKNOWN_ERROR',
        statusCode: number = 500,
        isOperational: boolean = true,
        metadata?: Record<string, any>
    ) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.severity = severity;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.metadata = metadata;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

// Security: Specific error classes
export class ValidationError extends AppError {
    constructor(message: string, metadata?: Record<string, any>) {
        super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 'VALIDATION_ERROR', 400, true, metadata);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required', metadata?: Record<string, any>) {
        super(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, 'AUTHENTICATION_ERROR', 401, true, metadata);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied', metadata?: Record<string, any>) {
        super(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 'AUTHORIZATION_ERROR', 403, true, metadata);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', metadata?: Record<string, any>) {
        super(message, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 'NOT_FOUND_ERROR', 404, true, metadata);
        this.name = 'NotFoundError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests', metadata?: Record<string, any>) {
        super(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 'RATE_LIMIT_ERROR', 429, true, metadata);
        this.name = 'RateLimitError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed', metadata?: Record<string, any>) {
        super(message, ErrorType.DATABASE, ErrorSeverity.HIGH, 'DATABASE_ERROR', 500, true, metadata);
        this.name = 'DatabaseError';
    }
}

export class FileUploadError extends AppError {
    constructor(message: string = 'File upload failed', metadata?: Record<string, any>) {
        super(message, ErrorType.FILE_UPLOAD, ErrorSeverity.MEDIUM, 'FILE_UPLOAD_ERROR', 400, true, metadata);
        this.name = 'FileUploadError';
    }
}

// Security: Error logger interface
export interface ErrorLogger {
    log(error: AppError, context?: Record<string, any>): void;
    logError(error: Error, context?: Record<string, any>): void;
}

// Security: Console error logger (replace with proper logging service in production)
export class ConsoleErrorLogger implements ErrorLogger {
    log(error: AppError, context?: Record<string, any>): void {
        const logData = {
            timestamp: new Date().toISOString(),
            name: error.name,
            message: error.message,
            type: error.type,
            severity: error.severity,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack,
            metadata: error.metadata,
            context,
        };

        if (error.severity === ErrorSeverity.CRITICAL) {
            console.error('🚨 CRITICAL ERROR:', logData);
        } else if (error.severity === ErrorSeverity.HIGH) {
            console.error('❌ HIGH ERROR:', logData);
        } else if (error.severity === ErrorSeverity.MEDIUM) {
            console.warn('⚠️ MEDIUM ERROR:', logData);
        } else {
            console.log('ℹ️ LOW ERROR:', logData);
        }
    }

    logError(error: Error, context?: Record<string, any>): void {
        const appError = error instanceof AppError ? error : new AppError(
            error.message,
            ErrorType.INTERNAL,
            ErrorSeverity.MEDIUM,
            'UNKNOWN_ERROR',
            500,
            false,
            { originalError: error.name }
        );
        this.log(appError, context);
    }
}

// Security: Error handler class
export class ErrorHandler {
    private logger: ErrorLogger;

    constructor(logger: ErrorLogger = new ConsoleErrorLogger()) {
        this.logger = logger;
    }

    // Security: Handle errors in API routes
    handleApiError(error: unknown, context?: Record<string, any>): { error: string; statusCode: number } {
        if (error instanceof AppError) {
            this.logger.log(error, context);
            return {
                error: error.message,
                statusCode: error.statusCode,
            };
        }

        if (error instanceof Error) {
            this.logger.logError(error, context);
            return {
                error: 'Internal server error',
                statusCode: 500,
            };
        }

        // Handle unknown errors
        const unknownError = new AppError(
            'An unexpected error occurred',
            ErrorType.INTERNAL,
            ErrorSeverity.HIGH,
            'UNKNOWN_ERROR',
            500,
            false,
            { originalError: String(error) }
        );
        this.logger.log(unknownError, context);

        return {
            error: 'Internal server error',
            statusCode: 500,
        };
    }

    // Security: Handle errors in React components
    handleComponentError(error: Error, errorInfo?: React.ErrorInfo): void {
        const appError = new AppError(
            error.message,
            ErrorType.INTERNAL,
            ErrorSeverity.MEDIUM,
            'COMPONENT_ERROR',
            500,
            true,
            { componentStack: errorInfo?.componentStack }
        );
        this.logger.log(appError);
    }

    // Security: Create user-friendly error messages
    getUserFriendlyMessage(error: AppError): string {
        switch (error.type) {
            case ErrorType.VALIDATION:
                return 'Please check your input and try again.';
            case ErrorType.AUTHENTICATION:
                return 'Please log in to continue.';
            case ErrorType.AUTHORIZATION:
                return 'You don\'t have permission to perform this action.';
            case ErrorType.NOT_FOUND:
                return 'The requested resource was not found.';
            case ErrorType.RATE_LIMIT:
                return 'Too many requests. Please try again later.';
            case ErrorType.FILE_UPLOAD:
                return 'File upload failed. Please try again.';
            case ErrorType.DATABASE:
                return 'A database error occurred. Please try again.';
            case ErrorType.NETWORK:
                return 'Network error. Please check your connection.';
            case ErrorType.EXTERNAL_API:
                return 'External service error. Please try again later.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }

    // Security: Check if error should be reported
    shouldReportError(error: AppError): boolean {
        return error.severity >= ErrorSeverity.MEDIUM && error.isOperational;
    }

    // Security: Get error context for debugging
    getErrorContext(error: AppError): Record<string, any> {
        return {
            type: error.type,
            severity: error.severity,
            code: error.code,
            statusCode: error.statusCode,
            isOperational: error.isOperational,
            metadata: error.metadata,
            stack: error.stack,
        };
    }
}

// Security: Global error handler instance
export const errorHandler = new ErrorHandler();

// Security: Error boundary hook for React components
export function useErrorHandler() {
    return {
        handleError: (error: Error, _context?: Record<string, any>) => {
            errorHandler.handleComponentError(error);
        },
        createError: (
            message: string,
            type: ErrorType = ErrorType.INTERNAL,
            severity: ErrorSeverity = ErrorSeverity.MEDIUM
        ) => {
            return new AppError(message, type, severity);
        },
    };
}

// Security: Async error wrapper
export function withErrorHandling<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: Record<string, any>
): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            errorHandler.handleApiError(error, context);
            throw error;
        }
    };
} 
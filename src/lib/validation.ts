import { NextRequest } from 'next/server';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

export class Validator {
  private errors: ValidationError[] = [];
  private data: any = {};

  constructor(private requestBody: any) {
    this.data = { ...requestBody };
  }

  // Required field validation
  required(field: string, message?: string): this {
    const value = this.data[field];
    if (value === undefined || value === null || value === '') {
      this.addError(field, message || `${field} is required`, 'REQUIRED');
    }
    return this;
  }

  // String validation
  string(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && typeof value !== 'string') {
      this.addError(field, message || `${field} must be a string`, 'INVALID_TYPE');
    }
    return this;
  }

  // Email validation
  email(field: string, message?: string): this {
    const value = this.data[field];
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.addError(field, message || `${field} must be a valid email`, 'INVALID_EMAIL');
    }
    return this;
  }

  // Password validation
  password(field: string, message?: string): this {
    const value = this.data[field];
    if (value && value.length < 8) {
      this.addError(field, message || `${field} must be at least 8 characters`, 'WEAK_PASSWORD');
    }
    if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      this.addError(field, message || `${field} must contain uppercase, lowercase, and number`, 'WEAK_PASSWORD');
    }
    return this;
  }

  // Number validation
  number(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && (isNaN(Number(value)) || value === '')) {
      this.addError(field, message || `${field} must be a number`, 'INVALID_TYPE');
    } else if (value !== undefined) {
      this.data[field] = Number(value);
    }
    return this;
  }

  // Integer validation
  integer(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && (!Number.isInteger(Number(value)) || value === '')) {
      this.addError(field, message || `${field} must be an integer`, 'INVALID_TYPE');
    } else if (value !== undefined) {
      this.data[field] = parseInt(value, 10);
    }
    return this;
  }

  // Min value validation
  min(field: string, minValue: number, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && Number(value) < minValue) {
      this.addError(field, message || `${field} must be at least ${minValue}`, 'MIN_VALUE');
    }
    return this;
  }

  // Max value validation
  max(field: string, maxValue: number, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && Number(value) > maxValue) {
      this.addError(field, message || `${field} must be at most ${maxValue}`, 'MAX_VALUE');
    }
    return this;
  }

  // Length validation
  length(field: string, minLength: number, maxLength: number, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && (value.length < minLength || value.length > maxLength)) {
      this.addError(field, message || `${field} must be between ${minLength} and ${maxLength} characters`, 'INVALID_LENGTH');
    }
    return this;
  }

  // Pattern validation
  pattern(field: string, regex: RegExp, message?: string): this {
    const value = this.data[field];
    if (value && !regex.test(value)) {
      this.addError(field, message || `${field} format is invalid`, 'INVALID_PATTERN');
    }
    return this;
  }

  // Boolean validation
  boolean(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && typeof value !== 'boolean') {
      this.addError(field, message || `${field} must be a boolean`, 'INVALID_TYPE');
    }
    return this;
  }

  // Array validation
  array(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && !Array.isArray(value)) {
      this.addError(field, message || `${field} must be an array`, 'INVALID_TYPE');
    }
    return this;
  }

  // Object validation
  object(field: string, message?: string): this {
    const value = this.data[field];
    if (value !== undefined && (typeof value !== 'object' || Array.isArray(value))) {
      this.addError(field, message || `${field} must be an object`, 'INVALID_TYPE');
    }
    return this;
  }

  // Custom validation
  custom(field: string, validator: (value: any) => boolean, message: string): this {
    const value = this.data[field];
    if (value !== undefined && !validator(value)) {
      this.addError(field, message, 'CUSTOM_VALIDATION');
    }
    return this;
  }

  // Sanitize string (remove HTML tags, trim whitespace)
  sanitize(field: string): this {
    const value = this.data[field];
    if (typeof value === 'string') {
      this.data[field] = value.trim().replace(/<[^>]*>/g, '');
    }
    return this;
  }

  // Add custom error
  addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }

  // Get validation result
  validate(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      data: this.errors.length === 0 ? this.data : undefined,
    };
  }
}

// Utility function to create validator from request
export function validateRequest(requestBody: any): Validator {
  return new Validator(requestBody);
}

// Common validation schemas
export const authValidation = {
  login: (data: any) => validateRequest(data)
    .required('email')
    .email('email')
    .required('password')
    .string('password')
    .validate(),

  register: (data: any) => validateRequest(data)
    .required('email')
    .email('email')
    .required('password')
    .password('password')
    .required('name')
    .string('name')
    .length('name', 2, 50)
    .sanitize('name')
    .validate(),

  resetPassword: (data: any) => validateRequest(data)
    .required('email')
    .email('email')
    .validate(),

  changePassword: (data: any) => validateRequest(data)
    .required('currentPassword')
    .string('currentPassword')
    .required('newPassword')
    .password('newPassword')
    .validate(),
};

export const productValidation = {
  create: (data: any) => validateRequest(data)
    .required('name')
    .string('name')
    .length('name', 3, 255)
    .sanitize('name')
    .required('category')
    .string('category')
    .required('basePrice')
    .number('basePrice')
    .min('basePrice', 0)
    .required('baseUnitId')
    .string('baseUnitId')
    .optional('description')
    .string('description')
    .sanitize('description')
    .validate(),

  update: (data: any) => validateRequest(data)
    .optional('name')
    .string('name')
    .length('name', 3, 255)
    .sanitize('name')
    .optional('category')
    .string('category')
    .optional('basePrice')
    .number('basePrice')
    .min('basePrice', 0)
    .optional('description')
    .string('description')
    .sanitize('description')
    .validate(),
};

export const cartValidation = {
  addItem: (data: any) => validateRequest(data)
    .required('productId')
    .string('productId')
    .required('quantity')
    .integer('quantity')
    .min('quantity', 1)
    .max('quantity', 100)
    .optional('unitId')
    .string('unitId')
    .validate(),

  updateItem: (data: any) => validateRequest(data)
    .required('quantity')
    .integer('quantity')
    .min('quantity', 1)
    .max('quantity', 100)
    .validate(),
};

// Middleware helper for validation
export function withValidation(validationFn: (data: any) => ValidationResult) {
  return (handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        const body = await req.json();
        const validation = validationFn(body);

        if (!validation.isValid) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              message: 'Please check your input data',
              details: validation.errors,
            },
            { status: 400 }
          );
        }

        return handler(req, validation.data);
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Invalid request body',
            message: 'Request body must be valid JSON',
          },
          { status: 400 }
        );
      }
    };
  };
}


export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function validateRegistration(data: {
  name: string
  email: string
  password: string
}) {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 8 characters long'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors)
  }
} 
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: Record<string, string>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function handleAPIError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ValidationError) {
    return new NextResponse(
      JSON.stringify({ errors: error.errors }),
      { status: 400 }
    )
  }

  if (error instanceof APIError) {
    return new NextResponse(
      JSON.stringify({ 
        error: error.message,
        errors: error.errors 
      }),
      { status: error.statusCode }
    )
  }

  return new NextResponse(
    JSON.stringify({ error: 'Internal server error' }),
    { status: 500 }
  )
} 
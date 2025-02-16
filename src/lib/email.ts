import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a 
            href="${resetUrl}" 
            style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;"
          >
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `
  })
} 
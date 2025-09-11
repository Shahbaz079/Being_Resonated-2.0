import * as SibApiV3Sdk from '@sendinblue/client'

// Initialize SendinBlue API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY || ''

if (SENDINBLUE_API_KEY) {
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, SENDINBLUE_API_KEY)
} else {
  console.warn('Missing SENDINBLUE_API_KEY environment variable - email sending disabled')
}

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // If no API key is configured, log the email instead of sending it
    if (!SENDINBLUE_API_KEY) {
      console.log('EMAIL SENDING DISABLED - Would send email:', {
        to: options.to,
        subject: options.subject,
        html: options.html ? options.html.substring(0, 100) + '...' : 'No HTML content' // First 100 chars
      })
      return
    }

    const emailData = {
      sender: { email: 'shahbaz@beingresonated.com', name: 'Being Resonated' },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text || options.html?.replace(/<[^>]*>/g, ''), // Strip HTML as fallback
    }

    await apiInstance.sendTransacEmail(emailData)
    console.log('Email sent successfully to:', options.to)
  } catch (error: any) {
    console.error('Error sending email:', error)
    
    // Check if it's an IP restriction error
    if (error.body && error.body.code === 'unauthorized' && error.body.message && error.body.message.includes('IP address')) {
      console.error('Sendinblue IP restriction error. Email not sent. Message:', error.body.message)
      // Don't throw error, just log it - we don't want to break the login flow
      return
    }
    
    // Check if it's an API key error
    if (error.body && error.body.code === 'unauthorized') {
      console.error('Sendinblue API key is not enabled. Email not sent.')
      // Don't throw error, just log it - we don't want to break the login flow
      return
    }
    
    // For other errors, we'll still throw but with better context
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }
}

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Being Resonated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { 
          display: inline-block; 
          padding: 15px 30px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0; 
          font-weight: bold;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Being Resonated!</h1>
          <p>Social Media Platform for IIEST Shibpur</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for joining Being Resonated! Please click the button below to verify your email address and complete your registration.</p>
          <p>Once verified, you'll be automatically logged in and can start connecting with fellow students.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email & Login</a>
          </div>
          <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a></small></p>
          <p><strong>This link will expire in 24 hours.</strong></p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>&copy; 2024 Being Resonated - IIEST Shibpur</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Being Resonated',
    html,
    text: `Welcome to Being Resonated! Please verify your email by visiting: ${verificationUrl}`,
  })
}

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Login OTP - Being Resonated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
        .otp-code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #667eea; 
          letter-spacing: 8px; 
          background: #e7f0ff; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 10px; 
          display: inline-block;
          border: 2px dashed #667eea;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 20px; }
          .otp-code { font-size: 24px; letter-spacing: 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Login OTP - Being Resonated</h1>
        </div>
        <div class="content">
          <h2>Your One-Time Password</h2>
          <p>Enter this code on the login page to access your account:</p>
          <div class="otp-code">${otp}</div>
          <p><strong>This code will expire in 10 minutes for security.</strong></p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Never share your OTP with anyone. Being Resonated will never ask for your OTP.</p>
          <p>&copy; 2024 Being Resonated - IIEST Shibpur</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Your Login OTP - Being Resonated',
    html,
    text: `Your login OTP for Being Resonated is: ${otp}. This code expires in 10 minutes.`,
  })
}
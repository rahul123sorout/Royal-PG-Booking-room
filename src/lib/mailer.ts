import nodemailer from 'nodemailer';

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log(`\n=============================================`);
  console.log(`📩 [EMAIL OTP DELIVERED]`);
  console.log(`Recipient: ${email}`);
  console.log(`OTP Code:  ${otp}`);
  console.log(`=============================================\n`);

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass,
        },
      });

      const mailOptions = {
        from: `"Royal PG Noida" <${user}>`,
        to: email,
        subject: 'Royal PG Verification Code',
        text: `Your security verification OTP code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #bc8e50; text-align: center; font-family: 'Playfair Display', serif; margin-bottom: 20px;">ROYAL PG NOIDA</h2>
            <p>Dear Valued Guest / Resident,</p>
            <p>You requested a security verification code. Please enter the OTP below to complete the action:</p>
            <div style="background-color: #fbf8f3; border: 1px solid #ebdec3; border-radius: 8px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #bc8e50; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes. If you did not initiate this request, please contact our help desk.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 11px; text-align: center; text-transform: uppercase;">
              Royal Chambers Managed Accommodations &bull; Noida
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email OTP sent successfully to ${email} using Gmail`);
      return true;
    } catch (err) {
      console.error("Failed to send OTP via SMTP transporter:", err);
      return false;
    }
  } else {
    console.warn("Nodemailer: EMAIL_USER and EMAIL_PASS are missing in environment.");
    return false;
  }
}

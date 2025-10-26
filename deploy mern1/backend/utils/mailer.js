const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

async function sendOtpEmail(to, code, purpose) {
  const subject = 'Fight Wisdom OTP';
  const text = `Welcome to Fight Wisdom, and the OTP is ${code}. It is valid for 5 minutes.`;
  const html = `<p>Welcome to <b>Fight Wisdom</b>, and the OTP is <b>${code}</b>.</p><p>It is valid for <b>5 minutes</b>.</p>`;
  return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail };
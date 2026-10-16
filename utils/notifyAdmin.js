// Sends an instant alert to the admin's phone when a visitor submits the
// contact / project-booking form. Failures are logged but NEVER block the
// visitor's submission (the lead is already saved in the database).
//
// Pick a channel with NOTIFY_CHANNEL in .env:
//   telegram  -> free, easiest (Telegram bot)
//   whatsapp  -> free (CallMeBot WhatsApp gateway)
//   email     -> free, via Gmail SMTP (App Password)
//   sms       -> Fast2SMS (India, paid)
//   none      -> disable alerts
// You can use several at once: NOTIFY_CHANNEL=telegram,whatsapp

import nodemailer from "nodemailer";

const buildText = (c) =>
  [
    "🏗️ NEW PROJECT ENQUIRY",
    `Name: ${c.name}`,
    `Phone: ${c.phone || "-"}`,
    `Email: ${c.email || "-"}`,
    `Project: ${c.projectType || "-"}`,
    `Message: ${String(c.message || "-").slice(0, 300)}`,
  ].join("\n");

const sendTelegram = async (text) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) throw new Error("Telegram env vars missing");
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
};

// WhatsApp via CallMeBot (free). One-time setup: see README.
const sendWhatsApp = async (text) => {
  const { WHATSAPP_PHONE, CALLMEBOT_API_KEY } = process.env;
  if (!WHATSAPP_PHONE || !CALLMEBOT_API_KEY) throw new Error("WhatsApp env vars missing");
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(WHATSAPP_PHONE)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(CALLMEBOT_API_KEY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CallMeBot ${res.status}: ${await res.text()}`);
};

// SMS via Fast2SMS (India)
const sendSms = async (text) => {
  const { FAST2SMS_API_KEY, ADMIN_PHONE } = process.env;
  if (!FAST2SMS_API_KEY || !ADMIN_PHONE) throw new Error("Fast2SMS env vars missing");
  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: { authorization: FAST2SMS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ route: "q", numbers: ADMIN_PHONE, message: text }),
  });
  if (!res.ok) throw new Error(`Fast2SMS ${res.status}: ${await res.text()}`);
};

// Turn raw SMTP errors into a plain-English fix.
const explainEmailError = (err) => {
  const m = `${err.code || ""} ${err.message || ""}`;
  if (/EAUTH|535|Invalid login|Username and Password not accepted/i.test(m))
    return "Gmail rejected the login. Use a 16-character App Password (needs 2-Step Verification ON), not your normal Gmail password. Create a new one at https://myaccount.google.com/apppasswords";
  if (/Application-specific password/i.test(m))
    return "Gmail needs an App Password, not your normal password.";
  if (/ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ESOCKET|EDNS|ECONNECTION/i.test(m))
    return "Cannot reach Gmail. Check your internet, or whether a firewall/antivirus/VPN is blocking port 465 or 587.";
  return "";
};

// Email via Gmail SMTP (free). Use a Gmail "App Password", not your normal password.
export const buildTransporter = () => {
  const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
  // Google shows App Passwords in groups of 4 with spaces; strip them.
  const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  if (!EMAIL_USER || !EMAIL_PASS) throw new Error("EMAIL_USER / EMAIL_PASS missing in .env");
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

const sendEmail = async (text, c) => {
  const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
  const to = (process.env.NOTIFY_EMAIL_TO || "").trim() || EMAIL_USER;
  try {
    await buildTransporter().sendMail({
      from: `"Website Enquiry" <${EMAIL_USER}>`,
      to,
      replyTo: c.email,
      subject: `New enquiry from ${c.name}${c.projectType ? ` - ${c.projectType}` : ""}`,
      text,
    });
  } catch (err) {
    const hint = explainEmailError(err);
    throw new Error(hint ? `${err.message}\n   FIX: ${hint}` : err.message);
  }
};

const senders = { telegram: sendTelegram, whatsapp: sendWhatsApp, sms: sendSms, email: sendEmail };

const notifyAdmin = async (contact) => {
  const channels = (process.env.NOTIFY_CHANNEL || "none")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && s !== "none");
  if (!channels.length) return;

  console.log(`[notify] new enquiry from ${contact.name} -> sending via: ${channels.join(", ")}`);
  const text = buildText(contact);
  await Promise.all(
    channels.map(async (ch) => {
      const send = senders[ch];
      if (!send) return console.warn(`[notify] unknown channel "${ch}"`);
      try {
        await send(text, contact);
        console.log(`[notify] alert sent via ${ch}`);
      } catch (err) {
        console.error(`[notify] ${ch} failed:`, err.message);
      }
    })
  );
};

export default notifyAdmin;

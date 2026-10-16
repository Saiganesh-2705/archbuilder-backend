// Run:  npm run test:email
// Checks your .env email settings and sends a real test email.
import "dotenv/config";
import { buildTransporter } from "./utils/notifyAdmin.js";

console.log("EMAIL_USER      :", process.env.EMAIL_USER || "(missing)");
console.log("EMAIL_PASS set  :", process.env.EMAIL_PASS ? "yes" : "NO (missing)");
console.log("NOTIFY_EMAIL_TO :", process.env.NOTIFY_EMAIL_TO || "(will use EMAIL_USER)");
console.log("NOTIFY_CHANNEL  :", process.env.NOTIFY_CHANNEL || "(missing)");

try {
  const t = buildTransporter();
  console.log("\nConnecting to Gmail...");
  await t.verify();
  console.log("Login OK. Sending test email...");
  await t.sendMail({
    from: process.env.EMAIL_USER,
    to: (process.env.NOTIFY_EMAIL_TO || "").trim() || process.env.EMAIL_USER,
    subject: "Test email - website alerts working",
    text: "If you can read this, new-enquiry email alerts will work.",
  });
  console.log("\n✅ EMAIL SENT OK. Check your inbox (and Spam).");
} catch (e) {
  console.log("\n❌ FAILED:", e.message);
  const m = `${e.code || ""} ${e.message}`;
  if (/EAUTH|535|Invalid login/i.test(m))
    console.log("FIX: Wrong login. Make a NEW App Password (2-Step Verification must be ON): https://myaccount.google.com/apppasswords\n     Put it in EMAIL_PASS with or without spaces, and EMAIL_USER must be the SAME Gmail that created it.");
  else if (/ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ESOCKET|ECONNECTION/i.test(m))
    console.log("FIX: Cannot reach Gmail. Check internet / firewall / antivirus / VPN (port 465).");
  process.exit(1);
}

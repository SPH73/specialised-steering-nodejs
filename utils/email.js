const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  // Support both EMAIL_* (documented) and SMTP_* (legacy) variable names
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = parseInt(
    process.env.EMAIL_PORT || process.env.SMTP_PORT || "587",
    10,
  );
  const secure =
    (process.env.EMAIL_SECURE || process.env.SMTP_SECURE) === "true"; // true for 465, false for other ports
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  // Allow overriding TLS SNI/hostname used for cert validation (needed when the SMTP cert CN differs from the SMTP host)
  const tlsServername =
    process.env.EMAIL_TLS_SERVERNAME || process.env.SMTP_TLS_SERVERNAME || host;

  if (!host || !user || !pass) {
    console.warn("⚠️ Email configuration incomplete. Missing:", {
      host: !host ? "EMAIL_HOST or SMTP_HOST" : "OK",
      user: !user ? "EMAIL_USER or SMTP_USER" : "OK",
      pass: !pass ? "EMAIL_PASSWORD or SMTP_PASS" : "OK",
    });
    return null; // Return null if config is incomplete
  }

  console.log("📧 Email config loaded:", {
    host: host,
    port: port,
    secure: secure,
    user: user,
    notificationEmail: process.env.NOTIFICATION_EMAIL || "NOT SET",
  });

  try {
    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        // Do not fail on invalid certs (useful for some self-signed or local SMTPs)
        rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== "false",
        servername: tlsServername,
      },
    });
  } catch (error) {
    console.error("Error creating email transporter:", error);
    return null;
  }
};

/**
 * Send contact form notification email
 * @param {Object} formData - Contact form data
 * @param {string} reference - Airtable record reference
 * @returns {Promise} - Nodemailer result
 */
const sendContactNotification = async (formData, reference) => {
  console.log("📧 Attempting to send contact form notification email...");
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(
      "⚠️ Email transporter not available. Skipping email notification.",
    );
    return { success: false, error: "Email not configured" };
  }
  console.log("✅ Email transporter created successfully");

  const mailOptions = {
    from: `"${process.env.SITE_NAME || "Specialised Steering"}" <${
      process.env.EMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `New Contact Form Submission - ${formData.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Reference:</strong> ${reference}</p>
      <hr>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Company:</strong> ${formData.company || "N/A"}</p>
      <p><strong>Email:</strong> <a href="mailto:${formData.email}">${
      formData.email
    }</a></p>
      <p><strong>Phone:</strong> ${formData.phone || "N/A"}</p>
      <p><strong>Country:</strong> ${formData.country || "N/A"}</p>
      <p><strong>IP Address:</strong> ${formData.ip || "N/A"}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${formData.message}</p>
      <hr>
      <p><em>Received: ${new Date().toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      })}</em></p>
    `,
    text: `
New Contact Form Submission
Reference: ${reference}
---
Name: ${formData.name}
Company: ${formData.company || "N/A"}
Email: ${formData.email}
Phone: ${formData.phone || "N/A"}
Country: ${formData.country || "N/A"}
IP Address: ${formData.ip || "N/A"}
---
Message:
${formData.message}
---
Received: ${new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    })}
    `,
  };

  try {
    console.log("📤 Sending email to:", process.env.NOTIFICATION_EMAIL);
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Contact notification email sent successfully! Message ID:",
      info.messageId,
    );
    console.log("📧 Email info response:", JSON.stringify(info.response));
    console.log("📧 Email accepted:", info.accepted);
    console.log("📧 Email rejected:", info.rejected);
    console.log("📧 Email pending:", info.pending);
    return info;
  } catch (error) {
    console.error("❌ Error sending contact notification:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error response:", error.response);
    console.error("❌ Full error:", error);
    throw error;
  }
};

/**
 * Send parts enquiry notification email
 * @param {Object} formData - Enquiry form data
 * @param {string} reference - Airtable record reference
 * @param {string} imageUrl - Cloudinary image URL (if uploaded)
 * @returns {Promise} - Nodemailer result
 */
const sendEnquiryNotification = async (
  formData,
  reference,
  imageUrl = null,
) => {
  console.log("📧 Attempting to send enquiry form notification email...");
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(
      "⚠️ Email transporter not available. Skipping email notification.",
    );
    return { success: false, error: "Email not configured" };
  }
  console.log("✅ Email transporter created successfully");

  const mailOptions = {
    from: `"${process.env.SITE_NAME || "Specialised Steering"}" <${
      process.env.EMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `New Parts Enquiry - ${formData.brand || "Unknown Brand"} ${
      formData.type || ""
    }`,
    html: `
      <h2>New Parts Enquiry Submission</h2>
      <p><strong>Reference:</strong> ${reference}</p>
      <hr>

      <h3>Contact Information</h3>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Company:</strong> ${formData.company || "N/A"}</p>
      <p><strong>Email:</strong> <a href="mailto:${formData.email}">${
      formData.email
    }</a></p>
      <p><strong>Phone:</strong> ${formData.phone || "N/A"}</p>
      <p><strong>IP Address:</strong> ${formData.ip || "N/A"}</p>

      <h3>Address</h3>
      <p>${formData.street || "N/A"}</p>
      <p>${formData.town || "N/A"}, ${formData.postal || ""}</p>
      <p>${formData.region || ""}, ${formData.country || "N/A"}</p>

      <h3>Part Details</h3>
      <p><strong>Brand:</strong> ${formData.brand || "N/A"}</p>
      <p><strong>Type:</strong> ${formData.type || "N/A"}</p>
      <p><strong>Part Number:</strong> ${formData.partNo || "N/A"}</p>
      <p><strong>Part Description:</strong> ${formData.partDesc || "N/A"}</p>
      <p><strong>Serial Number:</strong> ${formData.serialNo || "N/A"}</p>

      <h3>Additional Message</h3>
      <p>${formData.message || "No additional message"}</p>

      ${
        imageUrl
          ? `<h3>Uploaded Image</h3><p><a href="${imageUrl}">View Image</a></p><img src="${imageUrl}" alt="Part Image" style="max-width: 600px;">`
          : ""
      }

      <hr>
      <p><em>Received: ${new Date().toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      })}</em></p>
    `,
    text: `
New Parts Enquiry Submission
Reference: ${reference}
---

Contact Information
Name: ${formData.name}
Company: ${formData.company || "N/A"}
Email: ${formData.email}
Phone: ${formData.phone || "N/A"}
IP Address: ${formData.ip || "N/A"}

Address
${formData.street || "N/A"}
${formData.town || "N/A"}, ${formData.postal || ""}
${formData.region || ""}, ${formData.country || "N/A"}

Part Details
Brand: ${formData.brand || "N/A"}
Type: ${formData.type || "N/A"}
Part Number: ${formData.partNo || "N/A"}
Part Description: ${formData.partDesc || "N/A"}
Serial Number: ${formData.serialNo || "N/A"}

Additional Message
${formData.message || "No additional message"}

${imageUrl ? `Uploaded Image: ${imageUrl}` : ""}

---
Received: ${new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    })}
    `,
  };

  try {
    console.log("📤 Sending email to:", process.env.NOTIFICATION_EMAIL);
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Enquiry notification email sent successfully! Message ID:",
      info.messageId,
    );
    console.log("📧 Email info response:", JSON.stringify(info.response));
    console.log("📧 Email accepted:", info.accepted);
    console.log("📧 Email rejected:", info.rejected);
    console.log("📧 Email pending:", info.pending);
    return info;
  } catch (error) {
    console.error("❌ Error sending enquiry notification:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error response:", error.response);
    console.error("❌ Full error:", error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Full URL for password reset
 * @returns {Promise} - Nodemailer result
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  console.log("📧 Attempting to send password reset email...");
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(
      "⚠️ Email transporter not available. Skipping password reset email.",
    );
    return { success: false, error: "Email not configured" };
  }
  console.log("✅ Email transporter created successfully");

  const mailOptions = {
    from: `"${process.env.SITE_NAME || "Specialised Steering"}" <${
      process.env.EMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "Admin Password Reset Request",
    html: `
      <h2>Admin Password Reset Request</h2>
      <p>You have requested to reset the admin password for the Specialised Steering gallery management system.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f9b101; color: #404040; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p><code>${resetUrl}</code></p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <hr>
      <p><em>This is an automated email from the Specialised Steering admin system.</em></p>
      <p><em>Sent: ${new Date().toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      })}</em></p>
    `,
    text: `
Admin Password Reset Request

You have requested to reset the admin password for the Specialised Steering gallery management system.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

---
This is an automated email from the Specialised Steering admin system.
Sent: ${new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    })}
    `,
  };

  try {
    console.log("📤 Sending password reset email to:", email);
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Password reset email sent successfully! Message ID:",
      info.messageId,
    );
    return info;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

/**
 * Send a system notification email (e.g. health checks)
 * @param {Object} options
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} options.text
 * @returns {Promise} - Nodemailer result
 */
const sendSystemNotification = async ({ subject, html, text }) => {
  console.log("📧 Attempting to send system notification...");
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(
      "⚠️ Email transporter not available. Skipping system notification.",
    );
    return { success: false, error: "Email not configured" };
  }

  const recipient =
    process.env.HEALTHCHECK_EMAIL || process.env.NOTIFICATION_EMAIL;
  if (!recipient) {
    console.warn(
      "⚠️ HEALTHCHECK_EMAIL/NOTIFICATION_EMAIL not set. Skipping notification.",
    );
    return { success: false, error: "Notification email not configured" };
  }

  const mailOptions = {
    from: `"${process.env.SITE_NAME || "Specialised Steering"}" <${
      process.env.EMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: recipient,
    subject: subject,
    html: html,
    text: text,
  };

  try {
    console.log("📤 Sending system notification to:", recipient);
    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ System notification sent successfully! Message ID:",
      info.messageId,
    );
    return info;
  } catch (error) {
    console.error("❌ Error sending system notification:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

module.exports = {
  sendContactNotification,
  sendEnquiryNotification,
  sendContactFormNotification: sendContactNotification,
  sendEnquiryFormNotification: sendEnquiryNotification,
  sendPasswordResetEmail,
  sendSystemNotification,
};

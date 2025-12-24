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
    console.warn("⚠️ All environment variables checked:", {
      EMAIL_HOST: process.env.EMAIL_HOST ? "SET" : "NOT SET",
      SMTP_HOST: process.env.SMTP_HOST ? "SET" : "NOT SET",
      EMAIL_USER: process.env.EMAIL_USER ? "SET" : "NOT SET",
      SMTP_USER: process.env.SMTP_USER ? "SET" : "NOT SET",
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "SET" : "NOT SET",
      SMTP_PASS: process.env.SMTP_PASS ? "SET" : "NOT SET",
      NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL ? "SET" : "NOT SET",
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
    return info;
  } catch (error) {
    console.error("❌ Error sending contact notification:", error.message);
    console.error("Full error:", error);
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
    return info;
  } catch (error) {
    console.error("❌ Error sending enquiry notification:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

module.exports = {
  sendContactNotification,
  sendEnquiryNotification,
  sendContactFormNotification: sendContactNotification,
  sendEnquiryFormNotification: sendEnquiryNotification,
};

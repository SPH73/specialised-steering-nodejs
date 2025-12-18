const nodemailer = require("nodemailer");

/**
 * Email utility for sending notifications
 * Supports multiple email providers via SMTP
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 */
const initializeTransporter = () => {
  if (transporter) return transporter;

  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn(
      "Email configuration missing. Email notifications will not be sent.",
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Send contact form notification email
 * @param {Object} formData - Form submission data
 * @param {String} recordId - Airtable record ID
 */
const sendContactFormNotification = async (formData, recordId) => {
  const transport = initializeTransporter();
  if (!transport) {
    console.warn(
      "Email transporter not initialized. Skipping email notification.",
    );
    return { success: false, error: "Email not configured" };
  }

  const recipientEmail =
    process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Specialised Steering Website" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `New Contact Form Submission - ${formData.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f4f4; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #2c3e50; }
          .value { margin-left: 10px; }
          .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; }
          .airtable-link { display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${formData.name || "N/A"}</span>
            </div>
            <div class="field">
              <span class="label">Company:</span>
              <span class="value">${formData.company || "N/A"}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${formData.email}">${
      formData.email
    }</a></span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${formData.phone || "N/A"}</span>
            </div>
            <div class="field">
              <span class="label">Country:</span>
              <span class="value">${formData.country || "N/A"}</span>
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <div style="margin-top: 10px; padding: 15px; background-color: white; border-left: 4px solid #3498db;">
                ${formData.message || "No message provided"}
              </div>
            </div>
            <div class="field">
              <span class="label">IP Address:</span>
              <span class="value">${formData.ip || "Unknown"}</span>
            </div>
            <div class="field">
              <span class="label">Airtable Record:</span>
              <span class="value">${recordId}</span>
            </div>
            <a href="https://airtable.com/${
              process.env.BASE
            }" class="airtable-link" target="_blank">View in Airtable</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from the Specialised Steering website contact form.</p>
            <p>Submitted: ${new Date().toLocaleString("en-ZA", {
              timeZone: "Africa/Johannesburg",
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${formData.name || "N/A"}
Company: ${formData.company || "N/A"}
Email: ${formData.email || "N/A"}
Phone: ${formData.phone || "N/A"}
Country: ${formData.country || "N/A"}

Message:
${formData.message || "No message provided"}

IP Address: ${formData.ip || "Unknown"}
Airtable Record: ${recordId}

Submitted: ${new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    })}
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Contact form notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending contact form notification email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send parts enquiry form notification email
 * @param {Object} formData - Form submission data
 * @param {String} recordId - Airtable record ID
 * @param {String} imageUrl - Cloudinary image URL (if uploaded)
 */
const sendEnquiryFormNotification = async (
  formData,
  recordId,
  imageUrl = null,
) => {
  const transport = initializeTransporter();
  if (!transport) {
    console.warn(
      "Email transporter not initialized. Skipping email notification.",
    );
    return { success: false, error: "Email not configured" };
  }

  const recipientEmail =
    process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Specialised Steering Website" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `New Parts Enquiry - ${formData.brand || "Unknown Brand"} ${
      formData.type || ""
    }`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f4f4; padding: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; color: #e74c3c; margin-bottom: 10px; border-bottom: 2px solid #e74c3c; padding-bottom: 5px; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; color: #2c3e50; }
          .value { margin-left: 10px; }
          .image-preview { margin-top: 15px; max-width: 100%; }
          .image-preview img { max-width: 100%; height: auto; border: 1px solid #ddd; }
          .footer { margin-top: 20px; padding: 10px; font-size: 12px; color: #666; }
          .airtable-link { display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔧 New Parts Enquiry Submission</h2>
          </div>
          <div class="content">

            <div class="section">
              <div class="section-title">Part Information</div>
              <div class="field">
                <span class="label">Brand:</span>
                <span class="value">${formData.brand || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Type:</span>
                <span class="value">${formData.type || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Part Number:</span>
                <span class="value">${formData.partNo || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Serial Number:</span>
                <span class="value">${formData.serialNo || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Description:</span>
                <div style="margin-top: 10px; padding: 15px; background-color: white; border-left: 4px solid #e74c3c;">
                  ${formData.partDesc || "No description provided"}
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${formData.name || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Company:</span>
                <span class="value">${formData.company || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${formData.email}">${
      formData.email
    }</a></span>
              </div>
              <div class="field">
                <span class="label">Phone:</span>
                <span class="value">${formData.phone || "N/A"}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Delivery Address</div>
              <div class="field">
                <span class="label">Street:</span>
                <span class="value">${formData.street || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Town:</span>
                <span class="value">${formData.town || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Postal Code:</span>
                <span class="value">${formData.postal || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Region:</span>
                <span class="value">${formData.region || "N/A"}</span>
              </div>
              <div class="field">
                <span class="label">Country:</span>
                <span class="value">${formData.country || "N/A"}</span>
              </div>
            </div>

            ${
              formData.message
                ? `
            <div class="section">
              <div class="section-title">Additional Message</div>
              <div style="padding: 15px; background-color: white; border-left: 4px solid #e74c3c;">
                ${formData.message}
              </div>
            </div>
            `
                : ""
            }

            ${
              imageUrl
                ? `
            <div class="section">
              <div class="section-title">Uploaded Image</div>
              <div class="image-preview">
                <a href="${imageUrl}" target="_blank">
                  <img src="${imageUrl}" alt="Part Image" />
                </a>
              </div>
            </div>
            `
                : ""
            }

            <div class="field" style="margin-top: 20px;">
              <span class="label">IP Address:</span>
              <span class="value">${formData.ip || "Unknown"}</span>
            </div>
            <div class="field">
              <span class="label">Airtable Record:</span>
              <span class="value">${recordId}</span>
            </div>

            <a href="https://airtable.com/${
              process.env.BASE
            }" class="airtable-link" target="_blank">View in Airtable</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from the Specialised Steering website parts enquiry form.</p>
            <p>Submitted: ${new Date().toLocaleString("en-ZA", {
              timeZone: "Africa/Johannesburg",
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Parts Enquiry Submission

PART INFORMATION
Brand: ${formData.brand || "N/A"}
Type: ${formData.type || "N/A"}
Part Number: ${formData.partNo || "N/A"}
Serial Number: ${formData.serialNo || "N/A"}
Description: ${formData.partDesc || "N/A"}

CUSTOMER INFORMATION
Name: ${formData.name || "N/A"}
Company: ${formData.company || "N/A"}
Email: ${formData.email || "N/A"}
Phone: ${formData.phone || "N/A"}

DELIVERY ADDRESS
Street: ${formData.street || "N/A"}
Town: ${formData.town || "N/A"}
Postal Code: ${formData.postal || "N/A"}
Region: ${formData.region || "N/A"}
Country: ${formData.country || "N/A"}

${formData.message ? `ADDITIONAL MESSAGE\n${formData.message}\n` : ""}
${imageUrl ? `IMAGE URL\n${imageUrl}\n` : ""}

IP Address: ${formData.ip || "Unknown"}
Airtable Record: ${recordId}

Submitted: ${new Date().toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    })}
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Enquiry form notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending enquiry form notification email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async () => {
  const transport = initializeTransporter();
  if (!transport) {
    return { success: false, error: "Email not configured" };
  }

  try {
    await transport.verify();
    console.log("Email server connection verified successfully");
    return { success: true };
  } catch (error) {
    console.error("Email server verification failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactFormNotification,
  sendEnquiryFormNotification,
  testEmailConfiguration,
};

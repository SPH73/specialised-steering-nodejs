require("dotenv").config();
const express = require("express");
const router = express.Router();

const {
  initPasswordResetTable,
  createResetToken,
  getResetToken,
  markTokenAsUsed,
} = require("../utils/password-reset-db");
const { sendPasswordResetEmail } = require("../utils/email");
const { updateAdminPassword } = require("../utils/admin-update-password");

// Get admin email - use ADMIN_EMAIL if set, otherwise fall back to NOTIFICATION_EMAIL
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.NOTIFICATION_EMAIL ||
  "devabbot5@gmail.com";

/**
 * GET /admin/forgot-password
 * Display forgot password form
 */
router.get("/forgot-password", (req, res) => {
  res.render("admin-forgot-password", {
    meta: {
      title: "Forgot Password - Admin",
      description: "Reset admin password",
    },
    error: null,
    success: false,
  });
});

/**
 * POST /auth/forgot-password
 * Process forgot password request
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email matches admin email
    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase()) {
      return res.render("admin-forgot-password", {
        meta: {
          title: "Forgot Password - Admin",
          description: "Reset admin password",
        },
        error: "Invalid email address. Please contact the administrator.",
        success: false,
      });
    }

    // Initialize password reset table
    await initPasswordResetTable();

    // Generate reset token
    const token = await createResetToken(ADMIN_EMAIL, 1); // 1 hour expiration

    // Build reset URL
    // Use /auth path to avoid browser's cached Basic Auth credentials for /admin/*
    const protocol = req.protocol;
    const host = req.get("host");
    const resetUrl = `${protocol}://${host}/auth/reset-password/${token}`;

    // Send reset email
    try {
      await sendPasswordResetEmail(ADMIN_EMAIL, token, resetUrl);
      console.log(`Password reset email sent to ${ADMIN_EMAIL}`);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      return res.render("admin-forgot-password", {
        meta: {
          title: "Forgot Password - Admin",
          description: "Reset admin password",
        },
        error: "Failed to send reset email. Please try again later.",
        success: false,
      });
    }

    // Success - show confirmation (don't reveal email in production)
    res.render("admin-forgot-password", {
      meta: {
        title: "Forgot Password - Admin",
        description: "Reset admin password",
      },
      error: null,
      success: true,
      message:
        "If the email address is valid, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.render("admin-forgot-password", {
      meta: {
        title: "Forgot Password - Admin",
        description: "Reset admin password",
      },
      error: "An error occurred. Please try again later.",
      success: false,
    });
  }
});

/**
 * GET /auth/reset-password/:token
 * Display password reset form
 */
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token
    const tokenData = await getResetToken(token);

    if (!tokenData) {
      return res.render("admin-reset-password", {
        meta: {
          title: "Reset Password - Admin",
          description: "Reset admin password",
        },
        error:
          "Invalid or expired reset token. Please request a new password reset.",
        success: false,
        token: null,
      });
    }

    // Token is valid, show reset form
    res.render("admin-reset-password", {
      meta: {
        title: "Reset Password - Admin",
        description: "Reset admin password",
      },
      error: null,
      success: false,
      token: token,
    });
  } catch (error) {
    console.error("Error validating reset token:", error);
    res.render("admin-reset-password", {
      meta: {
        title: "Reset Password - Admin",
        description: "Reset admin password",
      },
      error: "An error occurred. Please try again later.",
      success: false,
      token: null,
    });
  }
});

/**
 * POST /auth/reset-password/:token
 * Process password reset
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.render("admin-reset-password", {
        meta: {
          title: "Reset Password - Admin",
          description: "Reset admin password",
        },
        error: "Password must be at least 8 characters long.",
        success: false,
        token: token,
      });
    }

    if (password !== confirmPassword) {
      return res.render("admin-reset-password", {
        meta: {
          title: "Reset Password - Admin",
          description: "Reset admin password",
        },
        error: "Passwords do not match.",
        success: false,
        token: token,
      });
    }

    // Validate token
    const tokenData = await getResetToken(token);

    if (!tokenData) {
      return res.render("admin-reset-password", {
        meta: {
          title: "Reset Password - Admin",
          description: "Reset admin password",
        },
        error:
          "Invalid or expired reset token. Please request a new password reset.",
        success: false,
        token: null,
      });
    }

    // Update password in .env or .htaccess file
    try {
      await updateAdminPassword(password);
      console.log("Admin password updated successfully");

      // Trigger Passenger restart by touching restart.txt
      // This works on production/staging servers using Passenger
      try {
        const fs = require("fs");
        const path = require("path");
        const restartFile = path.join(__dirname, "..", "tmp", "restart.txt");
        const tmpDir = path.join(__dirname, "..", "tmp");

        // Ensure tmp directory exists
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Touch the restart file to trigger Passenger restart
        fs.writeFileSync(restartFile, Date.now().toString(), "utf8");
        console.log("Passenger restart triggered");
      } catch (restartError) {
        // Non-fatal error - log but continue
        console.warn(
          "Could not trigger automatic restart:",
          restartError.message,
        );
        console.log(
          "Password updated successfully, but manual restart may be required",
        );
      }
    } catch (updateError) {
      console.error("Error updating admin password:", updateError);
      return res.render("admin-reset-password", {
        meta: {
          title: "Reset Password - Admin",
          description: "Reset admin password",
        },
        error: "Failed to update password. Please try again later.",
        success: false,
        token: token,
      });
    }

    // Mark token as used
    await markTokenAsUsed(token);

    // Success
    res.render("admin-reset-password", {
      meta: {
        title: "Reset Password - Admin",
        description: "Reset admin password",
      },
      error: null,
      success: true,
      message:
        "Password has been reset successfully. The application is restarting to apply changes. You can log in with your new password in a few moments.",
      token: null,
    });
  } catch (error) {
    console.error("Error processing password reset:", error);
    res.render("admin-reset-password", {
      meta: {
        title: "Reset Password - Admin",
        description: "Reset admin password",
      },
      error: "An error occurred. Please try again later.",
      success: false,
      token: req.params.token,
    });
  }
});

/**
 * GET /admin/logout
 * Logout admin user (clears Basic Auth credentials)
 * Public route - accessible without authentication
 */
router.get("/logout", (req, res) => {
  // Clear Basic Auth by returning 401 with logout realm
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
  res.status(401).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Logged Out</title>
        <meta http-equiv="refresh" content="2;url=/">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .logout-container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-bottom: 1rem;
          }
          p {
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="logout-container">
          <h1>Logged out successfully</h1>
          <p>You will be redirected to the home page...</p>
        </div>
        <script>
          // Clear any cached credentials and redirect
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        </script>
      </body>
    </html>
  `);
});

module.exports = router;

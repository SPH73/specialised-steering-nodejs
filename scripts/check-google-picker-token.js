require("dotenv").config();
const { request } = require("gaxios");
const { getAuthenticatedClient, SCOPE } = require("../utils/google-oauth");
const { sendSystemNotification } = require("../utils/email");

const TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

const formatError = (error) => {
  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }
  return error?.message || String(error);
};

const sendAlert = async (details) => {
  const subject =
    "Action required: Google Photos Picker token needs re-auth";
  const html = `
    <h2>Google Photos Picker token check failed</h2>
    <p>The server could not validate the Google Photos Picker token.</p>
    <p><strong>Details:</strong> ${details}</p>
    <p>Fix: SSH to production and run <code>node setup-google-picker-auth.js</code> with Devon's Google account.</p>
  `;
  const text = [
    "Google Photos Picker token check failed",
    `Details: ${details}`,
    "Fix: SSH to production and run: node setup-google-picker-auth.js",
    "Use Devon's Google account for consent.",
  ].join("\n");

  return sendSystemNotification({ subject, html, text });
};

const main = async () => {
  try {
    if (process.env.HEALTHCHECK_FORCE_FAIL === "true") {
      throw new Error("Forced failure (HEALTHCHECK_FORCE_FAIL=true)");
    }

    const client = await getAuthenticatedClient();
    const accessToken = client?.credentials?.access_token;

    if (!accessToken) {
      throw new Error("No access token available after refresh.");
    }

    const response = await request({
      url: `${TOKENINFO_URL}?access_token=${encodeURIComponent(accessToken)}`,
      method: "GET",
    });

    const scopes = response.data?.scope
      ? response.data.scope.split(" ")
      : [];
    const hasScope = scopes.includes(SCOPE);

    if (!hasScope) {
      throw new Error(
        `Missing required scope. Expected: ${SCOPE}. Received: ${scopes.join(
          ", ",
        )}`,
      );
    }

    console.log("✅ Google Photos Picker token OK");
    process.exit(0);
  } catch (error) {
    const details = formatError(error);
    console.error("❌ Google Photos Picker token check failed:", details);

    try {
      await sendAlert(details);
    } catch (notifyError) {
      console.error(
        "⚠️ Failed to send notification:",
        formatError(notifyError),
      );
    }

    process.exit(1);
  }
};

main();

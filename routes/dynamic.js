require("dotenv").config();
const express = require("express");
const requestIp = require("request-ip");
const rateLimit = require("express-rate-limit");

const upload = require("../utils/multer");
const multer = require("multer");
const { cloudinary } = require("../utils/cloudinary");
const { Airtable } = require("../utils/airtable");
const {
  sendContactFormNotification,
  sendEnquiryFormNotification,
} = require("../utils/email");
const { verifyRecaptchaFromRequest } = require("../utils/recaptcha");
const { detectSpam } = require("../utils/spam-detection");
const {
  logRecaptchaFailure,
  logSpamAttempt,
  logRateLimit,
} = require("../utils/security-logger");
const { trackAirtableCall } = require("../utils/airtable-monitor");
const base = Airtable.base(process.env.BASE);

const router = express.Router();

// Rate limiting for form submissions
// Allow 5 submissions per 15 minutes per IP
const formRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many form submissions from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: req => {
    // Skip rate limiting for localhost in development
    return req.ip === "127.0.0.1" || req.ip === "::1";
  },
  handler: (req, res) => {
    // Log rate limit hit to Airtable
    const formType = req.path.includes("enquiry") ? "enquiry" : "contact";
    logRateLimit(req, formType).catch(err =>
      console.error("Failed to log rate limit:", err),
    );
    // Return HTML error page (same format as other form errors)
    res.status(429).render("confirm", {
      message: {
        error:
          "Too many form submissions from this IP, please try again later.",
      },
      ref: null,
    });
  },
});

// ----HOME
router.get("/", (req, res) => {
  const meta = {
    title:
      "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
    description:
      "We repair and source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work.",
  };
  // Repairs not currently displayed - pass empty array to avoid Airtable API call
  const repairs = [];

  res.render("index", {
    meta: meta,
    repairs: repairs,
  });
});

// ___ OUR WORK ___

router.get("/our-work", (req, res) => {
  const meta = {
    title: "HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC",
    description:
      "We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries.",
  };
  console.log("Our work Cookies: ", req.cookies);

  res.render("our-work", { meta: meta });
});

router.get("/our-work/:id", async (req, res) => {
  const meta = {
    title: "HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC",
    description:
      "We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries.",
  };
  const repairId = req.params.id;
  const table = base("repairsWork");
  let error = null;
  const repairImages = [];
  let img = {};
  let repair = {};

  try {
    trackAirtableCall("our-work-detail", "find", { repairId });
    const repairDetail = await table.find(repairId);
    if (!repairDetail) {
      throw Error("Unable to find this repair");
    }
    let imagesGallery = repairDetail.fields.imagesGallery;
    imagesGallery.forEach(image => {
      let URL = image.url.slice(37);
      let imgString = URL.indexOf("?");
      URL = URL.slice(0, imgString);
      URL = `https://res.cloudinary.com/ss-uploads/image/upload/q_auto:good,f_webp/remote_media/${URL}`;
      img = {
        id: image.id,
        url: URL,
        filename: image.filename,
        width: image.width,
        height: image.height,
        size: image.size,
        type: image.type,
      };
      repairImages.push(img);
    });
    repair = {
      repairName: repairDetail.fields.repairName,
      repairDescription: repairDetail.fields.repairDescription,
      componentName: repairDetail.fields.componentName,
      componentDescription: repairDetail.fields.componentDescription,
    };
  } catch (err) {
    error = err.message;
    console.log(error);
  }
  console.log("Our work detail Cookies: ", req.cookies);
  res.render("our-work-detail", {
    meta: meta,
    repair: repair,
    repairImages: repairImages,
    repairId: repairId,
  });
});

// ----ENQUIRY

router.get("/enquiry", (req, res) => {
  const meta = {
    title:
      "HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS",
    description:
      "We supply a wide range of industries with replacement hydraulic components from leading manufacturers. Fill out an enquiry form for the part you require and we will do our best to get you up and running again as soon as possible.",
  };
  res.render("enquiry", {
    meta: meta,
    recaptchaSiteKey:
      process.env.reCAPTCHA_v2_SITE_KEY || process.env.RECAPTCHA_SITE_KEY,
  });
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("❌ Multer/Upload error:", err.message);
    console.error("❌ Error code:", err.code);
    console.error("❌ Error stack:", err.stack);

    // Check if it's a multer error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).render("confirm", {
        message: { error: "File is too large. Maximum size is 10MB." },
        ref: null,
      });
    }
    if (err.message && err.message.includes("Only image file types")) {
      return res.status(400).render("confirm", {
        message: { error: "Only image files are allowed." },
        ref: null,
      });
    }

    // Generic upload error
    return res.status(400).render("confirm", {
      message: { error: "File upload error. Please try again." },
      ref: null,
    });
  }
  next();
};

router.post(
  "/enquiry",
  formRateLimit,
  (req, res, next) => {
    // Wrap multer middleware to catch errors
    upload.single("image")(req, res, err => {
      if (err) {
        console.error("Multer error:", err.message);
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const clientIp = requestIp.getClientIp(req);
      const image = req.file;
      const data = req.body || {};

      // Critical check: If req.body is empty, this is a major issue
      if (!data || Object.keys(data).length === 0) {
        console.error("Parts enquiry form: req.body is empty");
        return res.status(400).render("confirm", {
          message: { error: "Form data was not received. Please try again." },
          ref: null,
        });
      }

      // 1. Verify reCAPTCHA
      let recaptchaResult;
      try {
        recaptchaResult = await verifyRecaptchaFromRequest(req);
      } catch (error) {
        console.error("Error verifying reCAPTCHA:", error.message);
        return res.status(500).render("confirm", {
          message: { error: "Error verifying reCAPTCHA. Please try again." },
          ref: null,
        });
      }

      if (!recaptchaResult.success) {
        console.warn(
          "reCAPTCHA verification failed:",
          recaptchaResult.error || "Invalid token",
        );
        logRecaptchaFailure(req, recaptchaResult, "enquiry").catch(err =>
          console.error("Failed to log reCAPTCHA failure:", err),
        );
        return res.status(400).render("confirm", {
          message: {
            error: "reCAPTCHA verification failed. Please try again.",
          },
          ref: null,
        });
      }

      // 2. Check for spam
      let spamCheck;
      try {
        spamCheck = detectSpam(data, {
          honeypot: data.website,
          formLoadTime: parseInt(data.formLoadTime, 10),
          minTimeSeconds: 3,
        });
      } catch (error) {
        console.error("Error in spam detection:", error.message);
        spamCheck = { isSpam: false };
      }

      if (spamCheck.isSpam) {
        console.warn("Spam detected:", spamCheck.reason, "IP:", clientIp);
        logSpamAttempt(req, spamCheck, "enquiry", data).catch(err =>
          console.error("Failed to log spam attempt:", err),
        );
        return res.status(400).render("confirm", {
          message: {
            error:
              "There was an error processing your submission. Please try again.",
          },
          ref: null,
        });
      }

      // Check if base is initialized
      if (!base) {
        console.error(
          "Airtable base not initialized. Check BASE environment variable.",
        );
        const messageData = data && typeof data === "object" ? data : {};
        return res.status(500).render("confirm", {
          message: messageData,
          ref: null,
        });
      }
      const options = {
        use_filename: true,
        unique_filename: false,
        folder: `Specialised/public/uploads/${data.enquiryName.replace(
          /\s/g,
          "",
        )}`,
        flags: "attachment",
      };
      const record = {
        status: "New",
        name: data.enquiryName,
        email: data.enquiryEmail,
        company: data.company,
        phone: data.enquiryNumber,
        message: data.enquiryMessage,
        brand: data.brand,
        type: data.type,
        partNo: data.partNo,
        partDesc: data.partDesc,
        serialNo: data.serialNo,
        street: data.street,
        town: data.town,
        postal: data.postal,
        region: data.province,
        country: data.country,
        ip: clientIp,
        form: "parts",
      };
      let reference = "";
      let imageUrl = null;
      try {
        // Validate base before using it
        if (!base) {
          throw new Error(
            "Airtable base is not initialized. Check BASE environment variable.",
          );
        }
        if (!process.env.BASE) {
          throw new Error("BASE environment variable is not set.");
        }

        const table = base("webForms");
        trackAirtableCall("enquiry-form", "create", { formType: "parts" });
        const createdRecord = await table.create(record);
        reference = createdRecord.id;

        if (image) {
          try {
            const result = await cloudinary.uploader.upload(
              image.path,
              options,
            );
            if (result && result.secure_url) {
              const secure_url = result.secure_url;
              imageUrl = secure_url;
              const recordId = createdRecord.id;
              trackAirtableCall("enquiry-form", "update", {
                recordId,
                reason: "image-upload",
              });
              const updatedRecord = await table.update(recordId, {
                imageUploads: [{ url: secure_url }],
              });
              reference = updatedRecord.id;
            }
          } catch (uploadError) {
            console.error(
              "Error uploading image to Cloudinary:",
              uploadError.message,
            );
            // Continue without image - form submission still succeeds
          }
        }

        // Send email notification (non-blocking - form submission succeeds even if email fails)
        const emailData = {
          name: data.enquiryName,
          email: data.enquiryEmail,
          company: data.company,
          phone: data.enquiryNumber,
          message: data.enquiryMessage,
          brand: data.brand,
          type: data.type,
          partNo: data.partNo,
          partDesc: data.partDesc,
          serialNo: data.serialNo,
          street: data.street,
          town: data.town,
          postal: data.postal,
          region: data.province,
          country: data.country,
          ip: clientIp,
        };
        sendEnquiryFormNotification(emailData, reference, imageUrl).catch(
          err => {
            console.error(
              "Failed to send enquiry form notification email:",
              err,
            );
          },
        );
      } catch (error) {
        console.error("❌ Error processing parts enquiry:", error);
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
        console.error("Error code:", error.code);
        console.error("Error stack:", error.stack);
        console.error("Record data:", record);
        console.error(
          "Image file:",
          image ? { path: image.path, size: image.size } : "No image",
        );

        // Still show success page even if Airtable/Cloudinary fails - form was submitted
        console.warn("⚠️ Showing success page despite error");
        const messageData = data && typeof data === "object" ? data : {};
        console.log("⚠️ Rendering confirm page with data (error occurred):", {
          hasMessage: !!messageData,
          messageKeys: Object.keys(messageData),
        });
        return res.render("confirm", {
          message: messageData,
          ref: null,
        });
      }

      // Ensure data is an object (defensive check)
      const messageData = data && typeof data === "object" ? data : {};
      const refValue = reference || null;

      // Log what we're passing to the template
      console.log("✅ Rendering confirm page with data:", {
        hasMessage: !!messageData,
        messageKeys: Object.keys(messageData),
        enquiryName: messageData.enquiryName,
        enquiryEmail: messageData.enquiryEmail,
        postDate: messageData.postDate,
        postTime: messageData.postTime,
        hasRef: !!refValue,
        ref: refValue,
      });

      res.render("confirm", { message: messageData, ref: refValue });
    } catch (error) {
      console.error(
        "Unexpected error in parts enquiry handler:",
        error.message,
      );

      // Check if it's a multer error
      if (
        error.code === "LIMIT_FILE_SIZE" ||
        error.message?.includes("File too large")
      ) {
        const messageData =
          req.body && typeof req.body === "object" ? req.body : {};
        return res.status(400).render("confirm", {
          message: {
            ...messageData,
            error: "File is too large. Maximum size is 10MB.",
          },
          ref: null,
        });
      }

      // Try to render error page with any data we have
      const messageData =
        req.body && typeof req.body === "object" ? req.body : {};
      return res.status(500).render("confirm", {
        message: messageData,
        ref: null,
      });
    }
  },
);

// ----CONTACT

router.get("/contact", (req, res) => {
  const meta = {
    title:
      "CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE",
    description:
      "With our combined 40 years of experience, we offer an expert and professional service for all your hydraulic component requirements. Please contact us today to let us know how we can help get you back up and running.",
  };
  res.render("contact", {
    meta: meta,
    recaptchaSiteKey:
      process.env.reCAPTCHA_v2_SITE_KEY || process.env.RECAPTCHA_SITE_KEY,
  });
});

router.post("/contact", formRateLimit, async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const data = req.body || {};

    // Critical check: If req.body is empty, this is a major issue
    if (!data || Object.keys(data).length === 0) {
      console.error("Contact form: req.body is empty");
      return res.status(400).render("confirm", {
        message: { error: "Form data was not received. Please try again." },
        ref: null,
      });
    }

    // 1. Verify reCAPTCHA
    let recaptchaResult;
    try {
      recaptchaResult = await verifyRecaptchaFromRequest(req);
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error.message);
      return res.status(500).render("confirm", {
        message: { error: "Error verifying reCAPTCHA. Please try again." },
        ref: null,
      });
    }

    if (!recaptchaResult.success) {
      console.warn(
        "reCAPTCHA verification failed:",
        recaptchaResult.error || "Invalid token",
      );
      logRecaptchaFailure(req, recaptchaResult, "contact").catch(err =>
        console.error("Failed to log reCAPTCHA failure:", err),
      );
      return res.status(400).render("confirm", {
        message: { error: "reCAPTCHA verification failed. Please try again." },
        ref: null,
      });
    }

    // 2. Check for spam
    let spamCheck;
    try {
      spamCheck = detectSpam(data, {
        honeypot: data.website,
        formLoadTime: parseInt(data.formLoadTime, 10),
        minTimeSeconds: 3,
      });
    } catch (error) {
      console.error("Error in spam detection:", error.message);
      spamCheck = { isSpam: false };
    }

    if (spamCheck.isSpam) {
      console.warn("Spam detected:", spamCheck.reason, "IP:", clientIp);
      logSpamAttempt(req, spamCheck, "contact", data).catch(err =>
        console.error("Failed to log spam attempt:", err),
      );
      return res.status(400).render("confirm", {
        message: {
          error:
            "There was an error processing your submission. Please try again.",
        },
        ref: null,
      });
    }

    // Check if base is initialized
    if (!base) {
      console.error(
        "Airtable base not initialized. Check BASE environment variable.",
      );
      return res.status(500).render("confirm", {
        message: {
          error: "Server configuration error. Please contact support.",
        },
        ref: null,
      });
    }
    if (!process.env.BASE) {
      throw new Error("BASE environment variable is not set.");
    }

    const table = base("webForms");

    const record = {
      name: data.enquiryName,
      company: data.enquiryCompany,
      email: data.enquiryEmail,
      phone: data.enquiryNumber,
      country: data.enquiryCountry,
      message: data.enquiryMessage,
      ip: clientIp,
      status: "New",
      form: "contact",
    };
    let reference = "";
    try {
      trackAirtableCall("contact-form", "create", { formType: "contact" });
      const createdRecord = await table.create(record);
      if (createdRecord) {
        reference = createdRecord.id;

        // Send email notification (non-blocking - form submission succeeds even if email fails)
        const emailData = {
          name: data.enquiryName,
          company: data.enquiryCompany,
          email: data.enquiryEmail,
          phone: data.enquiryNumber,
          country: data.enquiryCountry,
          message: data.enquiryMessage,
          ip: clientIp,
        };
        sendContactFormNotification(emailData, reference).catch(err => {
          console.error(
            "Failed to send contact form notification email:",
            err.message,
          );
        });
      }
    } catch (error) {
      console.error("Error creating Airtable record:", error.message);
      // Still show success page even if Airtable fails - form was submitted
      const messageData = data && typeof data === "object" ? data : {};
      return res.render("confirm", {
        message: messageData,
        ref: null,
      });
    }

    // Ensure data is an object (defensive check)
    const messageData = data && typeof data === "object" ? data : {};
    const refValue = reference || null;

    res.render("confirm", { message: messageData, ref: refValue });
  } catch (error) {
    console.error("Unexpected error in contact form handler:", error.message);
    next(error);
  }
});

router.get("/confirm", (req, res) => {
  // If we get here via GET, there's no form data to show
  res.render("confirm", {
    message: {},
    ref: null,
  });
});

// Diagnostic endpoint to test body parsing
router.post("/contact-debug", (req, res) => {
  console.log("=== CONTACT DEBUG ENDPOINT ===");
  console.log("req.body:", JSON.stringify(req.body, null, 2));
  console.log("req.body type:", typeof req.body);
  console.log("req.body keys:", Object.keys(req.body || {}));
  console.log("Content-Type:", req.get("content-type"));
  console.log("Method:", req.method);
  res.json({
    body: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {}),
    contentType: req.get("content-type"),
    method: req.method,
    hasEnquiryName: !!req.body.enquiryName,
    enquiryName: req.body.enquiryName,
  });
});

// CSP Violation Reporting Endpoint
router.post("/__cspreport__", express.json(), async (req, res) => {
  const { logCspViolation } = require("../utils/security-logger");

  try {
    const cspReport = req.body["csp-report"] || req.body;
    await logCspViolation(req, cspReport);
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Failed to process CSP violation report:", error);
    res.status(204).send(); // Still return 204 to prevent retries
  }
});

module.exports = router;

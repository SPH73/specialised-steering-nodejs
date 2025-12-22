require("dotenv").config();
const express = require("express");
const requestIp = require("request-ip");
const rateLimit = require("express-rate-limit");

const upload = require("../utils/multer");
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
router.get("/", async (req, res) => {
  const meta = {
    title:
      "Hydraulic Repairs and Component Sourcing | Germiston, Gauteng, ZA - Service Worldwide",
    description:
      "We repair and source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work.",
  };
  const table = base("repairsWork");
  let error = null;
  const repairs = [];
  let imgURL;
  const imageGalleryList = [];
  let img = {};

  try {
    const featuredRepairs = await table
      .select({
        view: "Featured Repairs",
        filterByFormula: "NOT({featured} = 'false')",
        fields: [
          "repairName",
          "repairDescription",
          "mainImage",
          "componentName",
          "componentDescription",
          "imagesGallery",
        ],
      })
      .firstPage();
    if (!featuredRepairs) {
      throw Error("Unable to fetch repairs");
    }
    featuredRepairs.forEach(repair => {
      let imagesGallery = repair.fields.imagesGallery;
      imagesGallery.forEach(image => {
        imgURL = image.url.slice(37);
        let string = imgURL.indexOf("?");
        imgURL = imgURL.slice(0, string);
        imgURL = `https://res.cloudinary.com/ss-uploads/image/upload/q_auto:good,f_webp/remote_media/${imgURL}`;
        img = {
          url: imgURL,
          id: image.id,
          filename: image.filename,
          width: image.width,
          height: image.height,
          size: image.size,
          type: image.type,
        };
        imageGalleryList.push(img);
      });
      let imageURL = repair.fields.mainImage[0].url.slice(37);
      const ext = imageURL.indexOf("?");
      imageURL = imageURL.slice(0, ext);

      imageURL = `https://res.cloudinary.com/ss-uploads/image/upload/q_auto:good,f_webp/remote_media/${imageURL}`;
      repair = {
        id: repair.id,
        repairName: repair.fields.repairName,
        repairDescription: repair.fields.repairDescription,
        mainImageUrl: imageURL,
        mainImageName: repair.fields.mainImage[0].filename,
        componentName: repair.fields.componentName,
        componentDescription: repair.fields.componentDescription,
        imagesGalleryList: imageGalleryList,
      };

      repairs.push(repair);
    });
  } catch (err) {
    error = err.message;
    console.error(error);
  }

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
  res.render("enquiry", { meta: meta });
});

router.post(
  "/enquiry",
  formRateLimit,
  upload.single("image"),
  async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    const image = req.file;
    const data = req.body;

    // 1. Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptchaFromRequest(req);
    if (!recaptchaResult.success) {
      console.warn(
        "🚫 reCAPTCHA verification failed:",
        recaptchaResult.error || "Invalid token",
      );
      // Log to Airtable
      logRecaptchaFailure(req, recaptchaResult, "enquiry").catch(err =>
        console.error("Failed to log reCAPTCHA failure:", err),
      );
      return res.status(400).render("confirm", {
        message: { error: "reCAPTCHA verification failed. Please try again." },
        ref: null,
      });
    }

    // 2. Check for spam
    const spamCheck = detectSpam(data, {
      honeypot: data.website, // Honeypot field name
      formLoadTime: parseInt(data.formLoadTime, 10),
      minTimeSeconds: 3,
    });

    if (spamCheck.isSpam) {
      console.warn("🚫 Spam detected:", spamCheck.reason, "IP:", clientIp);
      // Log spam attempt to Airtable
      logSpamAttempt(req, spamCheck, "enquiry", data).catch(err =>
        console.error("Failed to log spam attempt:", err),
      );
      // Log spam attempt but don't reveal it's spam to the user
      return res.status(400).render("confirm", {
        message: {
          error:
            "There was an error processing your submission. Please try again.",
        },
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
      const table = base("webForms");
      const createdRecord = await table.create(record);
      reference = createdRecord.id;

      if (image) {
        const result = await cloudinary.uploader.upload(
          image.path,
          options,
          function (error) {
            console.log(error);
          },
        );
        if (!result) {
          next();
          return;
        }
        const secure_url = result.secure_url;
        imageUrl = secure_url;
        const recordId = createdRecord.id;
        const updatedRecord = await table.update(recordId, {
          imageUploads: [{ url: secure_url }],
        });
        reference = updatedRecord.id;
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
      sendEnquiryFormNotification(emailData, reference, imageUrl).catch(err => {
        console.error("Failed to send enquiry form notification email:", err);
      });
    } catch (error) {
      console.error(error);
      next(error);
      return;
    }
    res.render("confirm", { message: data, ref: reference });
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
  res.render("contact", { meta: meta });
});

// Debug endpoint to see what data is being received
router.post("/contact-debug", (req, res) => {
  res.json({
    body: req.body,
    bodyKeys: Object.keys(req.body),
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    },
    recaptchaToken: req.body['g-recaptcha-response'] ? 'present' : 'missing',
    hasFormData: {
      enquiryName: !!req.body.enquiryName,
      enquiryEmail: !!req.body.enquiryEmail,
      enquiryNumber: !!req.body.enquiryNumber,
      enquiryMessage: !!req.body.enquiryMessage,
    },
  });
});

router.post("/contact", formRateLimit, async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const data = req.body;

    console.log("📝 Contact form submission received from IP:", clientIp);
    console.log("📦 Form data received:", JSON.stringify(data, null, 2));
    console.log("📦 req.body keys:", Object.keys(data));

    // 1. Verify reCAPTCHA
    let recaptchaResult;
    try {
      recaptchaResult = await verifyRecaptchaFromRequest(req);
    } catch (error) {
      console.error("❌ Error verifying reCAPTCHA:", error);
      return res.status(500).render("confirm", {
        message: { error: "Error verifying reCAPTCHA. Please try again." },
        ref: null,
      });
    }

    if (!recaptchaResult.success) {
      console.warn(
        "🚫 reCAPTCHA verification failed:",
        recaptchaResult.error || "Invalid token",
      );
      // Log to Airtable
      logRecaptchaFailure(req, recaptchaResult, "contact").catch(err =>
        console.error("Failed to log reCAPTCHA failure:", err),
      );
      // TEMPORARY: Return JSON for debugging
      return res.status(400).json({
        error: "reCAPTCHA verification failed",
        recaptchaResult: recaptchaResult,
        receivedData: data,
        bodyKeys: Object.keys(req.body),
        recaptchaToken: req.body['g-recaptcha-response'] ? 'present' : 'missing',
      });
      // Original response (commented out for debugging):
      // return res.status(400).render("confirm", {
      //   message: { error: "reCAPTCHA verification failed. Please try again." },
      //   ref: null,
      // });
    }

    // 2. Check for spam
    let spamCheck;
    try {
      spamCheck = detectSpam(data, {
        honeypot: data.website, // Honeypot field name
        formLoadTime: parseInt(data.formLoadTime, 10),
        minTimeSeconds: 3,
      });
    } catch (error) {
      console.error("❌ Error in spam detection:", error);
      // Continue processing if spam detection fails
      spamCheck = { isSpam: false };
    }

    if (spamCheck.isSpam) {
      console.warn("🚫 Spam detected:", spamCheck.reason, "IP:", clientIp);
      // Log spam attempt to Airtable
      logSpamAttempt(req, spamCheck, "contact", data).catch(err =>
        console.error("Failed to log spam attempt:", err),
      );
      // TEMPORARY: Return JSON for debugging
      return res.status(400).json({
        error: "Spam detected",
        spamCheck: spamCheck,
        receivedData: data,
        bodyKeys: Object.keys(req.body),
      });
      // Original response (commented out for debugging):
      // return res.status(400).render("confirm", {
      //   message: {
      //     error:
      //       "There was an error processing your submission. Please try again.",
      //   },
      //   ref: null,
      // });
    }

    // Check if base is initialized
    if (!base) {
      console.error("❌ Airtable base not initialized. Check BASE environment variable.");
      return res.status(500).json({
        error: "Server configuration error",
        details: "Airtable base not initialized",
        receivedData: data,
      });
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
      const createdRecord = await table.create(record);
      if (createdRecord) {
        reference = createdRecord.id;
        console.log("✅ Contact form record created in Airtable:", reference);

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
          console.error("Failed to send contact form notification email:", err);
        });
      }
    } catch (error) {
      console.error("❌ Error creating Airtable record:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Record data:", record);
      // TEMPORARY: Return JSON for debugging
      return res.status(500).json({
        error: "Error creating Airtable record",
        errorMessage: error.message,
        errorStack: error.stack,
        recordData: record,
        receivedData: data,
      });
      // Original response (commented out for debugging):
      // return res.status(500).render("confirm", {
      //   message: {
      //     error: "Error saving your submission. Please try again later.",
      //   },
      //   ref: null,
      // });
    }
    // TEMPORARY: Return JSON to see if we get here
    return res.json({
      success: true,
      message: "Form submitted successfully",
      receivedData: data,
      reference: reference,
    });
    // Original response (commented out for debugging):
    // res.render("confirm", { message: data, ref: reference });
  } catch (error) {
    console.error("❌ Unexpected error in contact form handler:", error);
    console.error("Error stack:", error.stack);
    next(error);
  }
});

router.get("/confirm", (req, res) => {
  res.render("confirm");
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

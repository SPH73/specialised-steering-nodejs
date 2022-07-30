require('dotenv').config({ path: '../config.env' });
const express = require('express');
const requestIp = require('request-ip');

const upload = require('../utils/multer');
const { cloudinary } = require('../utils/cloudinary');
const { Airtable } = require('../utils/airtable');
const base = Airtable.base(process.env.BASE);

const router = express.Router();

// ----HOME

router.get('/', async (req, res) => {
  const meta = {
    title: 'SPECIALISED STEERING: Germiston, Gauteng, ZA - Service Worldwide',
    description:
      'We source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work. We are here to help.',
  };

  const table = base('repairsWork');
  let error = null;
  const repairs = [];
  let imgURL;
  const imageGalleryList = [];
  let img = {};

  try {
    const featuredRepairs = await table
      .select({
        view: 'Featured Repairs',
        filterByFormula: "NOT({featured} = 'false')",
        fields: [
          'repairName',
          'repairDescription',
          'mainImage',
          'componentName',
          'componentDescription',
          'imagesGallery',
        ],
      })
      .firstPage();
    if (!featuredRepairs) {
      throw Error('Unable to fetch repairs');
    }
    featuredRepairs.forEach(repair => {
      let imagesGallery = repair.fields.imagesGallery;
      imagesGallery.forEach(image => {
        imgURL = image.url.slice(37);
        let string = imgURL.indexOf('?');
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
      const ext = imageURL.indexOf('?');
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

  res.render('index', {
    meta: meta,
    repairs: repairs,
  });
});

router.post('/', async (req, res, next) => {
  const table = base('webForms');
  const clientIp = requestIp.getClientIp(req);
  const data = req.body;

  const record = {
    name: data.enquiryName,
    company: data.enquiryCompany,
    email: data.enquiryEmail,
    phone: data.enquiryNumber,
    country: data.enquiryCountry,
    message: data.enquiryMessage,
    ip: clientIp,
    status: 'New',
    form: 'contact',
  };
  let reference = '';
  try {
    const createdRecord = await table.create(record);
    if (createdRecord) {
      reference = createdRecord.id;
    }
  } catch (error) {
    console.error(error);
    next(error);
    return;
  }

  res.render('confirm', { message: data, ref: reference });
});

// ___ OUR WORK ___

router.get('/our-work', (req, res) => {
  const meta = {
    title: 'HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC',
    description:
      'We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries. Fill in a contact form if you need assistance on any hydraulic component for repair or servicing. Feel free to contact us with any related queries - we are always willing to offer expert advice.',
  };

  res.render('our-work', { meta: meta });
});

router.get('/our-work/:id', async (req, res) => {
  const meta = {
    title: 'HYDRAULIC COMPONENT SERVICE EXCHANGE & REAIRS TO OEM SPEC',
    description:
      'We offer service exchange on some hydraulic components and repair all components to OEM specification on machinery and trucks for the mining and agricultural industries. Fill in a contact form if you need assistance on any hydraulic component for repair or servicing. Feel free to contact us with any related queries - we are always willing to offer expert advice.',
  };
  const repairId = req.params.id;
  const table = base('repairsWork');
  let error = null;
  const repairImages = [];
  let img = {};
  let repair = {};

  try {
    const repairDetail = await table.find(repairId);
    if (!repairDetail) {
      throw Error('Unable to find this repair');
    }
    let imagesGallery = repairDetail.fields.imagesGallery;
    imagesGallery.forEach(image => {
      let URL = image.url.slice(37);
      let imgString = URL.indexOf('?');
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

  res.render('our-work-detail', {
    meta: meta,
    repair: repair,
    repairImages: repairImages,
    repairId: repairId,
  });
});

// ----ENQUIRY

router.get('/enquiry', (req, res) => {
  const meta = {
    title:
      'HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS',
    description:
      'We supply a wide range of industries with replacement hydraulic components from leading manufacturers. Fill out an enquiry form for the part you require and we will do our best to get you up and running again as soon as possible.',
  };

  res.render('enquiry', { meta: meta });
});

router.post('/enquiry', upload.single('image'), async (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  const image = req.file;
  const data = req.body;
  const options = {
    use_filename: true,
    unique_filename: false,
    folder: `Specialised/public/uploads/${data.enquiryName.replace(/\s/g, '')}`,
    flags: 'attachment',
  };
  const record = {
    status: 'New',
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
    form: 'parts',
  };
  let reference = '';
  try {
    const table = base('webForms');
    const createdRecord = await table.create(record);

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
      const recordId = createdRecord.id;
      const updatedRecord = await table.update(recordId, {
        imageUploads: [{ url: secure_url }],
      });
      reference = updatedRecord.id;
    }
  } catch (error) {
    console.error(error);
    next(error);
    return;
  }
  res.render('confirm', { message: data, ref: reference });
});

// ----CONTACT

router.get('/contact', (req, res) => {
  const meta = {
    title:
      'CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE',
    description:
      'With our combined 40 years of experience, we offer an expert and professional service for all your hydraulic component requirements. Please contact us today to let us know how we can help get you back up and running.',
  };
  res.render('contact', { meta: meta });
});

router.post('/contact', async (req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  const data = req.body;
  const table = base('webForms');

  const record = {
    name: data.enquiryName,
    company: data.enquiryCompany,
    email: data.enquiryEmail,
    phone: data.enquiryNumber,
    country: data.enquiryCountry,
    message: data.enquiryMessage,
    ip: clientIp,
    status: 'New',
    form: 'contact',
  };
  let reference = '';
  try {
    const createdRecord = await table.create(record);
    if (createdRecord) {
      reference = createdRecord.id;
    }
  } catch (error) {
    console.error(error);
    next(error);
    return;
  }

  res.render('confirm', { message: data, ref: reference });
});

router.get('/confirm', (req, res) => {
  res.render('confirm');
});

module.exports = router;

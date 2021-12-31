require('dotenv').config({ path: '../config.env' });
const express = require('express');
const requestIp = require('request-ip');

const upload = require('../utils/multer');
const { cloudinary } = require('../utils/cloudinary');
const { Airtable } = require('../utils/airtable');
const base = Airtable.base(process.env.BASE);

const router = express.Router();

const storedData = require('../utils/stored-data');

// ----HOME

router.get('/', async (req, res) => {
    const meta = {
        title: 'SEGURO HYDRAULICS: Gauteng, South Africa - Service Worldwide',
        description:
            'We source hydraulic components for a wide range of industries and applications. We also service, test and repair components to OEM specification. View our range and examples of client work. We are here to help.',
    };
    const table = base('repairsWork');

    const featuredRepairs = await table
        .select({
            maxRecords: 4,
            view: 'Featured Repairs',
        })
        .firstPage();
    const repairs = [];
    for (let repair of featuredRepairs) {
        let aTURL = repair.fields.mainImage[0].url.slice(37);
        let ext = aTURL.lastIndexOf('.');

        aTURL = aTURL.slice(0, ext);
        const imageURL = `https://res.cloudinary.com/seguro-form-uploads/image/upload/q_auto:good/remote_media/${aTURL}.webp`;
        repair = {
            id: repair.id,
            repairName: repair.fields.repairName,
            repairDescription: repair.fields.repairDescription,
            mainImageUrl: imageURL,
            mainImageName: repair.fields.mainImage[0].filename,
            componentName: repair.fields.componentName,
            componentDescription: repair.fields.componentDescription,
            date: repair.fields.date,
            imagesGalleryList: repair.fields.imagesGallery[0],
        };

        repairs.push(repair);
    }

    res.render('index', {
        meta: meta,
        repairs: repairs,
    });
});

router.post('/', async (req, res, next) => {
    const table = base('webForms');
    const clientIp = requestIp.getClientIp(req);
    // get the form data
    const message = req.body;

    const record = {
        status: 'New',
        name: message.contactName,
        email: message.contactEmail,
        phone: message.contactNumber,
        country: message.contactCountry,
        message: message.contactMessage,
        ip: clientIp,
    };

    try {
        await table.create(record);
    } catch (error) {
        console.error(error);
        next(error);
        return;
    }

    res.redirect('/confirm');
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

    const repairDetail = await table.find(repairId);
    console.log(repairDetail.fields);
    let repairImages = [];
    for (const images of repairDetail.fields.imagesGallery) {
        repairImages.push(images);
    }

    res.render('our-work-detail', {
        meta: meta,
        repair: repairDetail.fields,
        repairImages: repairImages,
        repairId: repairId,
    });
});

// ----ENQUIRY

router.get('/enquiry', (req, res) => {
    const meta = {
        title: 'HYDRAULIC COMPONENTS FOR MINING AND AGRICULTURAL MACHINERY AND TRUCKS',
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
        folder: `Seguro/public/uploads/${data.enquiryName.replace(/\s/g, '')}`,
        flags: 'attachment',
    };

    try {
        const record = {
            status: 'New',
            name: data.enquiryName,
            email: data.enquiryEmail,
            company: data.company,
            phone: data.enquiryPhone,
            message: data.message,
            brand: data.brand,
            type: data.type,
            partNo: data.partNo,
            serialNo: data.serialNo,
            street: data.street,
            town: data.town,
            postal: data.postal,
            region: data.province,
            country: data.country,
            ip: clientIp,
            form: 'parts',
        };
        const table = base('webForms');
        const createdRecord = await table.create(record);

        if (req.file) {
            console.log('****File was uploaded: ', req.file);
            const result = await cloudinary.uploader.upload(
                req.file.path,
                options,
                function (error) {
                    console.log(error);
                },
            );
            if (!result) {
                console.log('********* Image not stored to cloudinary');
                return;
            }
            const secure_url = result.secure_url;
            const recordId = createdRecord.id;
            const updatedRecord = await table.update(recordId, {
                imageUploads: [{ url: secure_url }],
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
        return;
    }
    res.render('confirm');
});

// ----CONTACT

router.get('/contact', (req, res) => {
    const meta = {
        title: 'CONTACT US FOR ALL YOUR HYDRAULIC REPAIRS AND PART SERVICE EXCHANGE',
        description:
            'With our combined 40 years of experience, we offer an expert and professional service for all your hydraulic component requirements. Please contact us today to let us know how we can help get you back up and running.',
    };
    res.render('contact', { meta: meta });
});

router.post('/contact', async (req, res, next) => {
    const clientIp = requestIp.getClientIp(req);
    const message = req.body;
    const table = base('webForms');

    const record = {
        status: 'New',
        name: message.contactName,
        email: message.contactEmail,
        phone: message.contactNumber,
        country: message.contactCountry,
        message: message.contactMessage,
        ip: clientIp,
        form: 'contact',
    };

    try {
        await table.create(record);
    } catch (error) {
        console.error(error);
        next(error);
        return;
    }

    res.render('/confirm');
});

router.get('/confirm', (req, res) => {
    res.render('confirm');
});

// ___ DASHBOARD ___

router.get('/dashboard', (req, res) => {
    // check user has a sessionID
    if (!res.locals.isAuth) {
        return res.status(401).render('login');
    }

    if (!res.locals.isAdmin) {
        // user forbidden
        return res.status(403).render('index');
    }

    // let msgOrder = req.query.messageOrder;
    // let msgSort = req.query.messageSort;

    // if (msgOrder !== 'desc' && msgOrder !== 'asc') {
    //     msgOrder = 'desc';
    // }

    // if (msgSort !== 'date' && msgSort !== 'name') {
    //     msgSort = 'date';
    // }

    // const table = base('webForms');
    // let messages = [];
    // const contactRecords = await table
    //     .select({ view: 'Contact Messages' })
    //     .eachPage(function page(messages, fetchNextPage) {
    //         for (let record of messages) {
    //             messages.push(record);
    //         }
    //         fetchNextPage();
    //     });

    // messages.sort((msgA, msgB) => {
    //     if (
    //         (msgSort === 'date' &&
    //             msgOrder === 'desc' &&
    //             msgA.postDate > msgB.postDate) ||
    //         (msgSort === 'name' &&
    //             msgOrder === 'desc' &&
    //             msgA.contactName > msgB.contactName)
    //     ) {
    //         return -1;
    //     } else if (
    //         (msgSort === 'date' &&
    //             msgOrder === 'asc' &&
    //             msgA.postDate > msgB.postDate) ||
    //         (msgSort === 'name' &&
    //             msgOrder === 'asc' &&
    //             msgA.contactName > msgB.contactName)
    //     ) {
    //         return 1;
    //     }
    // });

    // let enqOrder = req.query.enquiryOrder;
    // let enqSort = req.query.enquirySort;

    // if (enqOrder !== 'desc' && enqOrder !== 'asc') {
    //     enqOrder = 'desc';
    // }

    // if (enqSort !== 'date' && enqSort !== 'name') {
    //     enqSort = 'date';
    // }

    // let enquiries = [];
    // const partsRecords = await table
    //     .select({ view: 'Parts Enquiries' })
    //     .eachPage(function page(partsRecords, fetchNextPage) {
    //         for (let record of partsRecords) {
    //             enquiries.push(record);
    //         }
    //         fetchNextPage();
    //     });

    // enquiries.sort((msgA, msgB) => {
    //     if (
    //         (enqSort === 'date' &&
    //             enqOrder === 'desc' &&
    //             msgA.postDate > msgB.postDate) ||
    //         (enqSort === 'name' &&
    //             enqOrder === 'desc' &&
    //             msgA.enquiryName > msgB.enquiryName)
    //     ) {
    //         return -1;
    //     } else if (
    //         (enqSort === 'date' &&
    //             enqOrder === 'asc' &&
    //             msgA.postDate > msgB.postDate) ||
    //         (enqSort === 'name' &&
    //             enqOrder === 'asc' &&
    //             msgA.enquiryName > msgB.enquiryName)
    //     ) {
    //         return 1;
    //     }
    // });

    // for (let enquiry of enquiries) {
    //     console.log(enquiry.id);
    //     console.log(enquiry.fields);
    // }
    // console.log('All messages: ', messages);

    res.render('dashboard');
});

module.exports = router;

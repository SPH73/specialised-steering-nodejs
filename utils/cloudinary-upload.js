const https = require('https');
const http = require('http');
const { cloudinary } = require('./cloudinary');

/**
 * Upload file from URL to Cloudinary using streaming
 * Downloads from URL and uploads to Cloudinary without buffering entire file
 * @param {string} url - URL to download from
 * @param {Object} options - Upload options
 * @param {string} [options.folder] - Cloudinary folder (defaults to gallery/google-photos)
 * @param {string} [options.public_id] - Public ID for the upload
 * @param {Object} [options.transformation] - Cloudinary transformations
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadFromUrl = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'gallery/google-photos';
      const publicId = options.public_id || null;
      
      // Cloudinary upload options with transformations
      const uploadOptions = {
        folder: folder,
        resource_type: 'auto', // Auto-detect image/video
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' } // Auto WebP conversion
        ],
        ...(publicId && { public_id: publicId })
      };

      // Determine protocol
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Download and pipe to Cloudinary
      const request = httpModule.get(url, (response) => {
        // Handle HTTP errors
        if (response.statusCode < 200 || response.statusCode >= 300) {
          uploadStream.destroy();
          reject(new Error(`HTTP error: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        // Pipe response to Cloudinary upload stream
        response.pipe(uploadStream);
        
        // Handle response errors
        response.on('error', (err) => {
          uploadStream.destroy();
          reject(err);
        });
      });

      // Handle request errors
      request.on('error', (err) => {
        uploadStream.destroy();
        reject(err);
      });

      // Handle timeout
      request.setTimeout(60000, () => {
        request.destroy();
        uploadStream.destroy();
        reject(new Error('Request timeout'));
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Array} transformations - Array of transformation objects
 * @returns {string} Cloudinary URL
 */
const generateCloudinaryUrl = (publicId, transformations = []) => {
  const defaultTransformations = [
    { quality: 'auto:good' },
    { fetch_format: 'auto' } // WebP when supported
  ];
  
  const allTransformations = [...defaultTransformations, ...transformations];
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: allTransformations
  });
};

module.exports = {
  uploadFromUrl,
  generateCloudinaryUrl,
};


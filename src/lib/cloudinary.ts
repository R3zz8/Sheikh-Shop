import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables (read-only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate credentials on startup with non-blocking console warnings
const validateCredentials = () => {
  const missingCredentials = [];
  
  if (!process.env.CLOUDINARY_CLOUD_NAME) missingCredentials.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missingCredentials.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missingCredentials.push('CLOUDINARY_API_SECRET');
  
  if (missingCredentials.length > 0) {
    console.warn(`⚠️  Cloudinary credentials missing: ${missingCredentials.join(', ')}. Image uploads will not work.`);
  } else {
    console.log('✅ Cloudinary credentials loaded successfully');
  }
};

// Run validation
validateCredentials();

export default cloudinary;
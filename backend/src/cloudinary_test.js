const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary inline
cloudinary.config({
  cloud_name: 'uf9szrcy',
  api_key: '366635659684347',
  api_secret: 'Q9jxisq52YwpnCBa5oiprIxpVUg'
});

async function run() {
  try {
    console.log("Uploading sample image to Cloudinary...");
    
    // 2. Upload an image from the demo domain
    const uploadResult = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
      public_id: 'cloudinary_onboarding_sample'
    });
    
    console.log(`Secure URL: ${uploadResult.secure_url}`);
    console.log(`Public ID: ${uploadResult.public_id}`);

    // 3. Get image details
    console.log("\nImage Details:");
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`File Size: ${uploadResult.bytes} bytes`);

    // 4. Transform the image
    // Generating transformed URL with optimization parameters
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      // f_auto (fetch_format: auto): Automatically selects the most efficient image format (e.g., WebP or AVIF) supported by the viewing browser.
      fetch_format: 'auto',
      // q_auto (quality: auto): Intelligently analyzes the image to find the optimal balance between visual quality and file size.
      quality: 'auto',
      secure: true
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformedUrl);

  } catch (error) {
    console.error("Error during Cloudinary operations:", error);
  }
}

run();

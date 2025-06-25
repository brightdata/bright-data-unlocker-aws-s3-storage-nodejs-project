/**
 * Example of using Bright Data's Web Unlocker API with AWS S3 storage
 * This script demonstrates how to make a request to a website through Bright Data Unlocker
 * and store the response in an AWS S3 bucket
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();


// Configuration - Update these values
const CONFIG = {
  // Step 1: Get your API token here: https://brightdata.com/cp/setting/users
  apiToken: process.env.BRIGHT_DATA_API_TOKEN || 'YOUR_API_KEY', 
  // Step 2: Get your zone here: https://brightdata.com/cp/zones 
  zone: process.env.BRIGHT_DATA_ZONE || 'web_unlocker1', 
  // Step 3: Set your target URL
  targetUrl: 'https://geo.brdtest.com/welcome.txt',
  
  // Add format to config
  format: 'json',
  
  // AWS S3 Configuration
  s3: {
    bucketName: process.env.AWS_S3_BUCKET || 'your-s3-bucket-name',
    region: process.env.AWS_REGION || 'us-east-1',
    // Optional: If not using IAM roles, set these
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// Initialize AWS S3 client (v3)
const s3Client = new S3Client({
  region: CONFIG.s3.region,
  credentials: CONFIG.s3.accessKeyId && CONFIG.s3.secretAccessKey
    ? {
        accessKeyId: CONFIG.s3.accessKeyId,
        secretAccessKey: CONFIG.s3.secretAccessKey
      }
    : undefined
});

/**
 * Makes a request to the Bright Data API
 * @returns {Promise} Promise that resolves with the API response
 */
async function fetchWithBrightData() {
  try {
    // Input validation
    if (CONFIG.apiToken === 'YOUR_API_KEY') {
      console.warn('⚠️ Please set your actual API token before making requests');
      throw new Error('API token not configured');
    }

    console.log(`🔄 Fetching ${CONFIG.targetUrl} through Bright Data Unlocker...`);
    
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zone: CONFIG.zone,
        url: CONFIG.targetUrl,
        format: CONFIG.format
      })
    });

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Request successful!');
    return data;
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    throw error;
  }
}

/**
 * Uploads data to AWS S3 bucket
 * @param {Object} data - The data to upload
 * @param {string} targetUrl - Original target URL for naming
 * @returns {Promise} Promise that resolves when upload is complete
 */
async function uploadToS3(data, targetUrl) {
  try {
    // Generate a unique filename based on timestamp and URL
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlHash = Buffer.from(targetUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    const fileName = `scraped-data/${timestamp}-${urlHash}.json`;

    console.log(`📤 Uploading data to S3: s3://${CONFIG.s3.bucketName}/${fileName}`);

    const uploadParams = {
      Bucket: CONFIG.s3.bucketName,
      Key: fileName,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
      Metadata: {
        'original-url': targetUrl,
        'scraped-at': new Date().toISOString(),
        'source': 'bright-data-unlocker'
      }
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    // Construct S3 URL manually since v3 does not return Location
    const s3Url = `https://${CONFIG.s3.bucketName}.s3.${CONFIG.s3.region}.amazonaws.com/${fileName}`;
    console.log('✅ Successfully uploaded to S3!');
    console.log(`🔗 S3 Location: ${s3Url}`);
    return { ...result, Location: s3Url, Key: fileName };
  } catch (error) {
    console.error('❌ Error uploading to S3:', error.message);
    throw error;
  }
}

/**
 * Main function that orchestrates the scraping and storage process
 */
async function scrapeAndStore() {
  try {
    // Step 1: Fetch data using Bright Data Unlocker
    const scrapedData = await fetchWithBrightData();
    
    // Step 2: Upload to S3
    const s3Result = await uploadToS3(scrapedData, CONFIG.targetUrl);
    
    // Step 3: Display summary
    console.log('\n📊 Summary:');
    console.log(`   Target URL: ${CONFIG.targetUrl}`);
    console.log(`   S3 Bucket: ${CONFIG.s3.bucketName}`);
    console.log(`   S3 Key: ${s3Result.Key}`);
    console.log(`   Data Size: ${JSON.stringify(scrapedData).length} characters`);
    
    return {
      scrapedData,
      s3Location: s3Result.Location
    };
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Execute the main function
scrapeAndStore()
  .then(result => {
    console.log('\n🎉 Process completed successfully!');
  })
  .catch(error => {
    console.error('\n💥 Process failed with error:', error.message);
    process.exit(1);
  });

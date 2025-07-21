# Bright Data Unlocker + AWS S3 Node.js Example

[![Bright Data Promo](https://github.com/luminati-io/LinkedIn-Scraper/raw/main/Proxies%20and%20scrapers%20GitHub%20bonus%20banner.png)](https://brightdata.com/)


This project demonstrates how to use [Bright Data's Unlocker API](https://brightdata.com/products/web-unlocker) to scrape web content and store the results in an AWS S3 bucket using Node.js.

https://github.com/user-attachments/assets/95b2dbe1-3612-471a-b8b1-95c578f0b8f8

## Features
- Fetch web content through Bright Data's Unlocker API
- Store the scraped data in AWS S3 as JSON
- Easy configuration via environment variables

## Prerequisites
- Node.js (v14 or higher recommended)
- An AWS account with S3 access (and credentials)
- A Bright Data account

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Install dependencies
```sh
npm install
```

### 3. Configure environment variables
Copy the example environment file and fill in your credentials:
```sh
npm run init-env
```
Then edit the newly created `.env` file and set your actual API keys and configuration values:

- `BRIGHT_DATA_API_TOKEN`: Your Bright Data API token ([get it here](https://brightdata.com/cp/setting/users))
- `BRIGHT_DATA_ZONE`: Your Bright Data Unlocker zone ([get it here](https://brightdata.com/cp/zones))
- `AWS_S3_BUCKET`: Your AWS S3 bucket name
- `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: Your AWS credentials (if not using IAM roles)

### 4. Run the script
```sh
node index.js
```

## How it Works
- The script fetches the target URL using Bright Data's Unlocker API.
- The response is saved as a JSON file in your specified S3 bucket.
- Filenames are timestamped and include a hash of the target URL for uniqueness.

## Customization
- Change the `targetUrl` or `format` in `index.js` or via environment variables as needed.
- Adjust S3 storage paths or metadata in the `uploadToS3` function if desired.

## AWS S3 User Role Permissions

To allow this script to upload data to your S3 bucket, your AWS credentials (or IAM role) must have the correct permissions. You can use AWS IAM to create and manage these permissions.

### Example IAM Policy

Below is an example policy that grants permission to upload and retrieve objects from a specific S3 bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

- Replace `YOUR-BUCKET-NAME` with your actual S3 bucket name.
- Attach this policy to the IAM user or role whose credentials you use in your `.env` file.

For more details, see the [Bright Data documentation on AWS S3 User Role Permissions](https://docs.brightdata.com/datasets/scrapers/custom-scrapers/delivery-options#aws-s3-user-role-permissions).

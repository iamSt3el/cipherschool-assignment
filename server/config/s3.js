const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload file to S3
 * @param {string} key - S3 object key
 * @param {string} content - File content
 * @param {string} contentType - MIME type
 * @returns {Promise<object>} - Upload result
 */
const uploadToS3 = async (key, content, contentType = 'text/plain') => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: content,
    ContentType: contentType
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      success: true,
      location: result.Location,
      key: result.Key
    };
  } catch (error) {
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Get file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<string>} - File content
 */
const getFromS3 = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const result = await s3.getObject(params).promise();
    return result.Body.toString('utf-8');
  } catch (error) {
    throw new Error('Failed to get file from S3');
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<object>} - Delete result
 */
const deleteFromS3 = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Delete multiple files from S3
 * @param {Array<string>} keys - Array of S3 object keys
 * @returns {Promise<object>} - Delete result
 */
const deleteManyFromS3 = async (keys) => {
  if (!keys || keys.length === 0) {
    return { success: true };
  }

  const params = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
      Quiet: false
    }
  };

  try {
    const result = await s3.deleteObjects(params).promise();
    return {
      success: true,
      deleted: result.Deleted,
      errors: result.Errors
    };
  } catch (error) {
    throw new Error('Failed to delete files from S3');
  }
};

module.exports = {
  s3,
  uploadToS3,
  getFromS3,
  deleteFromS3,
  deleteManyFromS3
};

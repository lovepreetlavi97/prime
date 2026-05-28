import AWS from 'aws-sdk';
import logger from '../utils/logger.js';

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  /**
   * Upload an image to S3 from a Buffer or File
   * @param {Buffer} buffer - The image buffer
   * @param {string} fileName - The desired file name
   * @returns {string} - The public URL of the uploaded image
   */
  async uploadImage(buffer, fileName) {
    return this.uploadFile(buffer, fileName, 'image/png', 'achievements');
  }

  /**
   * Generic file upload to S3 with Pre-signed URL return
   */
  async uploadFile(buffer, fileName, contentType, folder = 'misc') {
    try {
      if (!this.bucketName) {
        throw new Error('S3 Bucket name missing in environment variables.');
      }

      const params = {
        Bucket: this.bucketName,
        Key: `${folder}/${Date.now()}_${fileName}`,
        Body: buffer,
        ContentType: contentType
      };

      await this.s3.upload(params).promise();
      
      // Generate a pre-signed URL valid for 24 hours
      const signedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: this.bucketName,
        Key: params.Key,
        Expires: 86400 // 24 hours in seconds
      });
      
      logger.info(`📤 File uploaded to S3 (${contentType}). Pre-signed URL generated.`);
      return signedUrl;
    } catch (error) {
      logger.error('❌ S3 Upload Failed:', error.message);
      throw error;
    }
  }
}

export default new S3Service();

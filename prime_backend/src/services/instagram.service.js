import axios from 'axios';
import logger from '../utils/logger.js';

class InstagramService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v19.0';
  }

  async postImage(imageUrl, caption) {
    logger.info('📸 Posting image to Instagram...');
    
    const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken || !businessId) {
      throw new Error('Instagram credentials missing in environment variables.');
    }

    try {
      // 1. Create Media Container
      const containerResponse = await axios.post(`${this.baseUrl}/${businessId}/media`, {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      });

      const creationId = containerResponse.data.id;
      logger.info(`✅ Media container created: ${creationId}. Waiting 10s for Instagram to process...`);

      // Wait 10 seconds for Instagram to download and process the image
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 2. Publish Media
      const publishResponse = await axios.post(`${this.baseUrl}/${businessId}/media_publish`, {
        creation_id: creationId,
        access_token: accessToken
      });

      logger.info(`🚀 Instagram Post Published: ${publishResponse.data.id}`);
      return publishResponse.data.id;
    } catch (error) {
      const errDetail = error.response?.data || error.message;
      logger.error({ error: errDetail }, '❌ Instagram post failed');
      throw error;
    }
  }

  async postReel(videoUrl, caption) {
    logger.info('🎬 Posting Reel to Instagram...');
    
    const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken || !businessId) {
      throw new Error('Instagram credentials missing in environment variables.');
    }

    try {
      // 1. Create Media Container for Reel
      const containerResponse = await axios.post(`${this.baseUrl}/${businessId}/media`, {
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        access_token: accessToken
      });

      const creationId = containerResponse.data.id;
      logger.info(`✅ Reel container created: ${creationId}. Polling for status...`);

      // 2. Poll for Status (Reels take time to process)
      let status = 'IN_PROGRESS';
      let attempts = 0;
      while (status !== 'FINISHED' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s
        const statusResponse = await axios.get(`${this.baseUrl}/${creationId}`, {
          params: {
            fields: 'status_code',
            access_token: accessToken
          }
        });
        status = statusResponse.data.status_code;
        logger.info(`⏳ Reel processing status: ${status}`);
        if (status === 'ERROR') throw new Error('Instagram video processing failed.');
        attempts++;
      }

      if (status !== 'FINISHED') throw new Error('Instagram Reel processing timed out.');

      // 3. Publish Reel
      const publishResponse = await axios.post(`${this.baseUrl}/${businessId}/media_publish`, {
        creation_id: creationId,
        access_token: accessToken
      });

      logger.info(`🚀 Instagram Reel Published: ${publishResponse.data.id}`);
      return publishResponse.data.id;
    } catch (error) {
      const errDetail = error.response?.data || error.message;
      logger.error({ error: errDetail }, '❌ Instagram Reel post failed');
      throw error;
    }
  }

  async postCarousel(imageUrls, caption) {
    logger.info(`📸 Posting carousel (${imageUrls.length} images) to Instagram...`);
    
    const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken || !businessId) {
      throw new Error('Instagram credentials missing in environment variables.');
    }

    try {
      // 1. Create Media Container for each image
      const itemIds = [];
      for (const url of imageUrls) {
        const itemResponse = await axios.post(`${this.baseUrl}/${businessId}/media`, {
          image_url: url,
          is_carousel_item: true,
          access_token: accessToken
        });
        itemIds.push(itemResponse.data.id);
        logger.info(`✅ Item container created: ${itemResponse.data.id}`);
      }

      // Wait for all items to be processed
      logger.info('⏳ Waiting 15s for all images to be processed by Instagram...');
      await new Promise(resolve => setTimeout(resolve, 15000));

      // 2. Create Carousel Container
      const carouselResponse = await axios.post(`${this.baseUrl}/${businessId}/media`, {
        media_type: 'CAROUSEL',
        children: itemIds,
        caption: caption,
        access_token: accessToken
      });

      const creationId = carouselResponse.data.id;
      logger.info(`✅ Carousel container created: ${creationId}. Waiting 5s...`);
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. Publish Carousel
      const publishResponse = await axios.post(`${this.baseUrl}/${businessId}/media_publish`, {
        creation_id: creationId,
        access_token: accessToken
      });

      logger.info(`🚀 Instagram Carousel Published: ${publishResponse.data.id}`);
      return publishResponse.data.id;
    } catch (error) {
      const errDetail = error.response?.data || error.message;
      logger.error({ error: errDetail }, '❌ Instagram carousel post failed');
      throw error;
    }
  }

  // Helper to exchange short-lived token for long-lived one
  async getLongLivedToken(shortLivedToken) {
    logger.info('🔑 Exchanging token...');
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });
      return response.data.access_token;
    } catch (error) {
      logger.error({ error: error.response?.data || error.message }, '❌ Token exchange failed');
      throw error;
    }
  }

  async getBusinessAccountId() {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const response = await axios.get(`${this.baseUrl}/me/accounts`, {
      params: {
        fields: 'instagram_business_account,name,access_token',
        access_token: accessToken
      }
    });

    return response.data.data
      .filter(page => page.instagram_business_account)
      .map(page => ({
        name: page.name,
        id: page.instagram_business_account.id,
        accessToken: page.access_token
      }));
  }
}

export default new InstagramService();

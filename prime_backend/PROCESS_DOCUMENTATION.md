# Image Generation and S3 Upload Process

This document explains the automated pipeline for generating achievement images from trading signals and uploading them to AWS S3 for social media distribution.

## 🔄 High-Level Workflow

The entire process is automated and follows these four primary steps:

1.  **Signal Selection**: Backend identifies the top-performing signal of the day.
2.  **Image Generation**: Backend calls the Frontend OG API to generate a dynamic PNG.
3.  **S3 Upload**: Backend uploads the PNG buffer to AWS S3.
4.  **Distribution**: The S3 URL is used to post the achievement on Instagram.

---

## 🛠 Detailed Process

### 1. Signal Identification
The process starts in the `DailyAchievementService` (`src/services/dailyAchievement.service.js`).
- The system queries the `signalsRepository` to find all signals generated today.
- It calculates the **growth percentage** for each profitable signal:
  `Growth = ((Current Price - Entry) / Entry) * 100`
- The signal with the highest growth is selected as the "Winner".

### 2. Dynamic Image Generation ("Taking Image from Signals")
Instead of taking a screenshot, the system dynamically generates a high-quality 1080x1080 PNG image using the **Next.js OG Image API**.

- **Endpoint**: `${FRONTEND_URL}/api/og-image`
- **Mechanism**: The backend constructs a URL with signal data passed as query parameters (e.g., `?symbol=NIFTY&growth=233.33&...`).
- **Processing**: 
    - The frontend (`src/app/api/og-image/route.tsx`) receives these parameters.
    - It uses **Satori** (via `ImageResponse`) to convert a React-based UI template into a PNG image.
    - The backend fetches this URL using `axios` with `responseType: 'arraybuffer'`.

### 3. AWS S3 Upload
Once the backend has the image buffer, it uses the `S3Service` (`src/services/s3.service.js`) to host the image publicly.

- **Storage Path**: Images are stored in the bucket under `achievements/{timestamp}_{filename}.png`.
- **Method**: `s3.upload()` sends the buffer to the configured S3 bucket.
- **Security**: The service generates a **Pre-signed URL** using `s3.getSignedUrl`.
- **Validity**: The generated URL is valid for **24 hours**, which is sufficient for Instagram's API to fetch and process the image.

### 4. Instagram Distribution
The final step uses the `InstagramService` (`src/services/instagram.service.js`).
- The S3 pre-signed URL is sent to the Instagram Graph API.
- Instagram's servers fetch the image directly from your S3 bucket.
- A custom caption (including profit details and hashtags) is attached to the post.

---

## 📂 Key Files Involved

| Component | File Path | Responsibility |
| :--- | :--- | :--- |
| **Backend Service** | `src/services/dailyAchievement.service.js` | Orchestrates the entire flow. |
| **S3 Service** | `src/services/s3.service.js` | Handles AWS SDK communication. |
| **OG API** | `src/app/api/og-image/route.tsx` | Generates the visual PNG from data. |
| **Instagram Service** | `src/services/instagram.service.js` | Publishes the final image. |

## ⚙️ Configuration Requirements
The following environment variables must be correctly set for this process to work:
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` & `AWS_S3_BUCKET`
- `FRONTEND_URL` (to call the OG API)
- `INSTAGRAM_BUSINESS_ID` & `INSTAGRAM_ACCESS_TOKEN`

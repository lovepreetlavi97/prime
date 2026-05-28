# 🔥 HIGH PERFORMANCE PRODUCTION DOCKERFILE
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Final Stage
FROM node:20-alpine
WORKDIR /app

# Install Tesseract for OCR
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

COPY --from=builder /app /app

EXPOSE 4000
CMD ["node", "index.js"]

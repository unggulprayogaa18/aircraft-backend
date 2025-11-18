# 1. Gunakan image Node.js yang ringan (Alpine Linux)
FROM node:18-alpine

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy file package.json dan package-lock.json
# (Docker akan mencari file ini di folder 'backend' karena setting context nanti)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy seluruh kode source code backend
COPY . .

# 6. Build TypeScript menjadi JavaScript (folder dist)
RUN npm run build

# 7. Cloud Run akan memberikan PORT lewat environment variable.
# Code server.ts kamu sudah siap menerima process.env.PORT
EXPOSE 8080

# 8. Jalankan server
CMD ["npm", "start"]
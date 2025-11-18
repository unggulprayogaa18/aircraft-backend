# 1. Gunakan image Node.js yang ringan (Alpine Linux)
FROM node:18-alpine

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy file package.json dan package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. BERIKAN IZIN EKSEKUSI KE TSC
RUN chmod +x /app/node_modules/.bin/tsc 

# 6. Copy seluruh kode source code backend
COPY . .

# 7. Build TypeScript menjadi JavaScript (folder dist)
RUN npm run build

# 8. Cloud Run akan memberikan PORT lewat environment variable.
EXPOSE 8080

# 9. Jalankan server
CMD ["npm", "start"]
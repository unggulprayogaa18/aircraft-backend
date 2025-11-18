# 1. Gunakan image Node.js yang ringan (Alpine Linux)
FROM node:18-alpine

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy file package.json dan package-lock.json
COPY package*.json ./

# 4. Install dependencies (NodeJS akan membuat node_modules yang bersih di sini)
RUN npm install

# 5. Copy seluruh kode source code (kecuali yang ada di .dockerignore)
COPY . . 

# 6. Build TypeScript menjadi JavaScript (folder dist)
RUN npm run build 

# 7. Cloud Run akan memberikan PORT lewat environment variable.
EXPOSE 8080

# 8. Jalankan server
CMD ["npm", "start"]
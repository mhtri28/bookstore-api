cp .env.example .env

npm install

npx prisma generate

npx prisma migrate dev

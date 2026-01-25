import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Activez CORS pour tous les ports frontend possibles
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3002', 
      'http://localhost:3003',
      'https://ton-app.vercel.app' // Remplace par ton URL Vercel
    ],
    credentials: true,
  });

  // Port dynamique pour Railway
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}`);
}
bootstrap();
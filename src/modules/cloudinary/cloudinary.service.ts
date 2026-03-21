import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('API_KEY'),
      api_secret: this.configService.get<string>('API_SECRET'),
    });
  }
  async uploadImage(file: Express.Multer.File) {
    return new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'books' }, (error, result) => {
          console.log('Cloudinary upload result:', { error, result });
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}

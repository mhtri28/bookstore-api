import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function UploadImageInterceptor(folder: string = 'images') {
  return FileInterceptor('image', {
    storage: diskStorage({
      destination: `./src/public/${folder}`,
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, uniqueName + extname(file.originalname));
      },
    }),
  });
}

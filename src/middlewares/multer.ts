import Multer from 'multer';

const FILE_SIZE_LIMIT = +(process.env.FILE_SIZE_LIMIT || `${5 * 1024 * 1024}`);

export const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
});

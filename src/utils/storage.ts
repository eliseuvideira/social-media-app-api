import { Storage } from '@google-cloud/storage';

const GCLOUD_PROJECT_ID = `${process.env.GCLOUD_PROJECT_ID}`;
const GCLOUD_BUCKET = `${process.env.GCLOUD_BUCKET}`;

export const storage = new Storage({ projectId: GCLOUD_PROJECT_ID });

export const bucket = storage.bucket(GCLOUD_BUCKET);

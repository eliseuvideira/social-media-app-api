/* eslint-disable @typescript-eslint/no-explicit-any */
interface ObjectWithAnyProps {
  [key: string]: any;
}

declare namespace Express {
  export interface Request {
    token: ObjectWithAnyProps | undefined;
  }
}

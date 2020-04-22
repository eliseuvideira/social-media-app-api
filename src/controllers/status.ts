import { RequestHandler } from 'express';
import moment from 'moment';

export const getStatus: RequestHandler = (req, res, _next) => {
  const { results } = req.query;
  if (results) {
    res.status(200).json({ timestamp: moment() });
  } else {
    res.status(204).end();
  }
};

import axios from 'axios';

export const sendEmail = async (data: object) =>
  await axios({
    method: 'post',
    url:
      process.env.NOTIFY_HOST +
      ':' +
      process.env.NOTIFY_PORT +
      '/notify/api/v1/email',
    data,
  });

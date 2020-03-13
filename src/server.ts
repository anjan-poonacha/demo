import mongoose from 'mongoose';
import dotenv from 'dotenv';

process.on('uncaughtException', err => {
  console.log(err.message, err.name);
  console.log('UNCAUGHT EXCEPTION💥 Shutting down the server...');
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL!, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(con => console.log('DB connection established'));

import app from './app';
//

const port = (process.env.PORT as unknown) as number;

const server = app.listen(port, () => {
  console.log('Listening on port ' + port);
});

process.on('unhandledRejection', reason => {
  console.log(reason);
  console.log('UNHANDLED REJECTION💥 Shutting down the server...');
  server.close(() => {
    process.exit(1);
  });
});

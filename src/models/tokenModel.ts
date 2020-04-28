import mongoose, { Document } from 'mongoose';
import axios from 'axios';

export interface IToken extends Document, TokenFields {}
export interface TokenFields {
  name: string;
  token: string;
  createdAt: Date;
}
const tokenSchema = new mongoose.Schema<IToken>({
  name: { type: String, default: 'nidaToken' },
  token: String,
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model<IToken>('Token', tokenSchema);

(() => {
  setInterval(async () => {
    try {
      const result = await axios({
        method: 'post',
        url: 'https://uat.nida.gov.rw:8081/onlineauthentication/claimtoken',
        headers: {
          'Content-Type': 'application/json',
        },

        data: {
          username: 'CRVS_QT',
          password:
            'QPmACn65LumRfxhaP6$ft9ccRV5tJ0stKLuBv0_4tsj1KL2iQ!fkJncWMiZYxNx0b8hLcXW58i3a0sKg8WUPVh1xJO5marGW@z0RDrg9orsAzb$uQT5R9Yf9h1bE7L4S',
        },
      });
      const token = (result.data as string).split(' ')[1];
      await Token.deleteMany({ createdAt: { $lt: new Date() } });
      const updatedToken = await Token.create({ name: 'nidaToken', token });

      if (!updatedToken) {
        throw new Error("Token not found or couldn't be created");
      }
    } catch (err) {
      console.log(err);
    }
  }, 1 * 10 * 1000);
})();

export default Token;

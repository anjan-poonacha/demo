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

// (() => {
//   setInterval(async () => {
//     try {
//       await Token.deleteMany({ createdAt: { $lt: new Date(Date.now()) } });
//       console.log(await Token.find());
//       await Token.create({ name: 'nidaToken' });
//       console.log(await Token.find());
//       const result = await axios({
//         method: 'post',
//         url:
//           'https://onlineauthentication.nida.gov.rw/onlineauthentication/claimtoken',
//         headers: {
//           'Content-Type': 'application/json',
//         },

//         data: {
//           username: 'CRVS-QT',
//           password:
//             'hLA_fg2FRRyWeK37DY!VH-7uZ6OUigrzBDu@1oKWv?fW3fd!_rc-RgiiUgppJixKz-uSq8gpopzK!kGU3UW7erYvumsU-unnRMw41BUfj31CYQpJQMC4DFFir-xeRCq!',
//         },
//       });
//       console.log(result);

//       const { token } = result.data;
//       const tok = await Token.findOne({ name: 'nidaToken' });
//       if (!tok) {
//         throw new Error("Token not found or couldn't be created");
//       }
//       tok.token = token as string;
//       const updatedToken = await tok.save();
//       console.log(updatedToken.token);
//     } catch (err) {
//       console.log(err);
//     }
//   }, 1 * 10 * 1000);
// })();

export default Token;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
process.on('uncaughtException', err => {
    console.log(err.message, err.name);
    console.log('UNCAUGHT EXCEPTION💥 Shutting down the server...');
    console.log(err);
    process.exit(1);
});
dotenv_1.default.config({ path: './config.env' });
mongoose_1.default
    .connect(process.env.DATABASE_LOCAL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(con => console.log('DB connection established'));
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT;
const server = app_1.default.listen(port, () => {
    console.log('Listening on port ' + port);
});
process.on('unhandledRejection', reason => {
    console.log(reason);
    console.log('UNHANDLED REJECTION💥 Shutting down the server...');
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map
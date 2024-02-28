import "dotenv/config";

const port = process.env.PORT;
const mongoDB_uri = process.env.MONGODB_URI;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

export { port, mongoDB_uri, accessTokenSecret, refreshTokenSecret };

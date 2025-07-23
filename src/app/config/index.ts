import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join((process.cwd(), '.env')) });

const aws = {
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET_NAME,
};

const stripe = {
  stripe_api_key: process.env.STRIPE_API_KEY,
  stripe_api_secret: process.env.STRIPE_API_SECRET,
};

const super_admin = {
  email: process.env.SUPER_ADMIN_EMAIL,
  password: process.env.SUPER_ADMIN_PASSWORD,
};
const ups_shipment_info = {
  ups_client_id: process.env.UPS_CLIENT_ID,
  ups_client_secret: process.env.UPS_CLIENT_SECRET,
};

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  ip: process.env.IP,
  database_url: process.env.DATABASE_URL,
  server_url: process.env.SERVER_URL,
  client_Url: process.env.CLIENT_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  nodemailer_host_email: process.env.NODEMAILER_HOST_EMAIL,
  nodemailer_host_pass: process.env.NODEMAILER_HOST_PASS,
  otp_expire_time: process.env.OTP_EXPIRE_TIME,
  otp_token_expire_time: process.env.OTP_TOKEN_EXPIRE_TIME,
  socket_port: process.env.SOCKET_PORT,
  stripe_secret: process.env.STRIPE_API_SECRET,
  shipment_url: process.env.SHIPMENT_URL,
  // stripe_key: process.env.STRIPE_API_KEY,
  WEBHOOK: process.env.WEBHOOK || '',
  aws,
  stripe,
  googleApiKey: process.env.GOOGLEAPI,
  shipment_key: process.env.SHIPMENT_KEY,
  super_admin,
  ups_shipment_info,
  // user_jwt_token: process.env.USER_JWT_TOKEN,
};

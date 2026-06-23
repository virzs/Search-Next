import * as nodeMailer from 'nodemailer';

export default class EmailUtil {
  static init(config: any) {
    return nodeMailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
}

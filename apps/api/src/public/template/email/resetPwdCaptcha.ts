const ResetPwdCaptchaTemplate = (captcha: string) => {
  return {
    subject: '重置密码',
    html: `
          <div>
              <h1>重置密码</h1>
              <p>请使用此验证码</p>
              <p>${captcha}</p>
              <p>5分钟内有效</p>
              <p>这是一封自动发送的电子邮件。如果我们误向您发送了此邮件，则您无需执行任何操作</p>
          </div>
      `,
  };
};

export default ResetPwdCaptchaTemplate;

import * as Sparkpost from 'sparkpost';

const client = new Sparkpost('process.env.SPARKPOST_API_KEY')

export const sendEmail = async (recepient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm email",
      html:
        `<html>
          <body>
            <p>Testing SparkPost - the world's most awesomest email service!</p>
            <a href="${url}">Confirm email</a>
          </body>
        </html>`
    },
    recipients: [{ address: recepient }]
  });
  console.log(response);
}
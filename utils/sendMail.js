import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import ejs from 'ejs';

const sendMail = async(options)=>{
    const transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }

    });

    const {email, subject, template, data} = options

     // Use import.meta.url to get the current module URL
     const moduleURL = new URL(import.meta.url);
    
     // Use the URL constructor to get the directory path
     const templatePath = path.join(path.dirname(moduleURL.pathname), '../mails', template);
 
     const html = await ejs.renderFile(templatePath, data);
 

    // const templatePath = path.join(__dirname, '../mails', template)

    // const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from:process.env.SMTP_MAIL,
        to:email,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
}

export default sendMail

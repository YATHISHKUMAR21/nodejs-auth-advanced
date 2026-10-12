import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html:string){
    if(!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS){

        console.log("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env file.");
        return;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587); // Default to 587 if not set
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM;


    const transporter = nodemailer.createTransport({
        host,port,secure: false , auth : {
            user,pass
        }
    }
    )

    await transporter.sendMail({from , to , subject , html})




}
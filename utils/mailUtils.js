import nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_SUBJECT_ACTIVATE_ACCOUNT, EMAIL_SUBJECT_ADD_TO_CALENDAR, EMAIL_SUBJECT_UPDATE } from "./constants";

// Create a transporter object with Gmail SMTP server configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEventDeletedMail = (userName, userEmail, eventName, dateString, timeString, location) => {
  // Define the email options
  const mailOptions = {
    from: EMAIL_FROM,
    to: userEmail,
    subject: EMAIL_SUBJECT_UPDATE,
    html: generateDeleteEventEmailTemplate(userName, eventName, dateString, timeString, location)
  };

  // Send the email to registered users
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    }else{
      console.log('Email sent successfully:', info);
    }
  });
}

export const sendEventCommentedMail = (authorEmail, authorName, userName, eventName, eventId) => {
  // Define the email options
  const mailOptions = {
    from: EMAIL_FROM,
    to: authorEmail,
    subject: EMAIL_SUBJECT_UPDATE,
    html: generateCommentEventEmailTemplate(authorName, userName, eventName, eventId)
  };

  // Send the email to registered users
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    }else{
      console.log('Email sent successfully:', info);
    }
  });
}
export const sendEventUpdatedMail = (userEmail, userName, eventName, eventId, newTitle, date, time, location, description) => {
  // Define the email options
  const mailOptions = {
    from: EMAIL_FROM,
    to: userEmail,
    subject: EMAIL_SUBJECT_UPDATE,
    html: generateUpdateEventEmailTemplate(userName, eventName, eventId, newTitle, date, time, location, description)
  };

  // Send the email to registered users
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    }else{
      console.log('Email sent successfully:', info);
    }
  });
}

export const sendActivateAccountMail = (userEmail, userName, uuid) => {
  // Define the email options
  const mailOptions = {
    from: EMAIL_FROM,
    to: userEmail,
    subject: EMAIL_SUBJECT_ACTIVATE_ACCOUNT,
    html: generateActivateAccountEmailTemplate(userName, uuid)
  };

  // Send the email to registered users
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    }else{
      console.log('Email sent successfully:', info);
    }
  });
}

export const sendEventSignUpMail = (userEmail, userName, eventName, date, time, location, ics) => {
  // Define the email options
  const mailOptions = {
    from: EMAIL_FROM,
    to: userEmail,
    subject: EMAIL_SUBJECT_ADD_TO_CALENDAR,
    html: generateEventSignUpEmailTemplate(userName, eventName, date, time, location, ics),
    attachments: [
      {
        filename: `test.ics`,
        content: ics,
        contentType: 'text/calendar',
      },
    ],
  };

  // Send the email to registered users
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    }else{
      console.log('Email sent successfully:', info);
    }
  });
}

const generateEventSignUpEmailTemplate = (userName, eventName, date, time, location, ics) => {
  return '\
  <!DOCTYPE html>\
  <html>\
  <head>\
    <title>Event Updated</title>\
    <style>\
      /* Email body styles */\
      body {\
        font-family: Arial, sans-serif;\
        font-size: 14px;\
        line-height: 1.6;\
        background-color: #f6f6f6;\
        padding: 20px;\
      }\
      \
      /* Email container styles */\
      .container {\
        max-width: 600px;\
        margin: 0 auto;\
        background-color: #fff;\
        padding: 20px;\
        border-radius: 4px;\
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\
      }\
      \
      /* Heading styles */\
      h1 {\
        color: #333;\
        font-size: 24px;\
        margin-bottom: 20px;\
      }\
      \
      /* Content styles */\
      p {\
        margin-bottom: 20px;\
      }\
      \
      /* Button styles */\
      .button {\
        display: inline-block;\
        padding: 10px 20px;\
        background-color: #007bff;\
        color: #fff;\
        text-decoration: none;\
        border-radius: 4px;\
      }\
      \
      .button:hover {\
        background-color: #0056b3;\
      }\
    </style>\
  </head>\
  <body>\
    <div class="container">\
      <h1>Event Updated</h1>\
      <p>Dear ' + userName + ',</p>\
      <p>You are now signed up for the ' + eventName + ' on ' + date + ' ' + time + ' at ' + location + '.' + '</p>\
      <p>Add the event to your calendar by downloading the attached .ics file.</p>\
      <p>If you have any questions or need further assistance, please don\'t hesitate to contact us.</p>\
      <p>Thank you for using our platform.</p>\
      <p>Best regards,</p>\
      <p>Your Event Team</p>\
    </div>\
  </body>\
  </html>';
}
const generateActivateAccountEmailTemplate = (userName, uuid) => {
  return '\
  <!DOCTYPE html>\
  <html>\
  <head>\
    <title>Event Updated</title>\
    <style>\
      /* Email body styles */\
      body {\
        font-family: Arial, sans-serif;\
        font-size: 14px;\
        line-height: 1.6;\
        background-color: #f6f6f6;\
        padding: 20px;\
      }\
      \
      /* Email container styles */\
      .container {\
        max-width: 600px;\
        margin: 0 auto;\
        background-color: #fff;\
        padding: 20px;\
        border-radius: 4px;\
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\
      }\
      \
      /* Heading styles */\
      h1 {\
        color: #333;\
        font-size: 24px;\
        margin-bottom: 20px;\
      }\
      \
      /* Content styles */\
      p {\
        margin-bottom: 20px;\
      }\
      \
      /* Button styles */\
      .button {\
        display: inline-block;\
        padding: 10px 20px;\
        background-color: #007bff;\
        color: #fff;\
        text-decoration: none;\
        border-radius: 4px;\
      }\
      \
      .button:hover {\
        background-color: #0056b3;\
      }\
    </style>\
  </head>\
  <body>\
    <div class="container">\
      <h1>Event Updated</h1>\
      <p>Dear ' + userName + ',</p>\
      <p>Click <h2><a href="' + process.env.HOST + '/activate-account/' + uuid + '">HERE</a></h2> to activate your account.</p>\
      <p>If you have any questions or need further assistance, please don\'t hesitate to contact us.</p>\
      <p>Thank you for using our platform.</p>\
      <p>Best regards,</p>\
      <p>Your Event Team</p>\
    </div>\
  </body>\
  </html>';
}
const generateUpdateEventEmailTemplate = (userName, eventName, eventId, newTitle, date, time, location, description) => {
  return '\
  <!DOCTYPE html>\
  <html>\
  <head>\
    <title>Event Updated</title>\
    <style>\
      /* Email body styles */\
      body {\
        font-family: Arial, sans-serif;\
        font-size: 14px;\
        line-height: 1.6;\
        background-color: #f6f6f6;\
        padding: 20px;\
      }\
      \
      /* Email container styles */\
      .container {\
        max-width: 600px;\
        margin: 0 auto;\
        background-color: #fff;\
        padding: 20px;\
        border-radius: 4px;\
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\
      }\
      \
      /* Heading styles */\
      h1 {\
        color: #333;\
        font-size: 24px;\
        margin-bottom: 20px;\
      }\
      \
      /* Content styles */\
      p {\
        margin-bottom: 20px;\
      }\
      \
      /* Button styles */\
      .button {\
        display: inline-block;\
        padding: 10px 20px;\
        background-color: #007bff;\
        color: #fff;\
        text-decoration: none;\
        border-radius: 4px;\
      }\
      \
      .button:hover {\
        background-color: #0056b3;\
      }\
    </style>\
  </head>\
  <body>\
    <div class="container">\
      <h1>Event Updated</h1>\
      <p>Dear ' + userName + ',</p>\
      <p><a href="' + process.env.HOST + '/' + eventId + '">' + eventName + '</a>\'s details just got updated. Check it out!</p>\
      <h3>The updated details are:</h3>\
      <p>Title: ' + newTitle + '</p>\
      <p>Date: ' + date + '</p>\
      <p>Time: ' + time + '</p>\
      <p>Location: ' + location + '</p>\
      <p>Description: ' + description + '</p>\
      <p>If you have any questions or need further assistance, please don\'t hesitate to contact us.</p>\
      <p>Thank you for using our platform.</p>\
      <p>Best regards,</p>\
      <p>Your Event Team</p>\
    </div>\
  </body>\
  </html>';
}
const generateCommentEventEmailTemplate = (authorName, userName, eventName, eventId) => {
  return '\
  <!DOCTYPE html>\
  <html>\
  <head>\
    <title>Event Comment</title>\
    <style>\
      /* Email body styles */\
      body {\
        font-family: Arial, sans-serif;\
        font-size: 14px;\
        line-height: 1.6;\
        background-color: #f6f6f6;\
        padding: 20px;\
      }\
      \
      /* Email container styles */\
      .container {\
        max-width: 600px;\
        margin: 0 auto;\
        background-color: #fff;\
        padding: 20px;\
        border-radius: 4px;\
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\
      }\
      \
      /* Heading styles */\
      h1 {\
        color: #333;\
        font-size: 24px;\
        margin-bottom: 20px;\
      }\
      \
      /* Content styles */\
      p {\
        margin-bottom: 20px;\
      }\
      \
      /* Button styles */\
      .button {\
        display: inline-block;\
        padding: 10px 20px;\
        background-color: #007bff;\
        color: #fff;\
        text-decoration: none;\
        border-radius: 4px;\
      }\
      \
      .button:hover {\
        background-color: #0056b3;\
      }\
    </style>\
  </head>\
  <body>\
    <div class="container">\
      <h1>Event Comment</h1>\
      <p>Dear ' + authorName + ',</p>\
      <p>' + userName + ' just commented on your event <a href="' + process.env.HOST + '/' + eventId + '">' + eventName + '</a>. Check it out!</p>\
      <p>If you have any questions or need further assistance, please don\'t hesitate to contact us.</p>\
      <p>Thank you for using our platform.</p>\
      <p>Best regards,</p>\
      <p>Your Event Team</p>\
    </div>\
  </body>\
  </html>';
}

const generateDeleteEventEmailTemplate = (userName, eventName, dateString, timeString, location) => {
  return '\
  <!DOCTYPE html>\
  <html>\
  <head>\
    <title>Event Update</title>\
    <style>\
      /* Email body styles */\
      body {\
        font-family: Arial, sans-serif;\
        font-size: 14px;\
        line-height: 1.6;\
        background-color: #f6f6f6;\
        padding: 20px;\
      }\
      \
      /* Email container styles */\
      .container {\
        max-width: 600px;\
        margin: 0 auto;\
        background-color: #fff;\
        padding: 20px;\
        border-radius: 4px;\
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\
      }\
      \
      /* Heading styles */\
      h1 {\
        color: #333;\
        font-size: 24px;\
        margin-bottom: 20px;\
      }\
      \
      /* Content styles */\
      p {\
        margin-bottom: 20px;\
      }\
      \
      /* Button styles */\
      .button {\
        display: inline-block;\
        padding: 10px 20px;\
        background-color: #007bff;\
        color: #fff;\
        text-decoration: none;\
        border-radius: 4px;\
      }\
      \
      .button:hover {\
        background-color: #0056b3;\
      }\
    </style>\
  </head>\
  <body>\
    <div class="container">\
      <h1>Event Update</h1>\
      <p>Dear ' + userName + ',</p>\
      <p>We regret to inform you that the event you were subscribed for, ' + eventName + ' on ' + dateString + ' at ' + timeString + ' from ' + location + ', has been deleted by the author.</p>\
      <p>If you have any questions or need further assistance, please don\'t hesitate to contact us.</p>\
      <p>Thank you for your understanding.</p>\
      <p>Best regards,</p>\
      <p>Your Event Team</p>\
    </div>\
  </body>\
  </html>';
}

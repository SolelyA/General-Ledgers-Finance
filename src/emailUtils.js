import emailjs from 'emailjs-com';

// Function to send email using EmailJS

emailjs.init('Vi1TKgZ8-4VjyfZEd');

export const sendSignupNotification = async (name, email) => {
  try {
    var templateParams = {
        user_name: name,
        user_email: email,
      };
    // Send email using EmailJS service ID, template ID, and user ID
    const result = await emailjs.send(
      'service_4exj81f', // Your EmailJS service ID
      'template_ozo0f07', // Your EmailJS template ID
      templateParams
    );

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendApprovalNotification = async (name, email) => {
  try {
    var templateParams = {
        user_name: name,
        to_email: email,

      };
    // Send email using EmailJS service ID, template ID, and user ID
    const result = await emailjs.send(
      'service_4exj81f', // Your EmailJS service ID
      'template_7mkgqeq', // Your EmailJS template ID
      templateParams
    );

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }

  

};
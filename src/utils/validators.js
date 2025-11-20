// CNIC validation (Pakistani format: 12345-1234567-1)
export const validateCNIC = (cnic) => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

// Phone number validation (Pakistani format)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


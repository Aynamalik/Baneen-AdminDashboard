// Re-export helpers for convenience
export * from './helpers';

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// Format CNIC
export const formatCNIC = (cnic) => {
  if (!cnic) return '';
  const cleaned = cnic.replace(/\D/g, '');
  if (cleaned.length === 13) {
    return cleaned.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$3');
  }
  return cnic;
};


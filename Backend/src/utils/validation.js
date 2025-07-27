exports.validateName = (name) => {
  return name && name.length >= 20 && name.length <= 60;
};

exports.validateAddress = (address) => {
  return address && address.length <= 400;
};

exports.validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password &&
    password.length >= 8 &&
    password.length <= 16 &&
    hasUpperCase &&
    hasSpecialChar
  );
};

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

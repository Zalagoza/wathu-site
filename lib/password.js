const COMMON = ['12345678', '123456789', '1234567890', '11111111', '00000000', 'password', 'password1', 'password123', 'qwertyui', 'qwerty123', 'abcd1234', 'abc12345', 'iloveyou', 'letmein1', 'welcome1', 'welcome123', 'admin123', 'malawi123', 'malawi2024', 'wathu123', 'monkey123', 'dragon123', 'football1', 'sunshine1'];

// returns an error message, or '' when the password is acceptable
export function checkPassword(pw, phone = '') {
  const p = String(pw || '');
  if (p.length < 8) return 'Password must be at least 8 characters.';
  if (p.length > 100) return 'Password is too long.';
  if (COMMON.includes(p.toLowerCase())) return 'That password is too easy to guess. Please choose another.';
  if (/^(.)\1+$/.test(p)) return 'Please choose a less repetitive password.';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 7 && p.replace(/\D/g, '') === digits) return 'Your password should not be your phone number.';
  return '';
}

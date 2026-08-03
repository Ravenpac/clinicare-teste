export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let firstRemainder = (sum * 10) % 11;
  if (firstRemainder === 10 || firstRemainder === 11) firstRemainder = 0;
  if (firstRemainder !== parseInt(cleanCPF.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  let secondRemainder = (sum * 10) % 11;
  if (secondRemainder === 10 || secondRemainder === 11) secondRemainder = 0;
  if (secondRemainder !== parseInt(cleanCPF.charAt(10), 10)) return false;

  return true;
}

export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;

  const ddd = parseInt(cleanPhone.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;

  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') {
    return false;
  }

  return true;
}

export function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

export function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  const now = new Date();

  if (date > now) return false;
  if (now.getFullYear() - year > 130) return false;

  return true;
}

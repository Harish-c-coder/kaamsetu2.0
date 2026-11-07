export function checkPasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Enter Password',
      color: 'bg-gray-300',
      textColor: 'text-gray-400',
      isStrong: false,
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const passCount = Object.values(checks).filter(Boolean).length;

  let label = 'Very Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-500';

  if (passCount === 5) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  } else if (passCount >= 3) {
    label = 'Moderate';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (passCount >= 2) {
    label = 'Weak';
    color = 'bg-orange-500';
    textColor = 'text-orange-500';
  }

  return {
    score: passCount,
    label,
    color,
    textColor,
    isStrong: passCount === 5,
    checks,
  };
}

export function generateStrongPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + numbers + special;

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

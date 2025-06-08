
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    special: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const feedback: string[] = [];
  let score = 0;
  
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  // Length check
  if (requirements.length) {
    score += 20;
  } else {
    feedback.push('Mindestens 8 Zeichen erforderlich');
  }

  // Character variety checks
  if (requirements.uppercase) {
    score += 15;
  } else {
    feedback.push('Mindestens ein Großbuchstabe erforderlich');
  }

  if (requirements.lowercase) {
    score += 15;
  } else {
    feedback.push('Mindestens ein Kleinbuchstabe erforderlich');
  }

  if (requirements.numbers) {
    score += 20;
  } else {
    feedback.push('Mindestens eine Zahl erforderlich');
  }

  if (requirements.special) {
    score += 20;
  } else {
    feedback.push('Mindestens ein Sonderzeichen erforderlich');
  }

  // Additional length bonus
  if (password.length >= 12) {
    score += 10;
  }

  // Common patterns penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Vermeiden Sie wiederholende Zeichen');
  }

  // Sequential patterns penalty
  if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) {
    score -= 15;
    feedback.push('Vermeiden Sie aufeinanderfolgende Zeichen');
  }

  const isValid = Object.values(requirements).every(req => req) && score >= 60;

  return {
    isValid,
    score: Math.max(0, Math.min(100, score)),
    feedback,
    requirements
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score < 30) return 'text-red-600';
  if (score < 60) return 'text-yellow-600';
  if (score < 80) return 'text-blue-600';
  return 'text-green-600';
};

export const getPasswordStrengthText = (score: number): string => {
  if (score < 30) return 'Schwach';
  if (score < 60) return 'Mittel';
  if (score < 80) return 'Stark';
  return 'Sehr stark';
};

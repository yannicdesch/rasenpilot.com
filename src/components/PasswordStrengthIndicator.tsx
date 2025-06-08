
import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordValidationResult, getPasswordStrengthColor, getPasswordStrengthText } from '@/utils/passwordValidation';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  validationResult: PasswordValidationResult;
  showDetails?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  validationResult,
  showDetails = true,
  className = ''
}) => {
  const { score, requirements, feedback, isValid } = validationResult;
  const strengthColor = getPasswordStrengthColor(score);
  const strengthText = getPasswordStrengthText(score);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Passwortstärke</span>
          <span className={`text-sm font-medium ${strengthColor}`}>
            {strengthText} ({score}%)
          </span>
        </div>
        <Progress 
          value={score} 
          className={`h-2 ${score < 30 ? 'bg-red-100' : score < 60 ? 'bg-yellow-100' : score < 80 ? 'bg-blue-100' : 'bg-green-100'}`}
        />
      </div>

      {/* Requirements Checklist */}
      {showDetails && password.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Anforderungen:</p>
          <div className="space-y-1">
            <RequirementItem 
              met={requirements.length} 
              text="Mindestens 8 Zeichen"
            />
            <RequirementItem 
              met={requirements.uppercase} 
              text="Mindestens ein Großbuchstabe"
            />
            <RequirementItem 
              met={requirements.lowercase} 
              text="Mindestens ein Kleinbuchstabe"
            />
            <RequirementItem 
              met={requirements.numbers} 
              text="Mindestens eine Zahl"
            />
            <RequirementItem 
              met={requirements.special} 
              text="Mindestens ein Sonderzeichen"
            />
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((message, index) => (
            <p key={index} className="text-xs text-gray-600 flex items-center gap-1">
              <X className="h-3 w-3 text-red-500" />
              {message}
            </p>
          ))}
        </div>
      )}

      {/* Success Message */}
      {isValid && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Passwort erfüllt alle Sicherheitsanforderungen</span>
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-gray-400" />
    )}
    <span className={met ? 'text-green-700' : 'text-gray-600'}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthIndicator;

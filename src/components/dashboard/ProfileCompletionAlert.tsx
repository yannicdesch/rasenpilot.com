
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from 'lucide-react';

interface ProfileCompletionAlertProps {
  profileCompletion: number;
  onShowProfileCompletion: () => void;
}

const ProfileCompletionAlert: React.FC<ProfileCompletionAlertProps> = ({
  profileCompletion,
  onShowProfileCompletion
}) => {
  if (profileCompletion >= 100) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-2">
              Profil vervollständigen ({profileCompletion}%)
            </h3>
            <Progress value={profileCompletion} className="mb-3 h-2" />
            <p className="text-orange-700 mb-4">
              Vervollständigen Sie Ihr Profil für bessere Empfehlungen und vollständige Wetterdaten.
            </p>
            <Button 
              onClick={onShowProfileCompletion}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Profil vervollständigen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionAlert;

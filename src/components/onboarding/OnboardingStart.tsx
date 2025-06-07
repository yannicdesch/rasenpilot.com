
import React, { useState } from 'react';
import { OnboardingData } from './OnboardingFlow';
import PhotoUploadView from './PhotoUploadView';
import GoalSelectionView from './GoalSelectionView';
import { useAnalysis } from './hooks/useAnalysis';
import { toast } from 'sonner';

interface OnboardingStartProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onAnalysisComplete?: () => void;
  isPhotoUpload?: boolean;
}

const OnboardingStart: React.FC<OnboardingStartProps> = ({ 
  data, 
  updateData, 
  onNext,
  onAnalysisComplete,
  isPhotoUpload = false
}) => {
  const [hasImage, setHasImage] = useState(!!data.rasenbild);
  const { analysisResults, showAnalysis, isAnalyzing, handleAnalyzeImage } = useAnalysis();

  const handleNext = () => {
    updateData({ 
      rasenbild: data.rasenbild,
      rasenproblem: data.rasenproblem
    });
    onNext();
  };

  const handleImageSelected = (imageUrl: string) => {
    console.log('Image selected:', imageUrl);
    updateData({ rasenbild: imageUrl });
    setHasImage(true);
  };

  const handleAnalyze = async () => {
    if (!hasImage && !data.rasenbild) {
      toast.error('Bitte lade zuerst ein Bild hoch');
      return;
    }
    
    // Pass the current data to the analysis function
    const dataWithImage = { ...data, rasenbild: data.rasenbild || localStorage.getItem('currentImageUrl') };
    await handleAnalyzeImage(data.rasenproblem, (updates) => {
      updateData({ ...updates, ...dataWithImage });
    });
  };

  const handleContinueToRegistration = () => {
    if (onAnalysisComplete) {
      onAnalysisComplete();
    }
  };

  if (isPhotoUpload) {
    return (
      <PhotoUploadView
        data={data}
        updateData={updateData}
        hasImage={hasImage}
        isAnalyzing={isAnalyzing}
        showAnalysis={showAnalysis}
        analysisResults={analysisResults}
        onImageSelected={handleImageSelected}
        onAnalyzeImage={handleAnalyze}
        onContinueToRegistration={handleContinueToRegistration}
      />
    );
  }

  return (
    <GoalSelectionView
      data={data}
      updateData={updateData}
      onNext={handleNext}
    />
  );
};

export default OnboardingStart;

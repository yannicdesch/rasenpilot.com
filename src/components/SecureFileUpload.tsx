
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Shield, AlertTriangle } from 'lucide-react';
import { validateImageFile, validateImageDimensions, generateSecureFileName } from '@/utils/fileValidation';
import { toast } from 'sonner';

interface SecureFileUploadProps {
  onFileSelect: (file: File, secureFileName: string) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  maxFiles = 1,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  disabled = false,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback(async (file: File) => {
    setIsValidating(true);
    const errors: string[] = [];

    // Basic file validation
    const basicValidation = validateImageFile(file);
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Image dimensions validation
    if (basicValidation.isValid) {
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.isValid) {
        errors.push(...dimensionValidation.errors);
      }
    }

    setIsValidating(false);
    return errors;
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      toast.error(`Maximal ${maxFiles} Datei(en) erlaubt`);
      return;
    }

    const allErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const fileErrors = await validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        allErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    }

    setValidationErrors(allErrors);

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      
      // Generate secure filename and call parent handler
      for (const file of validFiles) {
        const secureFileName = generateSecureFileName(file.name);
        onFileSelect(file, secureFileName);
      }
      
      if (allErrors.length === 0) {
        toast.success(`${validFiles.length} Datei(en) erfolgreich ausgewählt`);
      }
    }

    // Clear the input
    event.target.value = '';
  }, [maxFiles, validateFile, onFileSelect]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setValidationErrors([]);
    }
  }, [selectedFiles.length]);

  return (
    <Card className={`border-green-100 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-green-600" />
          Sichere Datei-Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Sicherheitsvalidierung aktiv:</p>
              <ul className="text-xs space-y-1">
                <li>• Nur erlaubte Dateiformate (JPEG, PNG, WebP)</li>
                <li>• Maximale Dateigröße: 10MB</li>
                <li>• Maximale Bildauflösung: 4096x4096px</li>
                <li>• Automatische Dateinamen-Bereinigung</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Input */}
        <div className="relative">
          <input
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            disabled={disabled || isValidating}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="secure-file-upload"
          />
          <label
            htmlFor="secure-file-upload"
            className={`
              flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
              ${disabled || isValidating 
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                : 'border-green-300 bg-green-50 hover:bg-green-100'
              }
              transition-colors duration-200
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${disabled || isValidating ? 'text-gray-400' : 'text-green-600'}`} />
              <p className={`text-sm ${disabled || isValidating ? 'text-gray-500' : 'text-green-800'}`}>
                {isValidating ? 'Validierung läuft...' : 'Klicken zum Hochladen oder Datei hierher ziehen'}
              </p>
              <p className={`text-xs ${disabled || isValidating ? 'text-gray-400' : 'text-green-600'}`}>
                {accept.split(',').join(', ')} (max. 10MB)
              </p>
            </div>
          </label>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-medium mb-2">Validierungsfehler:</p>
              <ul className="text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-800">Ausgewählte Dateien:</p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-800">{file.name}</span>
                  <span className="text-xs text-green-600">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 text-green-600 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecureFileUpload;

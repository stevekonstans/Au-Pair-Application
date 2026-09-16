export type LanguageProficiency = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'None' | '';

export type SwimmingProficiency = 'Excellent' | 'Good' | 'Fair' | 'Poor' | "I can't swim" | '';

export interface ApplicationFormData {
  // Page 1 — Applicant Information
  fullName: string;
  dateOfBirth: string;
  email: string;
  confirmEmail: string;
  phone: string;
  country: string;
  nationality: string;
  gender: string;

  // Page 2 — Availability
  applyingCountry: string; // Australia, Spain, Ireland, Italy, England
  stayDuration: string;
  earliestTravelDate: string;

  // Page 3 — Your Childcare Experience & Skills
  childcareAgeExperience: string[];
  numberOfChildren: string[];
  driversLicense: 'Yes' | 'No' | '';
  languageEnglish: LanguageProficiency;
  languageFrench: LanguageProficiency;
  languageGerman: LanguageProficiency;
  languageSpanish: LanguageProficiency;
  nativeLanguage: string;
  swimmingSkills: SwimmingProficiency;

  // Page 4 — Lifestyle & Preferences
  singleParentFamily: 'With a single mother' | 'With a single father' | 'No' | '';
  familyWithPets: 'Yes' | 'Yes with exceptions' | 'No' | '';
  petsNotAccepted: string;
  smoke: 'Yes' | 'No' | '';
  cigarettesPerDay: string;

  // Page 5 — General
  legalBackground: 'Yes' | 'No' | '';
  legalBackgroundDetails: string;
  chronicHealth: 'Yes' | 'No' | '';
  chronicHealthDetails: string;
  counsellingSupport: 'Yes' | 'No' | '';
  counsellingSupportDetails: string;
  eatingHealthIssue: 'Yes' | 'No' | '';
  eatingHealthIssueDetails: string;
  takingMedication: 'Yes' | 'No' | '';
  takingMedicationDetails: string;
}

export interface StepMeta {
  id: number;
  title: string;
  gamifiedHeading?: string;
}


export type ApplicationData = ApplicationFormData;

export interface CountryConfigItem {
  googleDriveFolderId: string;
  googleSheetId: string;
  sheetTabName: string;
}

export type CountryConfigMap = Record<string, CountryConfigItem>;

export interface SaveDraftPayload {
  email: string;
  currentStep: number;
  data: Partial<ApplicationData>;
}

export interface SaveDraftResponse {
  success: boolean;
  token: string;
  resumeUrl: string;
  emailSent: boolean;
  message: string;
}

export interface ResumeDraftResponse {
  success: boolean;
  data: Partial<ApplicationData>;
  currentStep: number;
  savedAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  applicationId: string;
  pdfUrl: string;
  googleDriveSync: {
    status: 'success' | 'simulated' | 'error';
    fileId?: string;
    folderId: string;
    fileName: string;
    message: string;
  };
  googleSheetsSync: {
    status: 'success' | 'simulated' | 'error';
    spreadsheetId: string;
    appendedRow?: (string | number)[];
    message: string;
  };
  message: string;
}

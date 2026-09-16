import { ApplicationFormData, StepMeta } from './types';

export const INITIAL_APPLICATION_DATA: ApplicationFormData = {
  // Page 1 — Applicant Information
  fullName: '',
  dateOfBirth: '',
  email: '',
  confirmEmail: '',
  phone: '',
  country: 'Sweden',
  nationality: 'Swedish',
  gender: '',

  // Page 2 — Availability
  applyingCountry: 'Australia',
  stayDuration: '6 months',
  earliestTravelDate: '',

  // Page 3 — Your Childcare Experience & Skills
  childcareAgeExperience: [],
  numberOfChildren: [],
  driversLicense: '',
  languageEnglish: '',
  languageFrench: '',
  languageGerman: '',
  languageSpanish: '',
  nativeLanguage: 'Swedish',
  swimmingSkills: '',

  // Page 4 — Lifestyle & Preferences
  singleParentFamily: '',
  familyWithPets: '',
  petsNotAccepted: '',
  smoke: '',
  cigarettesPerDay: '',

  // Page 5 — General
  legalBackground: '',
  legalBackgroundDetails: '',
  chronicHealth: '',
  chronicHealthDetails: '',
  counsellingSupport: '',
  counsellingSupportDetails: '',
  eatingHealthIssue: '',
  eatingHealthIssueDetails: '',
  takingMedication: '',
  takingMedicationDetails: '',
};

export const STEP_METADATA: StepMeta[] = [
  {
    id: 1,
    title: 'Applicant Information',
  },
  {
    id: 2,
    title: 'Availability',
    gamifiedHeading: 'Nice one! 🎉 You’re off to a great start!',
  },
  {
    id: 3,
    title: 'Your Childcare Experience & Skills',
    gamifiedHeading: 'Let families see the real you – your hobbies and passions help us match you with your perfect fam! 🚴♀️🎶🏓',
  },
  {
    id: 4,
    title: 'Lifestyle & Preferences',
    gamifiedHeading: 'Awesome! 😎 You’re cruising through this like a pro. Just a few more questions about your lifestyle & preferences and you’ll be all set!',
  },
  {
    id: 5,
    title: 'General',
    gamifiedHeading: 'You’re smashing it',
  },
];


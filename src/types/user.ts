export interface IndividualUser {
  type: 'individual';
  name: string;
  email: string;
  phone?: string;
  linkedIn?: string;
}

export interface BusinessUser {
  type: 'business';
  businessName: string;
  websiteUrl: string;
  ownerName: string;
  email: string;
  industry?: string;
}

export type User = IndividualUser | BusinessUser;

export interface VerificationAnswers {
  dataBreachNotifications: boolean | null;
  californiaResident: boolean | null;
  spamCalls: boolean | null;
  retailerAccounts: boolean | null;
  vehicleOwner: boolean | null;
  californiaEmployer: boolean | null;
}

export interface UserProfile extends IndividualUser {
  verificationAnswers?: VerificationAnswers;
  eligibilityScore: number;
  activeJurisdictions: string[];
  claimsAccepted: string[];
  claimsSkipped: string[];
}

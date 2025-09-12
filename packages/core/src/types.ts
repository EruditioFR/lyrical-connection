// Core types for the casting system
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  settings: TenantSettings;
  isActive: boolean;
}

export interface TenantSettings {
  theme?: {
    primaryColor: string;
    logo?: string;
    fonts?: {
      primary: string;
    };
  };
  scoring?: {
    defaultCriteria: ScoringCriteria;
  };
  features?: {
    embedsEnabled: boolean;
    webhooksEnabled: boolean;
    customDomainEnabled: boolean;
  };
}

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  settings: Record<string, any>;
  isActive: boolean;
}

export interface ScoringCriteria {
  vocalRange: ScoringWeight;
  experience: ScoringWeight;
  availability: ScoringWeight;
  locationProximity: ScoringWeight;
  repertoire: ScoringWeight;
}

export interface ScoringWeight {
  weight: number; // 0-1
  method: 'linear' | 'exponential' | 'threshold';
  minValue?: number;
  maxValue?: number;
  settings?: Record<string, any>;
}

export interface Applicant {
  id: string;
  tenantId: string;
  artistProfileId: string;
  castingId: string;
  profile: ArtistProfile;
  application: ApplicationData;
  scores?: ApplicantScore[];
}

export interface ArtistProfile {
  id: string;
  userId: string;
  stageName: string;
  voiceType?: string;
  experienceYears: number;
  location?: string;
  repertoire: string[];
  availability?: AvailabilityData;
}

export interface ApplicationData {
  id: string;
  coverLetter: string;
  motivation: string;
  availabilityNotes?: string;
  appliedAt: Date;
}

export interface AvailabilityData {
  startDate?: Date;
  endDate?: Date;
  flexibilityLevel: 'rigid' | 'moderate' | 'flexible';
  notes?: string;
}

export interface CastingRole {
  id: string;
  castingId: string;
  roleName: string;
  voiceType?: string;
  description?: string;
  isLeadRole: boolean;
  quantityNeeded: number;
}

export interface ApplicantScore {
  criteriaName: string;
  rawScore: number;
  weightedScore: number;
  notes?: string;
  scoredBy?: string;
  scoredAt: Date;
}

export interface ScoringResult {
  applicantId: string;
  totalScore: number;
  criteriaScores: ApplicantScore[];
  recommendation: 'accept' | 'reject' | 'waitlist' | 'shortlist';
  confidence: number; // 0-1
}

export interface Assignment {
  roleId: string;
  applicantId: string;
  score: number;
  rank: number;
  status: 'assigned' | 'backup' | 'waitlisted';
}

export interface CastingContext {
  tenantId: string;
  casting: {
    id: string;
    title: string;
    roles: CastingRole[];
    deadline: Date;
    location?: string;
  };
  scoringCriteria: ScoringCriteria;
  customSettings?: Record<string, any>;
}
import { 
  Applicant, 
  ScoringCriteria, 
  ScoringResult, 
  Assignment, 
  CastingRole, 
  CastingContext,
  ApplicantScore,
  ScoringWeight 
} from './types';

/**
 * Core scoring engine for casting applications
 * Isolated from any specific implementation details
 */
export class CastingEngine {
  private context: CastingContext;

  constructor(context: CastingContext) {
    this.context = context;
  }

  /**
   * Score a single applicant against the criteria
   */
  scoreApplicant(applicant: Applicant): ScoringResult {
    const criteriaScores: ApplicantScore[] = [];
    const criteria = this.context.scoringCriteria;

    // Score vocal range compatibility
    const vocalRangeScore = this.scoreVocalRange(applicant, criteria.vocalRange);
    criteriaScores.push(vocalRangeScore);

    // Score experience level
    const experienceScore = this.scoreExperience(applicant, criteria.experience);
    criteriaScores.push(experienceScore);

    // Score availability
    const availabilityScore = this.scoreAvailability(applicant, criteria.availability);
    criteriaScores.push(availabilityScore);

    // Score location proximity
    const locationScore = this.scoreLocationProximity(applicant, criteria.locationProximity);
    criteriaScores.push(locationScore);

    // Score repertoire match
    const repertoireScore = this.scoreRepertoire(applicant, criteria.repertoire);
    criteriaScores.push(repertoireScore);

    // Calculate total weighted score
    const totalScore = criteriaScores.reduce((sum, score) => sum + score.weightedScore, 0);
    const maxPossibleScore = Object.values(criteria).reduce((sum, weight) => sum + weight.weight, 0);
    const normalizedScore = totalScore / maxPossibleScore;

    // Determine recommendation based on score
    const recommendation = this.determineRecommendation(normalizedScore);
    
    // Calculate confidence based on score distribution
    const confidence = this.calculateConfidence(criteriaScores);

    return {
      applicantId: applicant.id,
      totalScore: normalizedScore,
      criteriaScores,
      recommendation,
      confidence
    };
  }

  /**
   * Score multiple applicants and return sorted results
   */
  scoreApplicants(applicants: Applicant[]): ScoringResult[] {
    return applicants
      .map(applicant => this.scoreApplicant(applicant))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Assign roles to applicants based on scores
   */
  assignRoles(applicants: Applicant[], roles: CastingRole[]): Assignment[] {
    const scoringResults = this.scoreApplicants(applicants);
    const assignments: Assignment[] = [];

    // Group applicants by voice type preference
    const applicantsByVoiceType = this.groupApplicantsByVoiceType(applicants, scoringResults);

    for (const role of roles) {
      const suitableApplicants = this.getSuitableApplicants(
        applicantsByVoiceType, 
        role, 
        scoringResults
      );

      // Assign primary candidates
      for (let i = 0; i < Math.min(role.quantityNeeded, suitableApplicants.length); i++) {
        const applicant = suitableApplicants[i];
        const score = scoringResults.find(r => r.applicantId === applicant.id)?.totalScore || 0;
        
        assignments.push({
          roleId: role.id,
          applicantId: applicant.id,
          score,
          rank: i + 1,
          status: 'assigned'
        });
      }

      // Assign backups
      const backupCount = Math.min(2, suitableApplicants.length - role.quantityNeeded);
      for (let i = role.quantityNeeded; i < role.quantityNeeded + backupCount; i++) {
        if (i < suitableApplicants.length) {
          const applicant = suitableApplicants[i];
          const score = scoringResults.find(r => r.applicantId === applicant.id)?.totalScore || 0;
          
          assignments.push({
            roleId: role.id,
            applicantId: applicant.id,
            score,
            rank: i + 1,
            status: 'backup'
          });
        }
      }
    }

    return assignments;
  }

  private scoreVocalRange(applicant: Applicant, weight: ScoringWeight): ApplicantScore {
    let rawScore = 0.5; // Default middle score

    if (applicant.profile.voiceType && this.context.casting.roles.length > 0) {
      // Check if applicant's voice type matches any role requirements
      const hasMatchingRole = this.context.casting.roles.some(role => 
        !role.voiceType || role.voiceType === applicant.profile.voiceType
      );
      rawScore = hasMatchingRole ? 1.0 : 0.3;
    }

    const weightedScore = this.applyWeight(rawScore, weight);

    return {
      criteriaName: 'vocalRange',
      rawScore,
      weightedScore,
      scoredAt: new Date()
    };
  }

  private scoreExperience(applicant: Applicant, weight: ScoringWeight): ApplicantScore {
    const years = applicant.profile.experienceYears || 0;
    let rawScore = Math.min(years / 10, 1.0); // Normalize to 0-1, max at 10 years

    if (weight.method === 'exponential') {
      rawScore = Math.pow(rawScore, 0.7); // Favor more experienced candidates
    }

    const weightedScore = this.applyWeight(rawScore, weight);

    return {
      criteriaName: 'experience',
      rawScore,
      weightedScore,
      scoredAt: new Date()
    };
  }

  private scoreAvailability(applicant: Applicant, weight: ScoringWeight): ApplicantScore {
    let rawScore = 0.8; // Default good availability

    if (applicant.profile.availability) {
      const flexibility = applicant.profile.availability.flexibilityLevel;
      switch (flexibility) {
        case 'flexible':
          rawScore = 1.0;
          break;
        case 'moderate':
          rawScore = 0.7;
          break;
        case 'rigid':
          rawScore = 0.4;
          break;
      }
    }

    const weightedScore = this.applyWeight(rawScore, weight);

    return {
      criteriaName: 'availability',
      rawScore,
      weightedScore,
      scoredAt: new Date()
    };
  }

  private scoreLocationProximity(applicant: Applicant, weight: ScoringWeight): ApplicantScore {
    let rawScore = 0.5; // Default middle score

    if (applicant.profile.location && this.context.casting.location) {
      // Simplified location scoring - in real implementation, use proper geo calculations
      const sameLocation = applicant.profile.location
        .toLowerCase()
        .includes(this.context.casting.location.toLowerCase());
      rawScore = sameLocation ? 1.0 : 0.3;
    }

    const weightedScore = this.applyWeight(rawScore, weight);

    return {
      criteriaName: 'locationProximity',
      rawScore,
      weightedScore,
      scoredAt: new Date()
    };
  }

  private scoreRepertoire(applicant: Applicant, weight: ScoringWeight): ApplicantScore {
    let rawScore = 0.5; // Default middle score

    if (applicant.profile.repertoire && applicant.profile.repertoire.length > 0) {
      // Score based on repertoire size and diversity
      const repertoireSize = applicant.profile.repertoire.length;
      rawScore = Math.min(repertoireSize / 20, 1.0); // Normalize, max at 20 pieces
    }

    const weightedScore = this.applyWeight(rawScore, weight);

    return {
      criteriaName: 'repertoire',
      rawScore,
      weightedScore,
      scoredAt: new Date()
    };
  }

  private applyWeight(score: number, weight: ScoringWeight): number {
    let adjustedScore = score;

    switch (weight.method) {
      case 'exponential':
        adjustedScore = Math.pow(score, 1.5);
        break;
      case 'threshold':
        const threshold = weight.settings?.threshold || 0.7;
        adjustedScore = score >= threshold ? 1.0 : 0.2;
        break;
      case 'linear':
      default:
        // No adjustment needed
        break;
    }

    return adjustedScore * weight.weight;
  }

  private determineRecommendation(score: number): 'accept' | 'reject' | 'waitlist' | 'shortlist' {
    if (score >= 0.8) return 'accept';
    if (score >= 0.6) return 'shortlist';
    if (score >= 0.4) return 'waitlist';
    return 'reject';
  }

  private calculateConfidence(scores: ApplicantScore[]): number {
    // Calculate confidence based on score variance
    const values = scores.map(s => s.rawScore);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Higher variance = lower confidence
    return Math.max(0.1, 1 - Math.sqrt(variance));
  }

  private groupApplicantsByVoiceType(
    applicants: Applicant[], 
    results: ScoringResult[]
  ): Map<string, Applicant[]> {
    const groups = new Map<string, Applicant[]>();

    for (const applicant of applicants) {
      const voiceType = applicant.profile.voiceType || 'unspecified';
      if (!groups.has(voiceType)) {
        groups.set(voiceType, []);
      }
      groups.get(voiceType)!.push(applicant);
    }

    // Sort each group by score
    for (const [voiceType, applicantList] of groups.entries()) {
      applicantList.sort((a, b) => {
        const scoreA = results.find(r => r.applicantId === a.id)?.totalScore || 0;
        const scoreB = results.find(r => r.applicantId === b.id)?.totalScore || 0;
        return scoreB - scoreA;
      });
    }

    return groups;
  }

  private getSuitableApplicants(
    applicantsByVoiceType: Map<string, Applicant[]>,
    role: CastingRole,
    results: ScoringResult[]
  ): Applicant[] {
    const requiredVoiceType = role.voiceType || 'unspecified';
    const suitable: Applicant[] = [];

    // First, try to get applicants with exact voice type match
    if (applicantsByVoiceType.has(requiredVoiceType)) {
      suitable.push(...applicantsByVoiceType.get(requiredVoiceType)!);
    }

    // If not enough candidates, include others with good scores
    if (suitable.length < role.quantityNeeded * 2) {
      for (const [voiceType, applicants] of applicantsByVoiceType.entries()) {
        if (voiceType !== requiredVoiceType) {
          const goodCandidates = applicants.filter(applicant => {
            const result = results.find(r => r.applicantId === applicant.id);
            return result && result.totalScore >= 0.6;
          });
          suitable.push(...goodCandidates);
        }
      }
    }

    return suitable;
  }
}

/**
 * Utility functions for scoring configuration
 */
export class ScoringUtils {
  static createDefaultCriteria(): ScoringCriteria {
    return {
      vocalRange: { weight: 0.3, method: 'linear' },
      experience: { weight: 0.25, method: 'exponential' },
      availability: { weight: 0.2, method: 'linear' },
      locationProximity: { weight: 0.15, method: 'linear' },
      repertoire: { weight: 0.1, method: 'linear' }
    };
  }

  static validateCriteria(criteria: ScoringCriteria): boolean {
    const totalWeight = Object.values(criteria)
      .reduce((sum, weight) => sum + weight.weight, 0);
    
    return Math.abs(totalWeight - 1.0) < 0.01; // Allow small floating-point errors
  }

  static normalizeCriteria(criteria: ScoringCriteria): ScoringCriteria {
    const totalWeight = Object.values(criteria)
      .reduce((sum, weight) => sum + weight.weight, 0);
    
    if (totalWeight === 0) return this.createDefaultCriteria();

    const normalized = { ...criteria };
    for (const key of Object.keys(normalized) as Array<keyof ScoringCriteria>) {
      normalized[key] = {
        ...normalized[key],
        weight: normalized[key].weight / totalWeight
      };
    }

    return normalized;
  }
}
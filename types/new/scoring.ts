export interface UserScoringStatus {
  user_id: number;
  full_name: string;
  email: string;
  scored: boolean;
  score_count: number;
  user_total_score: number;
}

export interface InterventionScoreReport {
  intervention_id: string;
  reference_number: string;
  intervention_name: string;
  intervention_type: string | null;
  system_categories: string[];
  max_possible_score: number;
  criteria_scored: number;
  criteria_total: number;
  is_fully_scored: boolean;
  reviewer_statuses: UserScoringStatus[];
  overall_total_score: number;
}

export interface ScoringReportResult {
  success: boolean;
  message: string;
  total_interventions: number;
  fully_scored: number;
  partially_scored: number;
  not_scored: number;
  total_reviewers: number;
  interventions: InterventionScoreReport[];
  error?: string | null;
}

export interface EnrichedInterventionScore {
  id: string;
  score: {
    tool_id: string;
    scoring_mechanism: string;
    score_value: number;
    criteria_label: string;
  };
  comment: string;
  created_at: string;
  updated_at: string;

  reviewer: number;
  intervention: string;
  criteria: string;
  reviewer_name: string;
  reviewer_email: string;
  intervention_name: string;
  intervention_reference: string;
}
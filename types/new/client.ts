import { User } from "@/app/api/auth";
import { ISODateString, UUID } from "./shared";

export interface Document {
  document: string;
  original_name: string;
  is_public: boolean;
}

export interface InterventionProposal {
  id: UUID;
  name: string;
  phone: string;
  email: string | null;
  profession: string | null;
  organization: string | null;
  county: string | null;
  intervention_name: string | null;
  intervention_type: string | null;
  beneficiary: string | null;
  justification: string | null;
  expected_impact: string | null;
  additional_info: string | null;
  reference_number: string | null;
  signature: string;
  date: ISODateString | null;
  submitted_at: ISODateString;
  is_public: boolean;
  documents: Document[];
  user?: User | null;
}


export interface SelectionTool {
  id: UUID;
  criteria: string;
  description: string;
  scoring_mechanism: string | null;
  scores: number | null;
  mortality_score: number | null;
  morbidity_score: number | null;
  created_at: ISODateString;
}


export interface SystemCategory {
  id: UUID;
  name: string;
  description: string;
  created_at: ISODateString;
}

export interface InterventionSystemCategory {
  id: UUID;
  intervention: UUID;
  system_category: UUID;
  created_at: ISODateString;
}


export interface InterventionScore {
  id: UUID;
  reviewer: UUID;
  intervention: UUID;
  criteria: UUID;
  score: Record<string, unknown>;
  comment: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}





export interface InterventionScoreDetail extends Omit<InterventionScore, "reviewer" | "criteria"> {
  reviewer: Pick<User, "id" | "username" | "email">;
  criteria: SelectionTool;
}
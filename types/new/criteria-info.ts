
export interface CriteriaInformation {
  id: string;

  intervention: string;
  intervention_name: string;
  intervention_reference_number: string | null;

  system_category_name: string | null;
  system_category: string | null;

  created_by: string | null;
  created_by_name: string | null;

  title: string | null;
  brief_info: string | null;

  clinical_effectiveness: string | null;
  burden_of_disease: string | null;

  bod_type: "DALY" | "QALY" | "PREVALENCE" | "INCIDENCE" | null;

  population: string | null;
  equity: string | null;
  cost_effectiveness: string | null;
  budget_impact_affordability: string | null;
  feasibility_of_implementation: string | null;
  catastrophic_health_expenditure: string | null;
  access_to_healthcare: string | null;
  congruence_with_health_priorities: string | null;

  additional_info: string | null;

  created_at: string;
  updated_at: string;
}

export type CriteriaInformationPayload = Omit<
  CriteriaInformation,
  | "id"
  | "intervention_name"
  | "intervention_reference_number"
  | "system_category_name"
  | "created_by"
  | "created_by_name"
  | "created_at"
  | "updated_at"
>;


export interface InterventionSearchResult {
  id: string;
  reference_number: string | null;
  intervention_name: string | null;
  county: string | null;
  intervention_type: string | null;
}
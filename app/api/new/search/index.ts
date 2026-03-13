import { InterventionSearchResult } from "@/types/new/criteria-info";
import { ApiResponse } from "../shared";
import api from "../../auth";

export const searchInterventions = async (q: string): Promise<InterventionSearchResult[]> => {
  if (!q || q.trim().length < 1) return [];
  try {
    const res = await api.get<ApiResponse<InterventionSearchResult[]>>("/v3/interventions/search/", {
      params: { q: q.trim().slice(0, 20) },
    });
    return res.data.data ?? [];
  } catch {
    return [];
  }
};
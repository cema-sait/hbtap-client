
import api from "../../auth";
import { ScoringReportResult } from "@/types/new/scoring";

/**
 * Fetch the full scoring report.
 * Optionally filter to specific intervention IDs.
 */
export const getScoringReport = async (
  interventionIds?: string[]
): Promise<ScoringReportResult> => {
  const params: Record<string, string> = {};
  if (interventionIds?.length) {
    params.intervention = interventionIds.join(",");
  }

  const res = await api.get<ScoringReportResult>("/v3/scoring-report/", { params });
  return res.data;
};


/**
 * Fetch the full scoring report.
 * Optionally filter to specific intervention IDs.
 */
export const getAdminScoringReport = async (
  interventionIds?: string[]
): Promise<ScoringReportResult> => {
  const params: Record<string, string> = {};
  if (interventionIds?.length) {
    params.intervention = interventionIds.join(",");
  }

  const res = await api.get<ScoringReportResult>("/v3/admin-report/", { params });
  return res.data;
};











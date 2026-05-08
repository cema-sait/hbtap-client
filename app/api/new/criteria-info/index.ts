import api from "../../auth";

import { CriteriaInformation, CriteriaInformationPayload } from "@/types/new/criteria-info";
import { ApiResponse } from "../shared";


export const getAllCriteriaInfo = async (): Promise<CriteriaInformation[]> => {
  try {
    const res = await api.get<ApiResponse<CriteriaInformation[]>>("/v3/criteria-information/");
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const getCriteriaInfoById = async (id: string): Promise<CriteriaInformation | null> => {
  try {
    const res = await api.get<ApiResponse<CriteriaInformation>>(`/v3/criteria-information/${id}/`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const getCriteriaInfoByIntervention = async (interventionId: string): Promise<CriteriaInformation[]> => {
  try {
    const res = await api.get<ApiResponse<CriteriaInformation[]>>("/v3/criteria-information/by-intervention/", {
      params: { intervention: interventionId },
    });
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const createCriteriaInfo = async (body: CriteriaInformationPayload): Promise<CriteriaInformation | null> => {
  try {
    const res = await api.post<ApiResponse<CriteriaInformation>>("/v3/criteria-information/create/", body);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const updateCriteriaInfo = async (id: string, body: Partial<CriteriaInformationPayload>): Promise<CriteriaInformation | null> => {
  try {
    const res = await api.patch<ApiResponse<CriteriaInformation>>(`/v3/criteria-information/${id}/update/`, body);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};



export const deleteCriteriaInfo = async (
  id: string
): Promise<boolean> => {
  try {
    await api.delete(`/v3/criteria-information/${id}/delete/`);
    return true;
  } catch {
    return false;
  }
};

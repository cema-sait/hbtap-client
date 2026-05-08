import type { SelectionTool } from "@/types/new/client";

export interface CriteriaGroup {
  criteria: string;
  description: string;
  options: SelectionTool[];
}

export interface DraftScore {
  criteriaGroupLabel: string;
  tool_id: string;
  scoring_mechanism: string;
  score_value: number;
  comment: string;
}

export function groupTools(tools: SelectionTool[]): CriteriaGroup[] {
  const map = new Map<string, CriteriaGroup>();
  for (const tool of tools) {
    if (!map.has(tool.criteria)) {
      map.set(tool.criteria, { criteria: tool.criteria, description: tool.description, options: [] });
    }
    map.get(tool.criteria)!.options.push(tool);
  }
  return Array.from(map.values());
}
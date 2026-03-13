import { InterventionScoreReport } from "@/types/new/scoring";

function csvCell(value: string | number | null | undefined): string {
  const str = String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, '""');
  return `"${str}"`;
}

export function exportScoringReportCSV(
  items: InterventionScoreReport[],
  filenamePrefix = "scoring-report"
): void {
  if (!items.length) return;

  const headers = [
    "Intervention Reference Number",
    "Intervention Name",
    "System Categories",
    "Total Score",
    "Scoring Status",
    "Reviewers Scored",
    "Total Reviewers",
  ];

  // ── Rows ────────────────────────────────────────────────
  const rows = items.map((item) => {
    const status = item.is_fully_scored
      ? "Fully Scored"
      : item.criteria_scored > 0
      ? "Partially Scored"
      : "Not Scored";

    const reviewersScored = item.reviewer_statuses.filter(
      (r) => r.scored
    ).length;

    const categoriesStr = (item.system_categories ?? []).join(" | ");

    const cells = [
      csvCell(item.reference_number),
      csvCell(item.intervention_name),
      csvCell(categoriesStr),
      csvCell(item.overall_total_score),
      csvCell(status),
      csvCell(reviewersScored),
      csvCell(item.reviewer_statuses.length),
    ];

    return cells.join(",");
  });

  // ── Assemble CSV ────────────────────────────────────────
  const csvContent = [
    headers.map(csvCell).join(","),
    ...rows,
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
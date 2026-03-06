"use client";


import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Building2, Calendar, FileText } from "lucide-react";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

export function InterventionDetail({ proposal }: { proposal: SubmittedProposal }) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 -mt-6 rounded-t-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-100 mb-1">Intervention Proposal</p>
            <h2 className="text-base font-bold text-white leading-snug">
              {proposal.intervention_name ?? "Untitled Intervention"}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className="bg-white/20 text-white border-white/30 text-xs font-mono">{proposal.reference_number}</Badge>
            {proposal.intervention_type && (
              <Badge className="bg-teal-700 text-teal-100 border-0 text-xs">{proposal.intervention_type}</Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><User className="h-3 w-3" />{proposal.name}</span>
          {proposal.organization && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{proposal.organization}</span>}
          {proposal.county && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{proposal.county}</span>}
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(proposal.date).toLocaleDateString()}</span>
        </div>
        <Separator className="bg-slate-100" />
        <div className="grid grid-cols-1 gap-3">
          <Field label="Beneficiary" value={proposal.beneficiary} />
          <Field label="Justification" value={proposal.justification} />
          <Field label="Expected Impact" value={proposal.expected_impact} />
          {proposal.additional_info && <Field label="Additional Info" value={proposal.additional_info} />}
        </div>
        {proposal.documents?.length > 0 && (
          <>
            <Separator className="bg-slate-100" />
            <div className="flex flex-wrap gap-2">
              {proposal.documents.map((doc, i) => (
                <a key={i} href={doc.document} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded transition-colors">
                  <FileText className="h-3 w-3" />{doc.original_name}
                </a>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
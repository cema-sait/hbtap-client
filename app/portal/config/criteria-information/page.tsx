"use client";
import React, { useEffect, useState, useCallback } from "react";
import { CriteriaInformation } from "@/types/new/criteria-info";
import { deleteCriteriaInfo, getAllCriteriaInfo } from "@/app/api/new/criteria-info";
import { CriteriaTable } from "./cc/table";
import { CriteriaForm } from "./cc/form";

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto pt-12 pb-12"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="w-full max-w-3xl mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function CriteriaInformationPage() {
  const [data, setData] = useState<CriteriaInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CriteriaInformation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllCriteriaInfo();
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (row: CriteriaInformation) => { setEditing(row); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const handleSuccess = () => { closeModal(); load(); };
  const handleDelete = async (row: CriteriaInformation) => {
    await deleteCriteriaInfo(row.id);
    await load();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">Intervention Criteria Information</h1>
            <p className="text-sm text-slate-500 mt-1">From the word docs, to be transferred here..</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#27aae1] hover:bg-[#27aae1] text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            <span className="text-lg">+</span> Add New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-1 py-2">
        {/* Stats Card */}
        <div className="mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-6 w-fit">
            <div className="text-3xl font-bold text-slate-900">{loading ? "—" : data.length}</div>
            <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Total Records</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <CriteriaTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <div className="bg-white rounded-lg shadow-lg">
            <CriteriaForm initial={editing} onSuccess={handleSuccess} onCancel={closeModal} />
          </div>
        </Modal>
      )}
    </div>
  );
}
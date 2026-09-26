import React from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';

const STEPS = [
  { key: 'DRAFT', label: 'Draft', desc: 'Order Created' },
  { key: 'PICKED', label: 'Picked', desc: 'Stock Verified' },
  { key: 'PACKED', label: 'Packed', desc: 'Ready for Dispatch' },
  { key: 'VALIDATED', label: 'Validated', desc: 'Stock Decreased' }
];

export default function WorkflowProgressBar({ currentStatus }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center space-x-3 text-rose-800">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold">Delivery Order Cancelled</h4>
          <p className="text-xs text-rose-600">This delivery order has been voided. No stock was deducted from warehouse inventory.</p>
        </div>
      </div>
    );
  }

  const stepOrder = { DRAFT: 0, PICKED: 1, PACKED: 2, VALIDATED: 3 };
  const currentIdx = stepOrder[currentStatus] ?? -1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Warehouse Delivery Workflow</h3>
          <p className="text-sm font-medium text-slate-900 mt-0.5">
            Stage {currentIdx + 1} of 4: <span className="text-indigo-600 font-bold">{STEPS[currentIdx]?.label || currentStatus}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Inventory Status: </span>
          <span className={`text-xs font-semibold ${currentStatus === 'VALIDATED' ? 'text-emerald-600' : 'text-slate-700'}`}>
            {currentStatus === 'VALIDATED' ? 'Stock Decreased in Ledger' : 'Stock Reserved (Deduction on Validation)'}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = currentIdx > idx;
            const isCurrent = currentIdx === idx;
            const isUpcoming = currentIdx < idx;

            return (
              <div key={step.key} className="relative flex flex-col items-center text-center">
                {/* Connector line behind */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>

                {/* Label and description */}
                <div className="mt-2">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

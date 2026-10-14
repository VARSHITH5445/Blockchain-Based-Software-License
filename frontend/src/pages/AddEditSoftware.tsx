import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Plus, Trash2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { LicenseType } from '../types';

interface PlanFormItem {
  name: string;
  licenseType: LicenseType;
  durationDays: number;
  maxSeats: number;
  priceDemo: number;
  isDefault: boolean;
}

export const AddEditSoftware: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cybersecurity');
  const [version, setVersion] = useState('v1.0.0');
  const [imageUrl, setImageUrl] = useState('');
  const [plans, setPlans] = useState<PlanFormItem[]>([
    {
      name: 'Single Node Perpetual',
      licenseType: 'PERPETUAL',
      durationDays: 0,
      maxSeats: 1,
      priceDemo: 0.25,
      isDefault: true,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addPlan = () => {
    setPlans([
      ...plans,
      {
        name: 'Enterprise Multi-Seat',
        licenseType: 'SEAT_BASED',
        durationDays: 0,
        maxSeats: 5,
        priceDemo: 0.50,
        isDefault: false,
      },
    ]);
  };

  const removePlan = (index: number) => {
    if (plans.length <= 1) return;
    setPlans(plans.filter((_, i) => i !== index));
  };

  const updatePlan = (index: number, field: keyof PlanFormItem, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    setPlans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (!name || name.length < 2) throw new Error('Software name must be at least 2 characters');
      if (!description || description.length < 10) throw new Error('Description must be at least 10 characters');

      await api.createProduct({
        name,
        description,
        category,
        version,
        imageUrl: imageUrl || undefined,
        plans,
      });

      navigate('/developer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create software product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Title */}
      <div className="pb-6 border-b border-slate-200">
        <Link to="/developer" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mb-3 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Developer Hub</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Add New Software Product</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish a software application and define cryptographic license plans.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Product Information Card */}
        <div className="app-card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Product Metadata</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Software Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SentinelZero Endpoint Guard"
                className="form-input"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Version</label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="form-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                <option value="Developer Tools">Developer Tools</option>
                <option value="Security Software">Security Software</option>
                <option value="Productivity">Productivity</option>
                <option value="Design Software">Design Software</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Enterprise SaaS">Enterprise SaaS</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Product Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="form-input"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-slate-700 block mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe software capabilities, system architecture, and target environment..."
              className="form-input"
            />
          </div>
        </div>

        {/* License Plans Card */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">License Plans & Tiers</h3>
              <p className="text-xs text-slate-500">Configure on-chain rules for duration and device seats.</p>
            </div>
            <button
              type="button"
              onClick={addPlan}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Plan</span>
            </button>
          </div>

          <div className="space-y-4">
            {plans.map((plan, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">Plan #{idx + 1}</span>
                  {plans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlan(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={plan.name}
                      onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                      placeholder="e.g. Standard Developer"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">License Architecture</label>
                    <select
                      value={plan.licenseType}
                      onChange={(e) => updatePlan(idx, 'licenseType', e.target.value as LicenseType)}
                      className="form-input"
                    >
                      <option value="PERPETUAL">Perpetual (Lifetime)</option>
                      <option value="SUBSCRIPTION">Subscription (Recurring)</option>
                      <option value="TRIAL">Trial (Evaluation)</option>
                      <option value="SEAT_BASED">Seat-Based (Multi-Node)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Demo Price (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={plan.priceDemo}
                      onChange={(e) => updatePlan(idx, 'priceDemo', Number(e.target.value))}
                      className="form-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {plan.licenseType !== 'PERPETUAL' && (
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={plan.durationDays}
                        onChange={(e) => updatePlan(idx, 'durationDays', Number(e.target.value))}
                        className="form-input font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Allowed Machine Seats</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={plan.maxSeats}
                      onChange={(e) => updatePlan(idx, 'maxSeats', Number(e.target.value))}
                      className="form-input font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Link to="/developer" className="btn-outline text-xs py-2 px-4">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-indigo text-xs py-2 px-5 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Saving to Registry...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Publish Software Product</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

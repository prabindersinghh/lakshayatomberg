import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ThrustArea, UoMType } from '@/types';
import type { GoalDraft } from '@/types';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  thrust_area_id: z.string().min(1, 'Please select a Thrust Area'),
  uom_type: z.enum(['numeric_min', 'numeric_max', 'timeline', 'zero'], {
    message: 'Please select a unit of measurement',
  }),
  target_value: z.number().optional(),
  target_date: z.string().optional(),
  weightage: z.number().min(10, 'Min weightage is 10%').max(100, 'Max is 100%'),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  thrustAreas: ThrustArea[];
  existingTotal: number;
  onSave: (draft: GoalDraft) => void;
  onCancel: () => void;
  defaultValues?: Partial<GoalDraft>;
  isEditing?: boolean;
}

const UOM_OPTIONS = [
  { value: 'numeric_min', label: 'Numeric (Min) — higher is better', hint: 'e.g. Sales Revenue, NPS Score' },
  { value: 'numeric_max', label: 'Numeric (Max) — lower is better', hint: 'e.g. TAT, Cost, Error Rate' },
  { value: 'timeline', label: 'Timeline — date-based delivery', hint: 'e.g. Project milestones' },
  { value: 'zero', label: 'Zero-based — target is zero', hint: 'e.g. Safety incidents, Complaints' },
];

export function GoalForm({
  thrustAreas,
  existingTotal,
  onSave,
  onCancel,
  defaultValues,
  isEditing,
}: GoalFormProps) {
  const [previewTotal, setPreviewTotal] = useState(existingTotal + (defaultValues?.weightage ?? 0));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      thrust_area_id: defaultValues?.thrust_area_id ?? '',
      uom_type: (defaultValues?.uom_type as UoMType) ?? undefined,
      target_value: defaultValues?.target_value,
      target_date: defaultValues?.target_date,
      weightage: defaultValues?.weightage ?? undefined,
    },
  });

  const uomType = watch('uom_type');
  const weightage = watch('weightage');

  useEffect(() => {
    setPreviewTotal(existingTotal + (weightage ?? 0));
  }, [weightage, existingTotal]);

  const onSubmit = (data: GoalFormData) => {
    onSave({
      title: data.title,
      description: data.description,
      thrust_area_id: data.thrust_area_id,
      uom_type: data.uom_type as UoMType,
      target_value: data.target_value,
      target_date: data.target_date,
      weightage: data.weightage,
    });
  };

  const barColor =
    previewTotal === 100
      ? 'bg-green-500'
      : previewTotal > 100
      ? 'bg-red-500'
      : 'bg-[#FDB813]';

  return (
    <div className="bg-white rounded-xl border border-[#FDB813] shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 font-heading text-sm">
          {isEditing ? 'Edit Goal' : 'Add New Performance Goal'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title + Thrust area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Goal Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Increase Regional Sales Revenue"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border text-sm bg-white',
                errors.title ? 'border-red-400' : 'border-gray-200'
              )}
            />
            {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Thrust Area <span className="text-red-400">*</span>
            </label>
            <select
              {...register('thrust_area_id')}
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border text-sm bg-white',
                errors.thrust_area_id ? 'border-red-400' : 'border-gray-200'
              )}
            >
              <option value="">Select Thrust Area...</option>
              {thrustAreas.map((ta) => (
                <option key={ta.id} value={ta.id}>{ta.name}</option>
              ))}
            </select>
            {errors.thrust_area_id && (
              <p className="text-xs text-red-500 mt-0.5">{errors.thrust_area_id.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Brief description of this goal..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white resize-none"
          />
        </div>

        {/* UoM */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Unit of Measurement <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {UOM_OPTIONS.map((opt) => {
              const isSelected = uomType === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                    isSelected
                      ? 'border-[#FDB813] bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('uom_type')}
                    className="mt-0.5 accent-[#FDB813]"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-800">{opt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{opt.hint}</p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.uom_type && <p className="text-xs text-red-500 mt-0.5">{errors.uom_type.message}</p>}
        </div>

        {/* Target value / date */}
        {(uomType === 'numeric_min' || uomType === 'numeric_max') && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Target Value <span className="text-red-400">*</span>
            </label>
            <input
              {...register('target_value', { valueAsNumber: true })}
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 5000"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border text-sm bg-white font-mono',
                errors.target_value ? 'border-red-400' : 'border-gray-200'
              )}
            />
            {errors.target_value && (
              <p className="text-xs text-red-500 mt-0.5">{errors.target_value.message}</p>
            )}
          </div>
        )}

        {uomType === 'timeline' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Target Date <span className="text-red-400">*</span>
            </label>
            <input
              {...register('target_date')}
              type="date"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg border text-sm bg-white',
                errors.target_date ? 'border-red-400' : 'border-gray-200'
              )}
            />
            {errors.target_date && (
              <p className="text-xs text-red-500 mt-0.5">{errors.target_date.message}</p>
            )}
          </div>
        )}

        {/* Weightage */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Weightage % <span className="text-red-400">*</span>
            <span className="ml-1 text-gray-400 font-normal">(min 10%)</span>
          </label>
          <input
            {...register('weightage', { valueAsNumber: true })}
            type="number"
            min={10}
            max={100}
            step={1}
            placeholder="e.g. 25"
            className={cn(
              'w-full px-3 py-2.5 rounded-lg border text-sm bg-white font-mono',
              errors.weightage ? 'border-red-400' : 'border-gray-200'
            )}
          />
          {errors.weightage && <p className="text-xs text-red-500 mt-0.5">{errors.weightage.message}</p>}

          {/* Live preview bar */}
          <div className="mt-2 space-y-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', barColor)}
                style={{ width: `${Math.min(previewTotal, 100)}%` }}
              />
            </div>
            <p className={cn(
              'text-[10px] font-mono',
              previewTotal === 100 ? 'text-green-600' : previewTotal > 100 ? 'text-red-500' : 'text-gray-400'
            )}>
              Running total: {previewTotal}% / 100%
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#FDB813] text-gray-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-yellow-400 transition-all text-sm"
          >
            <Check size={15} />
            {isEditing ? 'Save Changes' : 'Add Goal'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

import React from "react";

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ value, onChange }) => {
  const options = [
    { id: "male", label: "Male" },
    { id: "female", label: "Female" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="space-y-3">
      <label className="medical-label">
        Gender <span className="text-destructive">*</span>
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              value === option.id
                ? "border-primary bg-accent text-accent-foreground"
                : "border-input bg-background hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              name="gender"
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
              required
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                value === option.id ? "border-primary" : "border-muted-foreground"
              }`}
            >
              {value === option.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenderSelect;

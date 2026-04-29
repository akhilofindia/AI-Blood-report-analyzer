import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Droplets, Microscope, FlaskConical, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormInput from "./FormInput";
import GenderSelect from "./GenderSelect";
import SectionCard from "./SectionCard";
import CollapsibleSection from "./CollapsibleSection";
import { useToast } from "@/hooks/use-toast";
import { getApiBase } from "@/lib/api";

interface FormData {
  // Basic Info
  age: string;
  gender: string;
  // Required CBC Values
  hemoglobin: string;
  rbcCount: string;
  wbcCount: string;
  platelets: string;
  mcv: string;
  mch: string;
  mchc: string;
  rdw: string;
  // Optional Differential Count
  neutrophils: string;
  lymphocytes: string;
  monocytes: string;
  eosinophils: string;
  basophils: string;
  // Missing features for model
  hct: string;
  pdw: string;
  mpv: string;
  pct: string;
}

const initialFormData: FormData = {
  age: "",
  gender: "",
  hemoglobin: "",
  rbcCount: "",
  wbcCount: "",
  platelets: "",
  mcv: "",
  mch: "",
  mchc: "",
  rdw: "",
  neutrophils: "",
  lymphocytes: "",
  monocytes: "",
  eosinophils: "",
  basophils: "",
  hct: "",
  pdw: "",
  mpv: "",
  pct: "",
};

const BloodReportForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Required field validation
    if (!formData.age || parseFloat(formData.age) <= 0 || parseFloat(formData.age) > 150) {
      newErrors.age = "Please enter a valid age (1-150)";
    }
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }
    if (!formData.hemoglobin) {
      newErrors.hemoglobin = "Hemoglobin is required";
    }
    if (!formData.rbcCount) {
      newErrors.rbcCount = "RBC Count is required";
    }
    if (!formData.wbcCount) {
      newErrors.wbcCount = "WBC Count is required";
    }
    if (!formData.platelets) {
      newErrors.platelets = "Platelets is required";
    }
    if (!formData.mcv) {
      newErrors.mcv = "MCV is required";
    }
    if (!formData.mch) {
      newErrors.mch = "MCH is required";
    }
    if (!formData.mchc) {
      newErrors.mchc = "MCHC is required";
    }
    if (!formData.rdw) {
      newErrors.rdw = "RDW is required";
    }

    // Optional differential count validation (if provided, should be valid percentages)
    const differentialFields = ["neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils"] as const;
    differentialFields.forEach((field) => {
      const value = formData[field];
      if (value && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
        newErrors[field] = "Value must be between 0-100%";
      }
    });

    // Required indices
    if (!formData.hct) newErrors.hct = "HCT is required";
    if (!formData.pdw) newErrors.pdw = "PDW is required";
    if (!formData.mpv) newErrors.mpv = "MPV is required";
    if (!formData.pct) newErrors.pct = "PCT is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsAnalyzing(true);

      try {
        const token = localStorage.getItem("health_report_token");
        const response = await fetch(`${getApiBase()}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.status === "success") {
          toast({
            title: "Analysis Complete",
            description: "Redirecting to your results...",
          });

          navigate("/results", {
            state: {
              prediction: data.prediction,
              formData
            }
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: data.message || "Something went wrong.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Could not connect to the backend server.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <SectionCard title="Basic Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            unit="years"
            placeholder="Enter age"
            required
            min={1}
            max={150}
            step={1}
            error={errors.age}
          />
          <GenderSelect value={formData.gender} onChange={handleGenderChange} />
        </div>
      </SectionCard>

      {/* Required CBC Values */}
      <SectionCard title="Complete Blood Count (CBC)" icon={Droplets}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormInput
            label="Hemoglobin"
            name="hemoglobin"
            value={formData.hemoglobin}
            onChange={handleInputChange}
            unit="g/dL"
            placeholder="12.0 - 17.5"
            required
            min={0}
            max={25}
            error={errors.hemoglobin}
          />
          <FormInput
            label="RBC Count"
            name="rbcCount"
            value={formData.rbcCount}
            onChange={handleInputChange}
            unit="M/µL"
            placeholder="4.0 - 6.0"
            required
            min={0}
            max={10}
            error={errors.rbcCount}
          />
          <FormInput
            label="WBC Count"
            name="wbcCount"
            value={formData.wbcCount}
            onChange={handleInputChange}
            unit="cells/µL"
            placeholder="4000 - 11000"
            required
            min={0}
            max={100000}
            step={100}
            error={errors.wbcCount}
          />
          <FormInput
            label="Platelets"
            name="platelets"
            value={formData.platelets}
            onChange={handleInputChange}
            unit="lakh/µL"
            placeholder="1.5 - 4.0"
            required
            min={0}
            max={10}
            error={errors.platelets}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          <FormInput
            label="MCV"
            name="mcv"
            value={formData.mcv}
            onChange={handleInputChange}
            unit="fL"
            placeholder="80 - 100"
            required
            min={0}
            max={150}
            error={errors.mcv}
          />
          <FormInput
            label="MCH"
            name="mch"
            value={formData.mch}
            onChange={handleInputChange}
            unit="pg"
            placeholder="27 - 33"
            required
            min={0}
            max={50}
            error={errors.mch}
          />
          <FormInput
            label="MCHC"
            name="mchc"
            value={formData.mchc}
            onChange={handleInputChange}
            unit="g/dL"
            placeholder="32 - 36"
            required
            min={0}
            max={50}
            error={errors.mchc}
          />
          <FormInput
            label="RDW"
            name="rdw"
            value={formData.rdw}
            onChange={handleInputChange}
            unit="%"
            placeholder="11 - 15"
            required
            min={0}
            max={30}
            error={errors.rdw}
          />
        </div>
      </SectionCard>

      {/* Optional Differential Count */}
      <CollapsibleSection title="Differential Count" icon={Microscope}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <FormInput
            label="Neutrophils"
            name="neutrophils"
            value={formData.neutrophils}
            onChange={handleInputChange}
            unit="%"
            placeholder="40 - 70"
            min={0}
            max={100}
            error={errors.neutrophils}
          />
          <FormInput
            label="Lymphocytes"
            name="lymphocytes"
            value={formData.lymphocytes}
            onChange={handleInputChange}
            unit="%"
            placeholder="20 - 40"
            min={0}
            max={100}
            error={errors.lymphocytes}
          />
          <FormInput
            label="Monocytes"
            name="monocytes"
            value={formData.monocytes}
            onChange={handleInputChange}
            unit="%"
            placeholder="2 - 8"
            min={0}
            max={100}
            error={errors.monocytes}
          />
          <FormInput
            label="Eosinophils"
            name="eosinophils"
            value={formData.eosinophils}
            onChange={handleInputChange}
            unit="%"
            placeholder="1 - 4"
            min={0}
            max={100}
            error={errors.eosinophils}
          />
          <FormInput
            label="Basophils"
            name="basophils"
            value={formData.basophils}
            onChange={handleInputChange}
            unit="%"
            placeholder="0 - 1"
            min={0}
            max={100}
            error={errors.basophils}
          />
        </div>
      </CollapsibleSection>

      {/* Advanced Hematology Indices */}
      <SectionCard title="Additional ML Features" icon={FlaskConical}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormInput
            label="Hematocrit (HCT)"
            name="hct"
            value={formData.hct}
            onChange={handleInputChange}
            unit="%"
            placeholder="35 - 50"
            required
            min={0}
            max={70}
            error={errors.hct}
          />
          <FormInput
            label="PDW"
            name="pdw"
            value={formData.pdw}
            onChange={handleInputChange}
            unit="fL"
            placeholder="10 - 20"
            required
            min={0}
            max={50}
            error={errors.pdw}
          />
          <FormInput
            label="MPV"
            name="mpv"
            value={formData.mpv}
            onChange={handleInputChange}
            unit="fL"
            placeholder="7 - 12"
            required
            min={0}
            max={20}
            error={errors.mpv}
          />
          <FormInput
            label="PCT"
            name="pct"
            value={formData.pct}
            onChange={handleInputChange}
            unit="%"
            placeholder="0.1 - 0.5"
            required
            min={0}
            max={5}
            error={errors.pct}
          />
        </div>
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          variant="medical"
          size="xl"
          className="min-w-[280px]"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FlaskConical className="w-5 h-5" />
              Analyze Blood Report
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BloodReportForm;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Info,
    Calendar,
    User,
    FlaskConical,
    FileText,
    Download,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Lightbulb,
    Stethoscope,
    Apple,
    Clock,
    Fingerprint,
    TrendingUp,
    ClipboardList
} from "lucide-react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/SectionCard";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBase } from "@/lib/api";
import html2pdf from "html2pdf.js";

// Reference ranges for blood markers
const REFERENCE_RANGES: Record<string, { min: number; max: number; unit: string; description: string }> = {
    hemoglobin: { min: 12.0, max: 17.5, unit: "g/dL", description: "Oxygen-carrying protein in red blood cells" },
    rbcCount: { min: 4.0, max: 6.0, unit: "M/µL", description: "Total number of red blood cells" },
    wbcCount: { min: 4000, max: 11000, unit: "cells/µL", description: "Immune system cells that fight infection" },
    platelets: { min: 1.5, max: 4.5, unit: "lakh/µL", description: "Cells that help blood clot" },
    mcv: { min: 80, max: 100, unit: "fL", description: "Average size of your red blood cells" },
    mch: { min: 27, max: 33, unit: "pg", description: "Average amount of hemoglobin per red blood cell" },
    mchc: { min: 32, max: 36, unit: "g/dL", description: "Average concentration of hemoglobin in a red blood cell" },
    rdw: { min: 11.0, max: 15.0, unit: "%", description: "Variation in size of red blood cells" },
    hct: { min: 35, max: 50, unit: "%", description: "Percentage of red blood cells in total blood volume" },
    pdw: { min: 10, max: 20, unit: "fL", description: "Variation in platelet size" },
    mpv: { min: 7, max: 12, unit: "fL", description: "Average size of platelets" },
    pct: { min: 0.1, max: 0.5, unit: "%", description: "Plateletcrit - volume occupied by platelets" },
};

const getClinicalInsight = (value: string, key: string, diagnosis: string) => {
    const val = parseFloat(value);
    const range = REFERENCE_RANGES[key];
    const diag = diagnosis.toLowerCase();
    const isHealthy = diag.includes("healthy");

    if (!range) return { label: "Optimal", color: "emerald", interpretation: "Standard range" };

    const isBelow = val < range.min;
    const isAbove = val > range.max;

    if (isBelow) {
        return {
            label: "Below Ref",
            color: "amber",
            interpretation: (diag.includes("anemia") && ["hemoglobin", "rbccount", "hct"].includes(key.toLowerCase())) 
                ? "Correlates with Anemic pattern" 
                : "Lower than baseline"
        };
    }
    if (isAbove) {
        return {
            label: "Above Ref",
            color: "red",
            interpretation: "Exceeds standard range"
        };
    }

    // Pattern-based insights for values that are technically "Within Range"
    if (!isHealthy) {
        const isThrombocytopenia = diag.includes("thrombocytopenia");
        const isAnemia = diag.includes("anemia");

        // Markers that specifically contribute to Thrombocytopenia diagnosis
        if (isThrombocytopenia && ["platelets", "pdw", "mpv", "pct"].includes(key.toLowerCase())) {
            return { 
                label: "Pattern Factor", 
                color: "amber", 
                interpretation: "Primary component of identified pattern" 
            };
        }

        // Markers that specifically contribute to Anemia diagnosis
        if (isAnemia && ["hemoglobin", "rbccount", "mcv", "mch", "mchc", "hct"].includes(key.toLowerCase())) {
            return { 
                label: "Pattern Factor", 
                color: "amber", 
                interpretation: "Aligns with physiological markers" 
            };
        }

        // Default for "Normal" values when a disease is present
        return { 
            label: "Normal Range", 
            color: "blue", 
            interpretation: "Standard baseline value" 
        };
    }

    // Standard high-confidence label for truly healthy reports
    return { label: "Stable", color: "emerald", interpretation: "No immediate deviance" };
};

const getInsightForDiagnosis = (diagnosis: string) => {
    const lowerDiag = diagnosis.toLowerCase();
    if (lowerDiag.includes("healthy")) {
        return {
            title: "Maintaining Good Health",
            tips: [
                "Continue consistent exercise (150 mins/week)",
                "Maintain a balanced diet rich in leafy greens and lean protein",
                "Keep hydrated with 8+ glasses of water daily",
                "Follow up with annual screening"
            ],
            icon: CheckCircle2,
            color: "emerald"
        };
    } else if (lowerDiag.includes("anemia")) {
        return {
            title: "Anemia Management",
            tips: [
                "Incorporate iron-rich foods: Spinach, red meat, and beans",
                "Pair iron-source foods with Vitamin C to boost absorption",
                "Monitor for symptoms like fatigue or dizziness",
                "Discuss potential iron supplementation with your doctor"
            ],
            icon: AlertTriangle,
            color: "amber"
        };
    } else if (lowerDiag.includes("viral") || lowerDiag.includes("infection")) {
        return {
            title: "Immune Support",
            tips: [
                "Prioritize 7-9 hours of sleep to support immune function",
                "Increase intake of antioxidants (berries, citrus fruits)",
                "Stay hydrated to help flush out toxins",
                "Consult your doctor if fever or symptoms persist"
            ],
            icon: FlaskConical,
            color: "blue"
        };
    }
    return {
        title: "General Health Advice",
        tips: [
            "Consult with a medical professional regarding these results",
            "Keep a log of any physical symptoms",
            "Review your current medications and supplements",
            "Focus on stress reduction techniques"
        ],
        icon: Lightbulb,
        color: "primary"
    };
};

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prediction, formData } = location.state || { prediction: null, formData: null };

    if (!prediction) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">No results found</h1>
                <p className="text-muted-foreground mb-6">Please complete the analysis form first.</p>
                <Button onClick={() => navigate("/")}>Go back to Form</Button>
            </div>
        );
    }

    const isHealthy = String(prediction || '').toLowerCase().includes("healthy");
    const insights = getInsightForDiagnosis(String(prediction || ''));

    const handleDownloadPdf = () => {
        const element = document.getElementById("pdf-content");
        if (!element) return;

        const opt = {
            margin:       0.5,
            filename:     'Health_Report_Analysis.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    // Prepare data for the Radar Chart (Fingerprint)
    const chartData = formData ? Object.entries(formData)
        .filter(([key]) => ["hemoglobin", "rbcCount", "wbcCount", "platelets", "mcv"].includes(key))
        .map(([key, value]) => {
            const val = parseFloat(value as string);
            const range = REFERENCE_RANGES[key];
            // Normalize value to a 0-100 scale where 50 is the middle of the range
            const normalizedValue = ((val - range.min) / (range.max - range.min)) * 50 + 25;
            return {
                subject: key === "rbcCount" ? "RBC" : key === "wbcCount" ? "WBC" : key.toUpperCase(),
                value: Math.min(Math.max(normalizedValue, 10), 90), // Clamp for visual consistency
                fullMark: 100,
            };
        }) : [];

    const getGaugeColor = (value: string, key: string) => {
        const val = parseFloat(value);
        const range = REFERENCE_RANGES[key];
        if (!range) return "#14b8a6"; // teal-500
        if (val < range.min) return "#f59e0b"; // amber-500
        if (val > range.max) return "#ef4444"; // red-500
        return "#14b8a6";
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-xl font-bold text-foreground">Health Report Analysis</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hidden sm:flex gap-2 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => navigate("/profile")}
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={handleDownloadPdf}>
                            <Download className="w-4 h-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main id="pdf-content" className="container mx-auto px-4 py-8 max-w-5xl bg-background">
                {/* Refined Result Hero */}
                <div className={`p-10 rounded-[2.5rem] mb-10 animate-fade-in relative overflow-hidden transition-all duration-700 border shadow-sm ${
                    isHealthy 
                        ? "bg-emerald-50/50 border-emerald-100 shadow-emerald-500/5" 
                        : "bg-slate-50 border-slate-200 shadow-slate-200/20"
                }`}>
                    {/* Decorative Background Element */}
                    <div className={`absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none ${isHealthy ? "text-emerald-500" : "text-slate-400"}`}>
                        <Fingerprint className="w-80 h-80 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[10px] font-bold uppercase tracking-widest ${
                            isHealthy ? "bg-emerald-100/50 text-emerald-700" : "bg-slate-200/50 text-slate-600"
                        }`}>
                            {isHealthy ? <CheckCircle2 className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                            Analysis Summary
                        </div>

                        <div className="mb-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Primary Clinical Observation</span>
                        </div>
                        
                        <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${
                            isHealthy ? "text-emerald-600" : "text-slate-800"
                        }`}>
                            {prediction}
                        </h2>

                        <div className={`max-w-2xl text-center mb-8 px-4 py-4 rounded-2xl ${
                            isHealthy ? "bg-emerald-50/50" : "bg-white/50 border border-slate-100"
                        }`}>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {isHealthy 
                                    ? "Your hematological markers across 16 key indices are within the expected physiological range. Continue maintaining your current health routine."
                                    : `The machine learning model has identified physiological markers consistent with patterns of ${prediction}. This observation warrants a detailed review with your healthcare provider.`
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                                <User className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold">
                                    {formData?.age || 'N/A'} Y / {String(formData?.gender || 'N/A').toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">AI Confirmed Pattern</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pathology Correlation Section */}
                {!isHealthy && (
                    <div className="mb-10 animate-fade-in delay-100">
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                    Pathology Correlation Analysis
                                    <span className="px-2 py-0.5 rounded bg-amber-500 text-[10px] text-white uppercase font-black">AI Insight</span>
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    The AI detected <strong>{prediction}</strong> because individual markers, even when near range limits, align with documented hematological patterns. The aggregate correlation of 16 indices suggests a diagnostic shift that standard range checks might overlook.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Visualizations & Breakdown */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interactive Visualizations Card */}
                        <SectionCard title="Hematological Profile" icon={Fingerprint}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {/* Radar Chart */}
                                <div className="h-[300px] w-full bg-card/50 rounded-3xl border border-border/50 p-4">
                                    <p className="text-[10px] font-black uppercase text-center text-muted-foreground mb-2 tracking-widest">Biological Fingerprint</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                            <Radar
                                                name="Patient"
                                                dataKey="value"
                                                stroke={isHealthy ? "#10b981" : "#0ea5e9"}
                                                fill={isHealthy ? "#10b981" : "#0ea5e9"}
                                                fillOpacity={0.5}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Mini Gauges */}
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Key Marker Distribution</p>
                                    {["hemoglobin", "platelets", "wbcCount"].map((key) => {
                                        const value = formData[key];
                                        const range = REFERENCE_RANGES[key];
                                        const percentage = Math.min(Math.max(((parseFloat(value) - range.min) / (range.max - range.min)) * 100, 0), 100);
                                        const color = getGaugeColor(value, key);

                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-bold uppercase">{key === 'wbcCount' ? 'WBC' : key}</span>
                                                    <span className="text-xs font-mono font-bold" style={{ color }}>{value} <span className="text-[10px] text-muted-foreground">{range.unit}</span></span>
                                                </div>
                                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: color,
                                                            boxShadow: `0 0 10px ${color}40`
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[8px] text-muted-foreground font-bold">
                                                    <span>{range.min}</span>
                                                    <span>NORMAL RANGE</span>
                                                    <span>{range.max}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title={isHealthy ? "Detailed Marker Analysis" : "Diagnostic Correlation Profile"} icon={FlaskConical}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground w-1/4">Marker</th>
                                            <th className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Value</th>
                                            <th className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Reference</th>
                                            <th className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right w-1/3">Clinical Insight</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(formData)
                                            .filter(([key]) => REFERENCE_RANGES[key])
                                            .map(([key, value]) => {
                                                const range = REFERENCE_RANGES[key];
                                                const insight = getClinicalInsight(value as string, key, prediction);
                                                return (
                                                    <tr key={key} className={`border-b border-border/50 group transition-colors ${
                                                        insight.label === "Pattern Factor" ? "bg-amber-500/5" : "hover:bg-muted/30"
                                                    }`}>
                                                        <td className="py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm uppercase">{key === 'rbcCount' ? 'RBC' : key === 'wbcCount' ? 'WBC' : key}</span>
                                                                <span className="text-[10px] text-muted-foreground line-clamp-1">{range.description}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="font-mono font-bold text-base">{value as string}</span>
                                                            <span className="text-[10px] ml-1 text-muted-foreground uppercase">{range.unit}</span>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="text-xs text-muted-foreground">{range.min} - {range.max}</span>
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${insight.color === "emerald" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                                    insight.color === "red" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                                                        insight.color === "amber" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                                            "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                                    }`}>
                                                                    {insight.color === "red" && <ArrowUpRight className="w-3 h-3" />}
                                                                    {insight.color === "amber" && <ArrowDownRight className="w-3 h-3" />}
                                                                    {insight.color === "emerald" && <CheckCircle2 className="w-3 h-3" />}
                                                                    {insight.color === "blue" && <Info className="w-3 h-3" />}
                                                                    {insight.label}
                                                                </div>
                                                                <span className="text-[9px] font-medium text-muted-foreground italic leading-tight max-w-[140px]">
                                                                    {insight.interpretation}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column: Insights & Actions */}
                    <div className="space-y-8">
                        <SectionCard title="Personalized Insights" icon={insights.icon} className={`border-t-4 border-t-${insights.color === 'emerald' ? 'emerald' : insights.color === 'amber' ? 'amber' : 'primary'}-500`}>
                            <h3 className="font-black text-xl mb-4 leading-tight">{insights.title}</h3>
                            <ul className="space-y-4">
                                {insights.tips.map((tip, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-primary"}`} />
                                        </div>
                                        <span className="text-sm leading-relaxed text-foreground/80">{tip}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 p-4 bg-muted/50 rounded-2xl border border-border flex items-center gap-3">
                                <Apple className="w-10 h-10 text-primary opacity-50" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Nutritional Tip</p>
                                    <p className="text-xs font-medium">Dietary adjustments can often significantly improve markers.</p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Recommended Actions" icon={Stethoscope}>
                            <div className="space-y-3">
                                <Button className="w-full justify-start gap-3 h-auto py-4 rounded-xl" variant="outline" onClick={handleDownloadPdf}>
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold">Comprehensive PDF</p>
                                        <p className="text-[10px] text-muted-foreground">Detailed report for your doctor</p>
                                    </div>
                                </Button>

                                <Button className="w-full justify-start gap-3 h-auto py-4 rounded-xl" variant="outline">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold">Trend Analysis</p>
                                        <p className="text-[10px] text-muted-foreground">Compare with past results</p>
                                    </div>
                                </Button>
                            </div>
                        </SectionCard>

                        <div className="p-6 bg-destructive/5 border border-destructive/10 rounded-3xl">
                            <div className="flex gap-4">
                                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-destructive mb-1">Medical Disclaimer</h4>
                                    <p className="text-[10px] leading-relaxed text-destructive/80 font-medium">
                                        This analysis is provided by an AI model for informational purposes. It is NOT a professional medical diagnosis. Always review these indices with a qualified healthcare provider.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Results;

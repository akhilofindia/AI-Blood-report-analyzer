import { Activity, HeartPulse, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BloodReportForm from "@/components/BloodReportForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Blood Report Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Powered CBC Analysis
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {user.email}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate("/profile")}
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            <HeartPulse className="w-4 h-4" />
            Complete Blood Count Analysis
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Enter Your <span className="gradient-text">CBC Values</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Provide your Complete Blood Count test results below. All required fields are marked with an asterisk (*). Reference ranges are shown as placeholders.
          </p>
        </div>

        {/* Form */}
        <BloodReportForm />

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            <strong>Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;

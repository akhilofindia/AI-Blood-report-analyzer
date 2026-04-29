import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const { signup, user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (user) navigate("/profile", { replace: true });
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please re-enter your password.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        email,
        password,
        role,
        name: name.trim() || undefined,
      });
      toast({ title: "Account created", description: "You are now signed in." });
      navigate("/profile", { replace: true });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary">
          <Activity className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Blood Report Analyzer</h1>
          <p className="text-xs text-muted-foreground">Create your account</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-[var(--medical-card-shadow)]">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Register as a doctor or patient. Password must be at least 4 characters.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="doctor" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
                <TabsTrigger value="patient" className="gap-2">
                  <UserRound className="h-4 w-4" />
                  Patient
                </TabsTrigger>
              </TabsList>
              <TabsContent value="doctor" className="mt-0 pt-2 text-xs text-muted-foreground">
                Your account will be marked as a healthcare provider.
              </TabsContent>
              <TabsContent value="patient" className="mt-0 pt-2 text-xs text-muted-foreground">
                Your account will be marked as a patient.
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="name">Full name (optional)</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "doctor" ? "Dr. Jane Smith" : "Jane Smith"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 4 characters"
                minLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

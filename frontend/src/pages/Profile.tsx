import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Database, 
  User as UserIcon,
  ShieldCheck,
  ClipboardList,
  PlusCircle,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBase } from "@/lib/api";
import { format } from "date-fns";

interface Report {
  _id: string;
  createdAt: string;
  prediction: string;
  inputData: any;
}

export default function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchReports() {
      try {
        const res = await fetch(`${getApiBase()}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.ok) {
          setReports(data.reports);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [token, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-slate-600 hover:text-primary transition-colors"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-slate-800 hidden sm:inline-block">
              {user.role === 'doctor' ? 'Clinical Dashboard' : 'Patient Profile'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/login"); }}>
              Sign Out
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate("/")}>
              <PlusCircle className="w-4 h-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/80 to-primary"></div>
              <CardContent className="pt-0 -mt-10 relative">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md mb-4 bg-slate-50 flex items-center justify-center">
                    <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                      user.role === 'doctor' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {user.role === 'doctor' ? <Stethoscope className="w-10 h-10" /> : <UserIcon className="w-10 h-10" />}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{user.name || "N/A"}</h2>
                  <p className="text-sm text-slate-500 mb-4">{user.email}</p>
                  <Badge variant="secondary" className={`${
                    user.role === 'doctor' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  } border-none capitalize px-3 font-bold`}>
                    {user.role === 'doctor' ? 'Medical Professional' : user.role}
                  </Badge>
                </div>

                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verified Account</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${user.role === 'doctor' ? 'text-indigo-600' : 'text-primary'}`}>
                    {user.role === 'doctor' ? <ClipboardList className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {user.role === 'doctor' ? 'Patient Cases' : 'Reports Stored'}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className={`w-5 h-5 ${user.role === 'doctor' ? 'text-indigo-500' : 'text-primary'}`} />
                {user.role === 'doctor' ? 'Clinical Activity History' : 'Analysis History'}
              </h3>
              <p className="text-sm text-slate-500">Most recent first</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 w-full bg-slate-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card 
                    key={report._id} 
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group bg-white"
                    onClick={() => navigate("/results", { state: { prediction: report.prediction, formData: report.inputData } })}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl ${
                          report.prediction.toLowerCase().includes('healthy') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                            {report.prediction}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(report.createdAt), "MMM d, yyyy · p")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight text-slate-400 border-slate-200">
                           Details
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-slate-200 bg-transparent py-12">
                <CardContent className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-slate-800 font-bold mb-2">No reports found</h4>
                  <p className="text-slate-500 text-sm max-w-xs mb-6">
                    You haven't performed any blood report analyses yet. Start your first analysis to see it here!
                  </p>
                  <Button onClick={() => navigate("/")}>Analyze Report Now</Button>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

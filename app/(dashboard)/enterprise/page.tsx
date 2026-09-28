"use client";

import { minutesInDay } from "date-fns/constants";
import {
  FolderKanban,
  Clock,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


interface Project {
  id: number;
  name: string;
  line: string;
  lead: string;
  status: "On Track" | "At Risk" | "Completed";
  totalEmployees: number;
  totalHours: number;
  budgetedHours: number;
  weekHours: number;
}

export type EmployeeSession = {
  person_id: number;
  person_last_name: string;
  person_first_name: string;
  line_id: number;
  line_name: string;
  log_id: number;
  login_timestamp: string;
  logout_timestamp: string | null;
  shift_name: string;
  session_minutes: number;
  isLive?: boolean;
}

const projects: Project[] = [
  { id: 1, name: "Assembly Line A", line: "Production", lead: "Pedro Garcia", status: "On Track", totalEmployees: 15, totalHours: 4200, budgetedHours: 5000, weekHours: 120 },
  { id: 2, name: "Assembly Line B", line: "Production", lead: "Carlos Mendez", status: "On Track", totalEmployees: 12, totalHours: 3800, budgetedHours: 4500, weekHours: 96 },
  { id: 3, name: "Assembly Line C", line: "Quality Assurance", lead: "Elena Rivera", status: "At Risk", totalEmployees: 8, totalHours: 2400, budgetedHours: 2500, weekHours: 72 },
  { id: 4, name: "Assembly Line D", line: "Packaging", lead: "Ana Cruz", status: "On Track", totalEmployees: 7, totalHours: 1800, budgetedHours: 2200, weekHours: 56 },
  { id: 5, name: "Assembly Line E", line: "Facilities", lead: "David Ong", status: "Completed", totalEmployees: 6, totalHours: 1100, budgetedHours: 1100, weekHours: 40 },
];

const statusConfig: Record<Project["status"], { color: string; icon: typeof CheckCircle2 }> = {
  "On Track": { color: "bg-emerald-900/40 text-emerald-400", icon: CheckCircle2 },
  "At Risk": { color: "bg-yellow-900/40 text-yellow-400", icon: AlertCircle },
  "Completed": { color: "bg-[#4682B4]/20 text-[#5B9BD5]", icon: CheckCircle2 },
};

const departmentSummary = [
  { line: "Assembly Line A", projects: 2, employees: 27, hours: 8000 },
  { line: "Assembly Line B", projects: 1, employees: 8, hours: 2400 },
  { line: "Assembly Line C", projects: 1, employees: 7, hours: 1800 },
  { line: "Assembly Line D", projects: 1, employees: 6, hours: 1100 },
  { line: "Assembly Line E", projects: 1, employees: 10, hours: 2900 },
];

const EnterprisePage = () => {
  const totalHours = projects.reduce((sum, p) => sum + p.totalHours, 0);
  const totalBudgeted = projects.reduce((sum, p) => sum + p.budgetedHours, 0);
  const totalWeekHours = projects.reduce((sum, p) => sum + p.weekHours, 0);
  const onTrackCount = projects.filter((p) => p.status === "On Track").length;

  const [sessions, setSessions] = useState<EmployeeSession[]>([]);

  type EmployeeReportDay = {
    reporting_day: string;
    sessions: EmployeeSession[];
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch("/api/sessions/detailed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      // console.log("API DATA:", data);
      // console.log("DATA.DATA:", data.data);
      // console.log("Is array:", Array.isArray(data));

      const allSessions = data.data.flatMap(
        (day: EmployeeReportDay) => day.sessions ?? []
      );

      console.log("DATA.DATA:", data.data);
      console.log("ALL SESSIONS:", allSessions);
      console.log("FIRST SESSION:", allSessions[0]);
      console.log("FIRST SESSION KEYS:", Object.keys(allSessions[0] ?? {}));
      console.log(
        "FIRST SESSION JSON:",
        JSON.stringify(allSessions[0], null, 2)
      );

      setSessions(allSessions);

    };

    fetchSessions();
  }, []);

  const hoursByLine = new Map<string, number>();

  sessions.forEach((session) => {
    const lineName = session.line_name;
    if (!lineName) return;

    const minutes = Number(session.session_minutes || 0);
    const currentMinutes = hoursByLine.get(lineName) || 0;

    hoursByLine.set(lineName, currentMinutes + minutes)
  });

  const chartData = Array.from(hoursByLine.entries()).map(
    ([lineName, minutes]) => (
      {
        line: lineName,
        hours: Math.round((minutes / 60) * 10) / 10
      }
    )
  )

  console.log("SESSIONS:", sessions);

  sessions.forEach((session) => {
    console.log(
      "line:",
      session.line_name,
      "minutes:",
      session.session_minutes
    );
  });

  console.log("Chart data:", JSON.stringify(chartData, null, 2));


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 w-full">
      {/* Header */}
      <div className="mx-8 mt-8 mb-2">
        <h1 className="text-2xl font-bold text-white">Factory Report</h1>
        <p className="text-gray-400 text-sm mt-1">
          Projects overview, resource allocation, and department performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-8 my-4">
        <div className="bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <FolderKanban className="h-6 w-6 text-[#4682B4]" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Production Lines</p>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Hours Logged</p>
            <p className="text-2xl font-bold text-white">
              {totalHours.toLocaleString()}h
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <Users className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Assigned Employees</p>
            <p className="text-2xl font-bold text-white">
              {projects.reduce((sum, p) => sum + p.totalEmployees, 0)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4">
          <div className="p-3 bg-gray-700 rounded-lg">
            <Timer className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">This Week</p>
            <p className="text-2xl font-bold text-white">{totalWeekHours}h</p>
          </div>
        </div>
      </div>

      {/* Budget Progress + Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-8 my-2">
        {/* Budget Progress */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Production Lines Progress
            </h2>
            {/* <span className="text-xs text-gray-500">
              {onTrackCount} of {projects.length} on track
            </span> */}
          </div>


          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
              >
                <XAxis type="number" />

                <YAxis
                  type="category"
                  dataKey="line"
                  width={70}
                />

                <Tooltip />

                <Bar
                  dataKey="hours"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Summary */}
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">
              By Production Line
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {departmentSummary.map((dept) => (
              <div
                key={dept.line}
                className="bg-gray-700/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">
                    {dept.line}
                  </span>
                  <span className="text-sm text-gray-400">
                    {dept.hours.toLocaleString()}h
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {/* <span>{dept.projects} project{dept.projects > 1 ? "s" : ""}</span> */}
                  <span>{dept.employees} employees</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total budgeted</span>
              <span className="text-white font-semibold">
                {totalBudgeted.toLocaleString()}h
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Consumed</span>
              <span className="text-[#4682B4] font-semibold">
                {Math.round((totalHours / totalBudgeted) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;

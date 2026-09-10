"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Users,
  FolderKanban,
  TrendingUp,
  CalendarDays,
  ClockAlert,
  DoorOpen,
  UserRoundMinus,
  Clock10Icon,
  Clock2,
  ClockArrowDown,
  ClockFadingIcon,
  ClockPlus,
} from "lucide-react";

interface EmployeeSession {
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
  timeElapsed: string;
}

interface EmployeeReportDay {
  reporting_day: string;
  sessions: EmployeeSession[];
}

interface EmployeeApiResponse {
  success: number;
  data: EmployeeReportDay[];
}

interface RecentTimeEntry extends EmployeeSession {
  reporting_day: string;
}

const API_URL = "/api/sessions/live";


// const projectBreakdown = [
//   { name: "Assembly Line A", hours: 120, employees: 15, color: "bg-[#4682B4]" },
//   { name: "Assembly Line B", hours: 96, employees: 12, color: "bg-[#5B9BD5]" },
//   { name: "Assembly Line C", hours: 72, employees: 8, color: "bg-[#6BAED6]" },
//   { name: "Assembly Line D", hours: 56, employees: 7, color: "bg-[#7EC8E3]" },
//   { name: "Assembly Line E", hours: 40, employees: 6, color: "bg-[#9DC8E3]" },
// ];

type LineBreakdown = {
  lineId: number | string;
  name: string;
  // hours: number;
  employees: number;
};

export default function HomePage() {
  const [recentTimeEntries, setRecentTimeEntries] = useState<
    RecentTimeEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectBreakdown, setProjectBreakdown] = useState<LineBreakdown[]>([]);

  const [activeEmployees, setActiveEmployees] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [doubleClockedInCount, setDoubleClockedInCount] = useState(0);

  const stats = [
    { title: "Active Lines", value: activeProjects.toString(), change: "-1", trend: "down" as const, icon: FolderKanban },
    { title: "Active Employees", value: activeEmployees.toString(), change: "+3", trend: "up" as const, icon: Users },
    { title: "Double Clocked In", value: doubleClockedInCount.toString(), change: "+3", trend: "up" as const, icon: ClockPlus },
    { title: "Missing Clocked In", value: "0", change: "+12%", trend: "up" as const, icon: ClockAlert },
    { title: "Early Departures Today", value: "1", change: "+0.5h", trend: "up" as const, icon: UserRoundMinus },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
  try {
    setIsLoading(true);
    setError("");

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // toate liniile
    });

    if (!apiResponse.ok) {
      throw new Error("Failed to fetch employee entries");
    }

    console.log("API response status:", apiResponse.status);

    const response: EmployeeApiResponse = await apiResponse.json();

    // console.log("LIVE RESPONSE:", response);

    // Toate sesiunile într-un singur array
    const allEntries: RecentTimeEntry[] = response.data.flatMap((day) =>
      day.sessions.map((session) => ({
        reporting_day: day.reporting_day,
        ...session,
      }))
    );

    // ULTIMELE 10 INTRĂRI

    const recentEntries = [...allEntries]
      .sort(
        (a, b) =>
          new Date(b.login_timestamp).getTime() -
          new Date(a.login_timestamp).getTime()
      )
      .slice(0, 10);

    setRecentTimeEntries(recentEntries);

    const activeCount = response.data.reduce(
        (total, day) => total + day.sessions.length,
        0
      );

      setActiveEmployees(activeCount);

    // GROUP BY LINE

    const lines = new Map<
      number | string,
      {
        name: string;
        // totalMinutes: number;
        employees: Set<string>;
      }
    >();

    allEntries.forEach((session) => {
      const lineId = session.line_id;

      if (lineId == null) return;


      const lineName = session.line_name || `Line ${lineId}`;

      const login = new Date(session.login_timestamp).getTime();

      // Pentru sesiune inca activa 
      // const logout = session.logout_timestamp
      //   ? new Date(session.logout_timestamp).getTime()
      //   : Date.now();

      // const minutes = Math.max(
      //   0,
      //   (logout - login) / 1000 / 60
      // );

      if (!lines.has(lineId)) {
        lines.set(lineId, {
          name: lineName,
          // totalMinutes: 0,
          employees: new Set(),
        });
      }

      const line = lines.get(lineId)!;

      // line.totalMinutes += minutes;

      line.employees.add(String(session.person_id));
    });

    // Set the number of active projects based on the number of unique lines
    setActiveProjects(lines.size);


    const breakdown: LineBreakdown[] = Array.from(lines.entries()).map(
      ([lineId, line]) => ({
        lineId,
        name: line.name,
        // hours: Number((line.totalMinutes / 60).toFixed(1)),
        employees: line.employees.size,
      })
    );

    setProjectBreakdown(breakdown);

    // const openSessions = allEntries.filter((session) => session.logout_timestamp === null);

    const sessionsByPerson = new Map<string, number>();

    allEntries.forEach((session) => {
      const personId = String(session.person_id);

      // sessionsByPerson.set(personId, (sessionsByPerson.get(personId) || 0) + 1); //cauta daca exista deja, daca nu pune 0 si adauga 1
      const currentCount = sessionsByPerson.get(personId) ?? 0;
      sessionsByPerson.set(personId, currentCount + 1);
    });

    const doubleClockedInCount = Array.from(sessionsByPerson.values()).filter(count => count > 1).length;
    setDoubleClockedInCount(doubleClockedInCount);

  } catch (error) {
    console.error(error);
    setError("Could not load dashboard data.");
  } finally {
    setIsLoading(false);
  }
};

fetchDashboardData();

  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 w-full">
      {/* Header */}
      <div className="mx-8 mt-8 mb-2">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview of working hours, projects, and team activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mx-8 my-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-gray-800 rounded-xl shadow-md p-6 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{stat.title}</span>
                <Icon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span
                  className={`flex items-center text-xs font-medium ${stat.trend === "up"
                    ? "text-emerald-400"
                    : "text-red-400"
                    }`}
                >
                  {/* {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change} */}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-8 my-4 flex-1">
        {/* Recent Time Entries */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Time Entries
            </h2>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-3 font-medium">Employee</th>
                  <th className="text-left py-3 font-medium">Project</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-left py-3 font-medium">Check-in</th>
                  <th className="text-left py-3 font-medium">Time Elapsed</th>
                  {/* <th className="text-right py-3 font-medium">Hours</th>
                  <th className="text-right py-3 font-medium">Status</th> */}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      Loading recent entries...
                    </td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-red-400">
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && recentTimeEntries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No recent entries found.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  recentTimeEntries.map((entry) => (
                    <tr
                      key={entry.log_id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 text-white">
                        {entry.person_first_name} {entry.person_last_name}
                      </td>

                      <td className="py-3 text-gray-300">
                        {entry.line_name}
                      </td>

                      <td className="py-3 text-gray-400">
                        {new Date(entry.login_timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 text-gray-400">
                        {new Date(entry.login_timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3 text-gray-400">
                        {(() => {
                          const checkIn = new Date(entry.login_timestamp);
                          const now = new Date();

                          const diff = now.getTime() - checkIn.getTime();
                          const totalSeconds = Math.max(0, Math.floor(diff / 1000));

                          const hours = Math.floor(totalSeconds / 3600);
                          const minutes = Math.floor((totalSeconds % 3600) / 60);
                          const seconds = totalSeconds % 60;

                          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
                            2,
                            "0"
                          )}:${String(seconds).padStart(2, "0")}`;
                        })()}
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Lines Breakdown
          </h2>

          <div className="flex flex-col ">
            {projectBreakdown.map((project) => (
              <div className="mt-4 pt-4 border-t border-gray-700" key={project.name}>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {project.name}
                  </span>
                  {/* <span className="text-sm text-white font-medium">
                    {project.hours}h
                  </span> */}
                
                {/* <div className="w-full bg-gray-700 rounded-full h-2">
                { <div
                  className={`${project.color} h-2 rounded-full transition-all`}
                  style={{
                    width: `${(project.hours / 120) * 100}%`,
                  }}
                /> }
                </div> */}
                  <span className="text-xs ">
                    {project.employees} employees
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total logged</span>
              <span className="text-white font-semibold">384h</span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  FolderKanban,
  Clock,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Timer,
  Filter,
  ChevronDown,
  CalendarDays,
  X,
} from "lucide-react";
import { useEffect, useState, FormEvent, useRef, useMemo } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
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

interface EmployeeReportDay {
  reporting_day: string;
  person_id?: number;
  person_last_name?: string;
  person_first_name?: string;
  sessions: EmployeeSession[];
  line_id?: number;
  line_name?: string;
}

const projects: Project[] = [
  { id: 1, name: "Assembly Line A", line: "Production", lead: "Pedro Garcia", status: "On Track", totalEmployees: 15, totalHours: 4200, budgetedHours: 5000, weekHours: 120 },
  { id: 2, name: "Assembly Line B", line: "Production", lead: "Carlos Mendez", status: "On Track", totalEmployees: 12, totalHours: 3800, budgetedHours: 4500, weekHours: 96 },
  { id: 3, name: "Assembly Line C", line: "Quality Assurance", lead: "Elena Rivera", status: "At Risk", totalEmployees: 8, totalHours: 2400, budgetedHours: 2500, weekHours: 72 },
  { id: 4, name: "Assembly Line D", line: "Packaging", lead: "Ana Cruz", status: "On Track", totalEmployees: 7, totalHours: 1800, budgetedHours: 2200, weekHours: 56 },
  // { id: 5, name: "Assembly Line E", line: "Facilities", lead: "David Ong", status: "Completed", totalEmployees: 6, totalHours: 1100, budgetedHours: 1100, weekHours: 40 },
];

// const statusConfig: Record<Project["status"], { color: string; icon: typeof CheckCircle2 }> = {
//   "On Track": { color: "bg-emerald-900/40 text-emerald-400", icon: CheckCircle2 },
//   "At Risk": { color: "bg-yellow-900/40 text-yellow-400", icon: AlertCircle },
//   "Completed": { color: "bg-[#4682B4]/20 text-[#5B9BD5]", icon: CheckCircle2 },
// };


// const hardData = [
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 }, { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "307R + 307R Magnet", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
//   { line: "308", hours: 48 },
//   { line: "309", hours: 21.7 },
//   { line: "310", hours: 15.3 },
//   { line: "304 DWT", hours: 32.5 },
// ];



const EnterprisePage = () => {
  // const [sessions, setSessions] = useState<EmployeeSession[]>([]);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState("All Lines");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [appliedLine, setAppliedLine] = useState("All Lines");
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeReportDay[]>([]);
  const [loading, setLoading] = useState(true);

  const [productionLines, setProductionLines] = useState<
    { line_id: number; line_name: string }[]
  >([]);

  const handleSearch = async (
    event?: FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();

    setAppliedLine(selectedLine);
    setAppliedDateRange(dateRange);

    setLineDropdownOpen(false);
    setCalendarOpen(false);

    const defaultRange = getDefaultDateRange();

    const fromDate = dateRange?.from ?? defaultRange.from;
    const toDate =
      dateRange?.to ?? dateRange?.from ?? defaultRange.to;

    const selectedProductionLine = productionLines.find(
      (line) => line.line_name === selectedLine
    );

    if (
      selectedLine !== "All Lines" &&
      !selectedProductionLine
    ) {
      console.error("Production line ID not found");
      return;
    }

    await fetchSessions(
      fromDate,
      toDate,
      selectedProductionLine?.line_id
    );
  };



  const employeeRows = useMemo(() => {
    return employeeRecords.flatMap((day) =>
      (day.sessions ?? []).map((session) => ({
        day,
        session: {
          ...session,

          person_id: session.person_id ?? day.person_id,
          person_first_name:
            session.person_first_name ?? day.person_first_name,
          person_last_name:
            session.person_last_name ?? day.person_last_name,

          line_id: session.line_id ?? day.line_id,
          line_name: session.line_name ?? day.line_name,
        },
      }))
    );
  }, [employeeRecords]);


  const parseReportingDay = (date?: string) => {
    if (!date) return null;

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  };

  const filteredLines = employeeRows.filter(({ day, session }) => {
    const matchesLine =
      appliedLine === "All Lines" || session.line_name === appliedLine;

    const lineDate = parseReportingDay(day.reporting_day);

    const matchesDate =
      !appliedDateRange?.from && !appliedDateRange?.to
        ? true
        : lineDate
          ? (!appliedDateRange?.from || lineDate >= appliedDateRange.from) &&
          (!appliedDateRange?.to || lineDate <= appliedDateRange.to)
          : false;

    return matchesLine && matchesDate;
  });
  // console.log("Filtered Lines:", filteredLines);

  const hasDateFilter =
    !!appliedDateRange?.from ||
    !!appliedDateRange?.to;

  // const hasLineFilter =
  //   appliedLine !== "All Lines";

  const now = new Date();
  const startWeek = new Date(now);
  const day = startWeek.getDay();

  const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday (0) to be the last day of the week
  startWeek.setDate(startWeek.getDate() + diff);
  startWeek.setHours(0, 0, 0, 0);

  const endWeek = new Date(startWeek);
  endWeek.setDate(startWeek.getDate() + 6);
  endWeek.setHours(23, 59, 59, 999);

  const chartRows = filteredLines;

  const totalLines = new Set(
    chartRows.map(({ session }) => session.line_name).filter(Boolean)
  ).size;

  const totalEmployees = new Set(
    chartRows.map(({ session }) => session.person_id).filter((id) => id != null)
  ).size;



  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);


  let chartData;
  if (hasDateFilter) {
    const hoursByDay = new Map<string, number>();

    chartRows.forEach(({ day, session }) => {
      const date = day.reporting_day;
      const minutes = Number(session.session_minutes || 0);

      hoursByDay.set(
        date,
        (hoursByDay.get(date) || 0) + minutes
      );
    });

    chartData = Array.from(hoursByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, minutes]) => ({
        line: date,
        hours: Math.round((minutes / 60) * 10) / 10,
      }));
  } else {
    const hoursByLine = new Map<string, number>();

    chartRows.forEach(({ session }) => {
      const lineName = session.line_name;
      if (!lineName) return;

      const minutes = Number(session.session_minutes || 0);
      const currentMinutes = hoursByLine.get(lineName) || 0;

      hoursByLine.set(lineName, currentMinutes + minutes);
    });

    chartData = Array.from(hoursByLine.entries()).map(
      ([lineName, minutes]) => ({
        line: lineName,
        hours: Math.round((minutes / 60) * 10) / 10,
      })
    );

  }

  console.log("Start week:", startWeek);
  console.log("End week:", endWeek);

  // console.log("Employee rows:", employeeRows.length);
  // console.log("Chart rows:", chartRows.length);
  console.log("Chart data:", chartData);

  // const chartData = Array.from(hoursByLine.entries()).map(
  //   ([lineName, minutes]) => (
  //     {
  //       line: lineName,
  //       hours: Math.round((minutes / 60) * 10) / 10
  //       // hours: Math.round(minutes / 60)
  //     }
  //   )
  // )

  // console.log("CHART DATA:", chartData);

  const totalHours = chartData.reduce(
    (sum, item) => sum + item.hours,
    0
  );



  // const totalBudgeted = projects
  //   // .filter((p) => p.line !== "All Lines")
  //   .reduce((sum, p) => sum + p.budgetedHours, 0);
  const totalWeekHours = projects.reduce((sum, p) => sum + p.weekHours, 0);
  // const onTrackCount = projects.filter((p) => p.status === "On Track").length;

  // const [totalLines, setTotalLines] = useState(0);




  const stats = [
    {
      title: "Total Production Lines",
      value: totalLines,
      icon: FolderKanban,
      iconColor: "text-[#4682B4]",
    },
    {
      title: "Total Hours",
      value: `${Math.round(totalHours).toLocaleString("ro-RO")}h`,
      icon: Clock,
      iconColor: "text-gray-400",
    },
    {
      title: "Assigned Employees",
      value: totalEmployees,
      icon: Users,
      iconColor: "text-emerald-400",
    },

  ];



  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDefaultDateRange = () => {
    const today = new Date();

    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const startWeek = new Date(today);
    startWeek.setDate(today.getDate() + diff);
    startWeek.setHours(0, 0, 0, 0);

    return {
      from: startWeek,
      to: today,
    };
  };

  async function fetchSessions(from: Date, to: Date, line_id?: number) {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions/detailed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formatApiDate(from),
          to: formatApiDate(to),
          ...(line_id !== undefined ? { line_id } : {}),
        }),
      });

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();

      if (data.success !== 1 || !Array.isArray(data.data)) {
        throw new Error("Invalid sessions data");
      }

      const records: EmployeeReportDay[] = data.data;

      setEmployeeRecords(records);

      // Păstrăm lista liniilor cunoscute și ID-urile reale
      const lines = records.flatMap((day) =>
        (day.sessions ?? []).map((session) => ({
          line_id: session.line_id ?? day.line_id,
          line_name: session.line_name ?? day.line_name,
        }))
      );

      setProductionLines((previous) => {
        const lineMap = new Map(
          previous.map((line) => [line.line_id, line.line_name])
        );

        lines.forEach((line) => {
          if (
            line.line_id !== undefined &&
            line.line_name
          ) {
            lineMap.set(line.line_id, line.line_name);
          }
        });

        return Array.from(lineMap, ([line_id, line_name]) => ({
          line_id,
          line_name,
        }));
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { from, to } = getDefaultDateRange();

    fetchSessions(from, to);
  }, []);

  // useEffect(() => {
  //   const fetchSessions = async () => {
  //     const response = await fetch("/api/sessions/detailed", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({}),
  //     });

  //     if (response.status === 401) {
  //       // Session cookie is gone/dead — full navigation so proxy.ts reroutes
  //       // to /login instead of rendering an empty page.
  //       window.location.replace("/login");
  //       return;
  //     }

  //     const data = await response.json();
  //     setEmployeeRecords(data.data);

  //     // console.log("API DATA:", data);
  //     // console.log("DATA.DATA:", data.data);
  //     // console.log("Is array:", Array.isArray(data));

  //     const allSessions = data.data.flatMap(
  //       (day: EmployeeReportDay) => day.sessions ?? []
  //     );

  //     setSessions(allSessions);

  //   };

  //   fetchSessions();
  // }, []);



  // console.log("SESSIONS:", sessions);

  // sessions.forEach((session) => {
  //   console.log(
  //     "line:",
  //     session.line_name,
  //     "minutes:",
  //     session.session_minutes
  //   );
  // });

  // console.log("Chart data:", JSON.stringify(chartData));


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 w-full">
      {/* Header */}
      <div className="mx-8 mt-8 mb-2">
        <h1 className="text-2xl font-bold text-white">Factory Report</h1>
        <p className="text-gray-400 text-sm mt-1">
          Projects overview, resource allocation and lines performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid  sm:grid-cols-1 lg:grid-cols-6 gap-4 mx-8 my-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-gray-800 rounded-xl shadow-md p-6 flex items-center gap-4"
            >

              <div className={`p-3 bg-gray-700 rounded-lg ${stat.icon}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}



        <form
          onSubmit={handleSearch}
          className="col-span-3 bg-gray-800 rounded-xl shadow-md p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">

            {/* Production Line */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Production Line
              </h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLineDropdownOpen(!lineDropdownOpen)}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2 w-full text-sm text-white hover:bg-gray-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    {selectedLine}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${lineDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {lineDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1">
                    {[{ line_id: -1, line_name: "All Lines" }, ...productionLines].map((line) => (
                      <button
                        type="button"
                        key={line.line_id}
                        onClick={() => {
                          setSelectedLine(line.line_name);
                          setLineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition ${selectedLine === line.line_name
                          ? "text-[#4682B4] font-medium"
                          : "text-gray-300"
                          }`}
                      >
                        {line.line_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Date Range
              </h2>

              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2 w-full text-sm text-white hover:bg-gray-600 transition"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />

                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                        </>
                      ) : (
                        <>From {formatDate(dateRange.from)}</>
                      )
                    ) : (
                      "Select date range"
                    )}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${calendarOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {calendarOpen && (
                  <div className="absolute z-20 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 text-white">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      disabled={{
                        before: sixMonthsAgo,
                        after: today,
                      }}
                      excludeDisabled
                      className="text-white"
                    />

                    <div className="flex justify-between items-center mt-3">
                      <button
                        type="button"
                        onClick={() => setDateRange(undefined)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => setCalendarOpen(false)}
                        className="bg-[#4682B4] hover:bg-[#3a6f9a] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div>
              <button
                type="submit"
                className="h-[40px] px-6 bg-[#3b82f6] hover:bg-[#3a6f9a] text-white rounded-lg text-sm font-medium transition"
              >
                Search
              </button>
            </div>

          </div>
        </form>

      </div>

      {/* Production Lines Progress */}
      <div className=" flex-1 min-h-0 flex flex-col grid grid-cols-1 lg:grid-cols-2 gap-6 mx-8 my-2">
        {/* Production Lines Progress */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-md flex flex-col min-h-[390px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white p-6">
              Production Lines Progress
            </h2>
            {/* <span className="text-xs text-gray-500">
              {onTrackCount} of {projects.length} on track
            </span> */}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">Loading production lines...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No data available for the current week.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  barSize={40}
                  margin={{ top: 45, right: 20, left: 10, bottom: 10 }}
                  data={chartData}
                  layout="horizontal"
                // margin={{
                //   top: 5,
                //   right: 10,
                //   left: 10,
                //   bottom: 0,
                // }}

                >
                  <YAxis
                    type="number"
                    label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#a9a9a9" }}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]} //spatiu deaspura de cel mai mare bar
                  // label={{ position: "bottom", offset: -5 }}
                  />

                  <XAxis
                    type="category"
                    dataKey="line"
                    interval={0} //nu ascunde nicio etichetă
                    angle={-45} //înclină etichetele la 45 de grade
                    textAnchor="end" //aliniere la capătul etichetei
                    height={70}
                  // tick={<CustomXAxisTick />}
                  // width={100}
                  // label={{ angle: -90, position: "insideLeft", offset: -10 }}
                  />

                  {/* <Tooltip /> */}

                  <Bar
                    dataKey="hours"
                    fill="#3b82f6"
                    // width={30}
                    radius={[6, 6, 0, 0]}
                    label={{ position: 'top', fill: '#ffffff', fontSize: 14, fontWeight: 'bold' }}
                  >
                    {/* <LabelList dataKey="hours" position="top" fill="#ffffff" fontSize={14} fontWeight: "bold" /> */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>



      </div>
    </div>
  );
};

export default EnterprisePage;

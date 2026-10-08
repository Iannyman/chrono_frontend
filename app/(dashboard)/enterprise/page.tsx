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


const productionLines = [
  { line: "Assembly Line A", minutes: 8000 },
  { line: "Assembly Line B", minutes: 2400 },
  { line: "Assembly Line C", minutes: 1800 },
  { line: "Assembly Line D", minutes: 1100 },
  { line: "Assembly Line E", minutes: 2900 },
  { line: "Assembly Line A", minutes: 8000 },
  { line: "Assembly Line B", minutes: 2400 },
  { line: "Assembly Line C", minutes: 1800 },
  { line: "Assembly Line D", minutes: 1100 },
  { line: "Assembly Line E", minutes: 2900 },
  { line: "Assembly Line A", minutes: 8000 },
  { line: "Assembly Line B", minutes: 2400 },
  { line: "Assembly Line C", minutes: 1800 },
  { line: "Assembly Line D", minutes: 1100 },
  { line: "Assembly Line E", minutes: 2900 },
];

const chartData = [
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 }, { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "307R + 307R Magnet", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
  { line: "308", hours: 48 },
  { line: "309", hours: 21.7 },
  { line: "310", hours: 15.3 },
  { line: "304 DWT", hours: 32.5 },
];

const CustomXAxisTick = ({ x, y, payload }: any) => {
  const words = payload.value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={12}
      >
        {words.map((word: string, index: number) => (
          <tspan
            key={index}
            x="0"
            dy={index === 0 ? 0 : 14}
          >
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const EnterprisePage = () => {
  const [sessions, setSessions] = useState<EmployeeSession[]>([]);
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState("All Lines");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [appliedLine, setAppliedLine] = useState("All Lines");
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeReportDay[]>([]);
  const [loading, setLoading] = useState(true);

  const productionLines = Array.from(
    new Set(sessions.map((session) => session.line_name))
  );

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setAppliedLine(selectedLine);
    setAppliedDateRange(dateRange);

    setLineDropdownOpen(false);
    setCalendarOpen(false);
  };



  const employeeRows = useMemo(() => {
    const employeeRows = employeeRecords.flatMap((day) =>
      (day.sessions ?? []).map((session) => ({
        day,
        session,
      }))
    );
    // const liveRows = liveSession.flatMap((session) => ({
    //   day: {
    //     reporting_day: session.login_timestamp.split("T")[0],
    //     sessions: [],
    //   },
    //   session: {
    //     ...session,
    //     isLive: true,
    //   },
    // }));
    return [...employeeRows];
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

  const hasLineFilter =
    appliedLine !== "All Lines";

  const now = new Date();
  const startWeek = new Date(now);
  const day = startWeek.getDay();

  const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday (0) to be the last day of the week
  startWeek.setDate(startWeek.getDate() + diff);
  startWeek.setHours(0, 0, 0, 0);

  const endWeek = new Date(startWeek);
  endWeek.setDate(startWeek.getDate() + 6);
  endWeek.setHours(23, 59, 59, 999);

  const chartRows = hasDateFilter || hasLineFilter
    ? filteredLines
    : employeeRows.filter(({ day }) => {
      const rowDate = parseReportingDay(day.reporting_day);
      return (
        rowDate &&
        rowDate >= startWeek &&
        rowDate <= endWeek
      );
    });

  const totalLines = new Set(
    filteredLines.map(({ session }) => session.line_name)
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
    filteredLines.forEach(({ day, session }) => {
      const date = day.reporting_day;
      if (!date) return;

      const minutes = Number(session.session_minutes || 0);
      const currentMinutes = hoursByDay.get(date) || 0;

      hoursByDay.set(date, currentMinutes + minutes);
    });

    chartData = Array.from(hoursByDay.entries()).map(
      ([date, minutes]) => ({
        line: date,
        hours: Math.round((minutes / 60) * 10) / 10,
      })
    );
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
// console.log("Chart data:", chartData);

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



  type EmployeeReportDay = {
    reporting_day: string;
    sessions: EmployeeSession[];
  };

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
      value: projects.reduce((sum, p) => sum + p.totalEmployees, 0),
      icon: Users,
      iconColor: "text-emerald-400",
    },
    {
      title: "This Week",
      value: totalWeekHours,
      icon: Timer,
      iconColor: "text-yellow-400",
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
      setEmployeeRecords(data.data);

      // console.log("API DATA:", data);
      // console.log("DATA.DATA:", data.data);
      // console.log("Is array:", Array.isArray(data));

      const allSessions = data.data.flatMap(
        (day: EmployeeReportDay) => day.sessions ?? []
      );

      setSessions(allSessions);

    };

    fetchSessions();
  }, []);



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
          Projects overview, resource allocation, and department performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-8 my-2">
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
      </div>


      <form
        onSubmit={handleSearch}
        className="flex flex-col grid grid-cols-1 lg:grid-cols-4  gap-4 mx-8 my-2"
      >

        {/* Production Line Filter */}
        <div className=" bg-gray-800 rounded-xl shadow-md p-6">
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
                {productionLines.map((line) => (
                  <button
                    key={line}
                    onClick={() => {
                      setSelectedLine(line);
                      setLineDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition ${selectedLine === line
                      ? "text-[#4682B4] font-medium"
                      : "text-gray-300"
                      }`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className=" bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Date Range</h2>

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
                    onClick={() => setDateRange(undefined)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>

                  <button
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

        {/* Search Button */}
        <div className="sm:w-40 bg-gray-800 rounded-xl shadow-md p-6 flex items-end">
          <button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#3a6f9a] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Search
          </button>
        </div>

      </form>



      {/* Budget Progress + Department Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-8 my-2">
        {/* Budget Progress */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white p-6">
              Production Lines Progress
            </h2>
            {/* <span className="text-xs text-gray-500">
              {onTrackCount} of {projects.length} on track
            </span> */}
          </div>

          <div className=" flex w-full h-100 ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  radius={[6, 6, 0, 0]}
                  label={{ position: 'top', fill: '#ffffff', fontSize: 14, fontWeight: 'bold' }}
                >
                  {/* <LabelList dataKey="hours" position="top" fill="#ffffff" fontSize={14} fontWeight="bold" /> */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>
    </div>
  );
};

export default EnterprisePage;

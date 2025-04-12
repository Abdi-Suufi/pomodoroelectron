import React, { useState } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { useData } from "../store/DataContext";

function Reports() {
  const { tasks, reports } = useData();
  const [viewMode, setViewMode] = useState("daily"); // 'daily', 'weekly', or 'monthly'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const getTaskById = (taskId) => {
    return tasks.find((task) => task.id === taskId) || { id: taskId, title: "Deleted Task" };
  };

  const getDailyReport = () => {
    const selectedDay = new Date(selectedDate).toDateString();
    const dayReport = reports.find(
      (r) => new Date(r.date).toDateString() === selectedDay
    );

    if (!dayReport) {
      return { date: selectedDate, pomodoros: [] };
    }

    return dayReport;
  };

  const getWeeklyReport = () => {
    const date = parseISO(selectedDate);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map((day) => {
      const dayString = day.toDateString();
      const dayReport = reports.find(
        (r) => new Date(r.date).toDateString() === dayString
      );

      return {
        date: format(day, "yyyy-MM-dd"),
        displayDate: format(day, "EEE, MMM d"),
        pomodoros: dayReport ? dayReport.pomodoros : [],
      };
    });
  };

  const getMonthlyReport = () => {
    const date = parseISO(selectedDate);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthReports = reports.filter((r) => {
      const reportDate = new Date(r.date);
      return reportDate >= monthStart && reportDate <= monthEnd;
    });

    // Group by task
    const taskCounts = {};

    monthReports.forEach((report) => {
      report.pomodoros.forEach((pomodoro) => {
        if (!taskCounts[pomodoro.taskId]) {
          taskCounts[pomodoro.taskId] = 0;
        }
        taskCounts[pomodoro.taskId]++;
      });
    });

    const taskStats = Object.entries(taskCounts).map(([taskId, count]) => ({
      task: getTaskById(taskId),
      count,
    }));

    return {
      totalPomodoros: monthReports.reduce(
        (sum, r) => sum + r.pomodoros.length,
        0
      ),
      taskStats: taskStats.sort((a, b) => b.count - a.count),
    };
  };

  const renderDailyReport = () => {
    const report = getDailyReport();
    const taskGroups = {};

    report.pomodoros.forEach((pomodoro) => {
      if (!taskGroups[pomodoro.taskId]) {
        taskGroups[pomodoro.taskId] = [];
      }
      taskGroups[pomodoro.taskId].push(pomodoro);
    });

    return (
      <div className="daily-report">
        <h3>
          Daily Report for {format(new Date(selectedDate), "MMMM d, yyyy")}
        </h3>

        {report.pomodoros.length === 0 ? (
          <p>No pomodoros completed on this day </p>
        ) : (
          <>
            <div className="report-summary">
              <div className="stat-card">
                <h4>Total Pomodoros</h4>
                <div className="stat-value">{report.pomodoros.length}</div>
              </div>
            </div>

            <h4>Tasks</h4>
            <ul className="task-report-list">
              {Object.entries(taskGroups).map(([taskId, pomodoros]) => {
                const task = getTaskById(taskId);
                return (
                  <li key={taskId}>
                    <div className="task-name">{task.title}</div>
                    <div className="pomodoro-count">
                      {pomodoros.length} pomodoros
                    </div>
                    <div className="pomodoro-times">
                      {pomodoros.map((p, i) => (
                        <span key={i}>
                          {format(new Date(p.timestamp), "h:mm a")}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    );
  };

  const renderWeeklyReport = () => {
    const weeklyData = getWeeklyReport();
    const totalPomodoros = weeklyData.reduce(
      (sum, day) => sum + day.pomodoros.length,
      0
    );

    return (
      <div className="weekly-report">
        <h3>Weekly Report</h3>
        <p>
          Week of {format(parseISO(weeklyData[0].date), "MMMM d")} to{" "}
          {format(parseISO(weeklyData[6].date), "MMMM d, yyyy")}
        </p>

        <div className="report-summary">
          <div className="stat-card">
            <h4>Total Pomodoros</h4>
            <div className="stat-value">{totalPomodoros}</div>
          </div>
        </div>

        <div className="weekly-chart">
          {weeklyData.map((day) => (
            <div key={day.date} className="day-column">
              <div
                className="pomodoro-bar"
                style={{
                  height: `${day.pomodoros.length * 15}px`,
                  minHeight: day.pomodoros.length ? "15px" : "0",
                }}
              >
                {day.pomodoros.length > 0 && day.pomodoros.length}
              </div>
              <div className="day-label">{day.displayDate}</div>
            </div>
          ))}
        </div>

        <h4>Daily Breakdown</h4>
        <ul className="weekly-breakdown">
          {weeklyData.map((day) => (
            <li key={day.date}>
              <div className="day-info">
                <strong>{day.displayDate}</strong>
                <span>{day.pomodoros.length} pomodoros</span>
              </div>

              {day.pomodoros.length > 0 && (
                <div className="day-tasks">
                  {Array.from(new Set(day.pomodoros.map((p) => p.taskId))).map(
                    (taskId) => {
                      const task = getTaskById(taskId);
                      const count = day.pomodoros.filter(
                        (p) => p.taskId === taskId
                      ).length;
                      return (
                        <div key={taskId} className="day-task">
                          {task.title}: {count}{" "}
                          {count === 1 ? "pomodoro" : "pomodoros"}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    const { totalPomodoros, taskStats } = getMonthlyReport();
    const date = parseISO(selectedDate);
    const monthName = format(date, "MMMM yyyy");

    return (
      <div className="monthly-report">
        <h3>Monthly Report for {monthName}</h3>

        <div className="report-summary">
          <div className="stat-card">
            <h4>Total Pomodoros</h4>
            <div className="stat-value">{totalPomodoros}</div>
          </div>
          <div className="stat-card">
            <h4>Active Tasks</h4>
            <div className="stat-value">{taskStats.length}</div>
          </div>
        </div>

        <h4>Tasks</h4>
        {taskStats.length === 0 ? (
          <p>No pomodoros completed in this month</p>
        ) : (
          <ul className="monthly-task-list">
            {taskStats.map(({ task, count }) => (
              <li key={task.id || 'unknown'}>
                <div className="task-name">{task.title}</div>
                <div className="task-pomodoro-bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / totalPomodoros) * 100}%`,
                    }}
                  />
                </div>
                <div className="pomodoro-count">
                  {count} {count === 1 ? "pomodoro" : "pomodoros"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>

      <div className="report-controls">
        <div className="view-mode-selector">
          <button
            className={viewMode === "daily" ? "active" : ""}
            onClick={() => setViewMode("daily")}
          >
            Daily
          </button>
          <button
            className={viewMode === "weekly" ? "active" : ""}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
          <button
            className={viewMode === "monthly" ? "active" : ""}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
        </div>

        <div className="date-selector">
          {viewMode === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          )}

          {viewMode === "weekly" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          )}

          {viewMode === "monthly" && (
            <input
              type="month"
              value={selectedDate.substring(0, 7)}
              onChange={(e) => setSelectedDate(`${e.target.value}-01`)}
            />
          )}
        </div>
      </div>

      <div className="report-content">
        {viewMode === "daily" && renderDailyReport()}
        {viewMode === "weekly" && renderWeeklyReport()}
        {viewMode === "monthly" && renderMonthlyReport()}
      </div>
    </div>
  );
}

export default Reports;

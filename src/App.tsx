import "./App.css";
import { codechef, codeforces, leetcode } from "./constants/logos";
import { fetchContests } from "./backend/FetchContests";
import { FaCalendarPlus } from "react-icons/fa"; // Importing icons from FontAwesome
import { useEffect, useState } from "react";

type Contest = {
  SiteName: string;
  Contest: string;
  Date: string;
  Link: string;
};

const calculateTimeRemaining = (contestDate: string): string => {
  const now = new Date();

  // Parse the contestDate in the format '17.09 Tue 20:05'
  const [dayMonth, , time] = contestDate.split(" ");
  const [day, month] = dayMonth.split(".").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const contestDateTime = new Date(
    now.getFullYear(),
    month - 1,
    day,
    hours,
    minutes
  );

  // Calculate the difference in milliseconds
  const timeDiff = contestDateTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    // If the contest has already ended or is happening now
    return "The contest is ongoing.";
  }

  // Calculate remaining time
  const secondsRemaining = Math.floor(timeDiff / 1000);
  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const hoursRemaining = Math.floor(minutesRemaining / 60);

  // Get remaining time components
  const remainingSeconds = secondsRemaining % 60;
  const remainingMinutes = minutesRemaining % 60;
  const remainingHours = hoursRemaining;

  // Format the remaining time
  let result = "";
  if (remainingHours > 0) {
    result += `${remainingHours} hour${remainingHours > 1 ? "s" : ""} `;
  }
  result += `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} `;
  result += `${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`;

  return result.trim();
};

const addToCalendar = (contest: { SiteName: string; Contest: string; Date: string }) => {
  // Parse the contest date using a flexible approach
  const now = new Date();
  
  // Assuming contest.Date is in format like '17.09 Tue 20:05'
  const [dayMonth, , time] = contest.Date.split(" ");
  const [day, month] = dayMonth.split(".").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const year = now.getFullYear();
  const contestStartDate = new Date(year, month - 1, day, hours, minutes);
  const contestEndDate = new Date(contestStartDate.getTime() + 2 * 60 * 60 * 1000); // Adding 2 hours for duration

  const startDate = contestStartDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDate = contestEndDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    contest.Contest
  )}&dates=${startDate}/${endDate}&details=Join%20the%20contest%20on%20${
    contest.SiteName
  }&sf=true&output=xml`;

  // Open the calendar link
  window.open(calendarLink, "_blank");
};

const App = () => {
  return (
    <div className="app__container">
      <h2>Contest Tracker</h2>
      <span>Track your competitive coding contests here</span>
      <ContestTable />
    </div>
  );
};

export default App;



const ContestTable = () => {
  const [data, setData] = useState<Contest[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(3); // Start with 3 visible contests
  const [isAllLoaded, setIsAllLoaded] = useState<boolean>(false); // Track if all contests are loaded
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  console.log(currentTime);
  useEffect(() => {
    fetchContests().then((contests) => {
      setData(contests);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    // Update `currentTime` every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);


  const loadMore = () => {
    setVisibleCount(data.length); // Load all contests
    setIsAllLoaded(true); // Mark all contests as loaded
  };


  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <radialGradient id="a9" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
            <stop offset="0" stopColor="#FF156D"></stop>
            <stop offset=".3" stopColor="#FF156D" stopOpacity=".9"></stop>
            <stop offset=".6" stopColor="#FF156D" stopOpacity=".6"></stop>
            <stop offset=".8" stopColor="#FF156D" stopOpacity=".3"></stop>
            <stop offset="1" stopColor="#FF156D" stopOpacity="0"></stop>
          </radialGradient>
          <circle
            transform-origin="center"
            fill="none"
            stroke="url(#a9)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray="200 1000"
            strokeDashoffset="0"
            cx="100"
            cy="100"
            r="70"
          >
            <animateTransform
              type="rotate"
              attributeName="transform"
              calcMode="spline"
              dur="2s"
              values="360;0"
              keyTimes="0;1"
              keySplines="0 0 1 1"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
          <circle transform-origin="center" fill="none" opacity=".2" stroke="#FF156D" strokeWidth="15" strokeLinecap="round" cx="100" cy="100" r="70"></circle>
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <table className="contest__table">
        <thead>
          <tr>
            <th style={{ width: "10%", textAlign: "center" }}>Site</th>
            <th style={{ width: "40%", textAlign: "center" }}>Name</th>
            <th style={{ width: "10%", textAlign: "center" }}>Date</th>
            <th style={{ textAlign: "center", width: "30%" }}>Time left</th>
            <th style={{ width: "10%", textAlign: "center" }}></th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((contest) =>
              ["codechef.com", "leetcode.com", "codeforces.com"].includes(
                contest.SiteName
              )
            )
            .slice(0, visibleCount) // Show contests based on visibleCount
            .map((contest, idx) => (
              <tr key={idx}>
                <td style={{ width: "10%", textAlign: "center" }} className="card__container">
                  {contest.SiteName === "codechef.com" ? (
                    <img src={codechef} alt="codechef" />
                  ) : contest.SiteName === "codeforces.com" ? (
                    <img src={codeforces} alt="codeforces" />
                  ) : (
                    <img src={leetcode} alt="leetcode" />
                  )}
                </td>
                <td style={{ width: "40%", textAlign: "center" }}>
                  <a target="_blank" rel="noopener noreferrer" href={contest.Link}>{contest.Contest}</a>
                </td>
                <td style={{ width: "10%", textAlign: "center" }}>
                  {contest.Date}
                </td>
                <td style={{ width: "30%", textAlign: "center" }}>
                  {calculateTimeRemaining(contest.Date)}
                </td>
                <td style={{ width: "10%" }}>
                  <button onClick={() => addToCalendar(contest)} className="icon-button">
                    <FaCalendarPlus />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {!isAllLoaded && visibleCount < data.length && ( // Show button only if there are more contests and not all are loaded
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button onClick={loadMore} className="load-more-button">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

// const App = () => {
//   return (
//     <div className="app__container">
//       <h2>Contest Tracker</h2>
//       <span>Track your competitive coding contests here</span>
//       <ContestTable />
//     </div>
//   );
// };

// export default App;

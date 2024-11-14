const CACHE_KEY = 'contestCache';
const CACHE_EXPIRY_KEY = 'contestCacheExpiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export const fetchContests = async () => {
  const cachedContests = localStorage.getItem(CACHE_KEY);
  const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

  // Check if cache exists and is still valid
  if (cachedContests && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
    return JSON.parse(cachedContests);
  }

  // Fetch contests from the API
  const apiContests = await fetchFromAPI();

  // Cache the response
  localStorage.setItem(CACHE_KEY, JSON.stringify(apiContests));
  localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());

  return apiContests;
};

const fetchFromAPI = async () => {
  const API_URL = "https://clist.by/api/v4/contest/?upcoming=true&format_time=true&order_by=start"; // Replace with the actual API URL
  const apiKey = "hussain2004:7024834f2f82e4eb321e0a87cf5219771b7c426f";

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": `ApiKey ${apiKey}`,
      },
    });

    // Fetch the response as JSON
    const jsonFile = await response.json();
    console.log(jsonFile); // Log the raw JSON response for debugging

    // Check if 'objects' array is present in the response
    if (jsonFile?.objects) {
      const contestList = jsonFile.objects.map((contest:any) => ({
        Contest: contest.event,
        SiteName: contest.host,
        Date: contest.start,
        Link: contest.href,
      }));

      // Log the parsed contest data for debugging
      console.log(contestList);

      // Now return the contest list for further use or display
      return contestList;
    } else {
      console.error("No contests found in the response.");
      return [];
    }

  } catch (error) {
    console.error("Error fetching contests from API:", error);
    return [];
  }
};
export function formatMessageTimestamp(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Determine A.M. / P.M.
  const suffix = hours >= 12 ? "PM" : "AM";

  // Convert 24h → 12h, making “0” → “12”
  hours = hours % 12;
  if (hours === 0) hours = 12;

  // Pad minutes to two digits
  const minutesPadded = minutes < 10 ? `0${minutes}` : `${minutes}`;

  // Use “.” between hours and minutes to match your example
  return `${hours}.${minutesPadded} ${suffix}`;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function formatDateSeparator(date: Date) {
  // Get current date at midnight in local timezone
  const now = new Date();

  // Get today and yesterday in UTC to match message timestamps
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);

  // Convert the message date to UTC midnight
  const messageDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  // Compare UTC timestamps
  if (messageDay.getTime() === today.getTime()) return "Today";
  if (messageDay.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatLastSeen(date: string): string {
  if (!date) return "Never online";

  const lastSeenDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Format the time part (reusing existing function)
  const timeString = formatMessageTimestamp(lastSeenDate);

  // Check if the date is today or yesterday
  if (isSameDay(lastSeenDate, today)) {
    return `last seen today at ${timeString}`;
  } else if (isSameDay(lastSeenDate, yesterday)) {
    return `last seen yesterday at ${timeString}`;
  } else {
    // For older dates, use the date without time
    return `last seen ${lastSeenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
}

export function formatCallDuration(seconds: number): string {
  if (seconds < 0) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Format with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  // Only include hours if the call is at least an hour long
  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
}

export const formatLastMessageTime = (
  timestamp: string | Date | undefined
): string => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Compare dates without time
  const messageDay = messageDate.toDateString();
  const todayDay = today.toDateString();
  const yesterdayDay = yesterday.toDateString();

  if (messageDay === todayDay) {
    // Today - show time only
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (messageDay === yesterdayDay) {
    // Yesterday
    return "Yesterday";
  } else {
    // Other days - D/M/Y format
    return `${messageDate.getDate()}/${
      messageDate.getMonth() + 1
    }/${messageDate.getFullYear()}`;
  }
};

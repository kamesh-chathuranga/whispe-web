export function calculateTime(date: Date) {
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
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateSeparator(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
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
  const timeString = calculateTime(lastSeenDate);

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

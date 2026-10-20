export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount)}`;
}

function parseDateRobust(isoString) {
  if (!isoString) return null;
  if (isoString instanceof Date) return isoString;
  const str = String(isoString).trim();

  // If already has Z or offset (+05:30 / -05:00)
  if (str.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // If string is LocalDateTime from Spring Boot like "2026-10-20T02:40:00"
  // Append Indian Standard Time offset (+05:30) for 100% precision
  const d = new Date(`${str}+05:30`);
  if (!isNaN(d.getTime())) return d;

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function formatTime(isoString) {
  try {
    const date = parseDateRobust(isoString);
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function formatDate(isoString) {
  try {
    const date = parseDateRobust(isoString);
    if (!date) return '';
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function getISODateKey(isoString) {
  try {
    const date = parseDateRobust(isoString);
    if (!date) return '';
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch {
    return '';
  }
}

export function getTimeAgo(isoString) {
  try {
    const date = parseDateRobust(isoString);
    if (!date) return '';
    const now = Date.now();
    const timeMs = date.getTime();
    const diffSec = Math.floor((now - timeMs) / 1000);

    if (diffSec < 0 || diffSec < 20) return 'Just now (अभी)';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

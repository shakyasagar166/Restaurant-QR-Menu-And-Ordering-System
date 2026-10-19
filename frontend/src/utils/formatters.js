export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount)}`;
}

export function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function getTimeAgo(isoString) {
  if (!isoString) return '';
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch {
    return '';
  }
}

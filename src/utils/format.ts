export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown date';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'Today ' + now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const dateStr = date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (diffDays === 0) return 'Today ' + timeStr;
  if (diffDays === 1) return 'Yesterday ' + timeStr;

  return dateStr + ' ' + timeStr;
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

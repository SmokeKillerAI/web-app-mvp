export function formatDate(
  date: Date | string | number | undefined,
  format: 'date' | 'time' | 'datetime' | Intl.DateTimeFormatOptions = 'date'
) {
  if (!date) return '';

  try {
    let opts: Intl.DateTimeFormatOptions = {};

    if (typeof format === 'string') {
      switch (format) {
        case 'date':
          opts = {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          };
          break;
        case 'time':
          opts = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          };
          break;
        case 'datetime':
          opts = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          };
          break;
      }
    } else {
      opts = format;
    }

    return new Intl.DateTimeFormat('en-US', opts).format(new Date(date));
  } catch (_err) {
    return '';
  }
}

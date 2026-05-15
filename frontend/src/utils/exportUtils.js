/**
 * src/utils/exportUtils.js
 *
 * Utility for generating and downloading CSV files from JSON data.
 */

export const downloadCSV = (data, filename) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const value = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = ('' + value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const parseDDMMYYYY = (s) => {
  if (!s) return null;
  const parts = s
    .toString()
    .trim()
    .split(/[/\-. ]+/); // supports 26/08/2025 or 26-08-2025 etc.
  if (parts.length < 3) return null;
  const [dd, mm, yyOrYYYY] = parts;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10) - 1;
  let y = parseInt(yyOrYYYY, 10);
  if (y < 100) y += 2000; // handle two-digit years if any
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m, d);
};
export default parseDDMMYYYY;

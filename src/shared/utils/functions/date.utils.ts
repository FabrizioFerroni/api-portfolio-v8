export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end };
}

export function getPreviousWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = domingo

  // Lunes de la semana pasada
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek - 6);

  // Domingo de la semana pasada
  const end = new Date(now);
  end.setDate(now.getDate() - dayOfWeek);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getPreviousYearRange(): { start: string; end: string } {
  const prevYear = new Date().getFullYear() - 1;
  return {
    start: `${prevYear}-01-01`,
    end: `${prevYear}-12-31`,
  };
}

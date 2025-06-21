export const changePeriodTimeFormat = (
  selectedDateValue: string
): { startDate: string; endDate: string } => {
  const today: Date = new Date();
  const endDate = today
    .toLocaleDateString("to-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll(". ", "-")
    .slice(0, 10);

  if (selectedDateValue === "all") {
    const startDate = new Date("2020-01-01").toISOString().slice(0, 10);

    return { startDate, endDate };
  }

  if (selectedDateValue === "aDay") {
    const startDate = new Date((today as any) - 3600000 * 24 * 1)
      .toISOString()
      .slice(0, 10);
    return { startDate, endDate };
  }
  if (selectedDateValue === "threeDays") {
    const startDate = new Date((today as any) - 3600000 * 24 * 3)
      .toISOString()
      .slice(0, 10);
    return { startDate, endDate };
  }
  if (selectedDateValue === "fiveDays") {
    const startDate = new Date((today as any) - 3600000 * 24 * 5)
      .toISOString()
      .slice(0, 10);
    return { startDate, endDate };
  }
  if (selectedDateValue === "sixDays") {
    const startDate = new Date((today as any) - 3600000 * 24 * 6)
      .toISOString()
      .slice(0, 10);
    return { startDate, endDate };
  }
  if (selectedDateValue === "aWeek") {
    const startDate = new Date((today as any) - 3600000 * 24 * 7)
      .toISOString()
      .slice(0, 10);

    return { startDate, endDate };
  }
  if (selectedDateValue === "aMonth") {
    const startDate = new Date(today.setMonth(today.getMonth() - 1))
      .toISOString()
      .slice(0, 10);

    return { startDate, endDate };
  }
  if (selectedDateValue === "threeMonth") {
    const startDate = new Date(today.setMonth(today.getMonth() - 3))
      .toISOString()
      .slice(0, 10);

    return { startDate, endDate };
  }
  if (selectedDateValue === "sixMonth") {
    const startDate = new Date(today.setMonth(today.getMonth() - 6))
      .toISOString()
      .slice(0, 10);

    return { startDate, endDate };
  }
  if (selectedDateValue === "aYear") {
    let tempDate = new Date();
    const startDate = new Date(tempDate.setFullYear(today.getFullYear() - 1))
      .toISOString()
      .slice(0, 10);

    return { startDate, endDate };
  } else {
    const startDate = new Date().toISOString().slice(0, 10);

    return { startDate, endDate };
  }
};

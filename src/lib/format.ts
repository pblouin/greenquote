const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export const formatEur = (value: number) => eur.format(value);
export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
export const formatDate = (sqliteDate: string) => sqliteDate.slice(0, 10);

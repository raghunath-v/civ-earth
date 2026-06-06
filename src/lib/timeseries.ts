export type TimeSeries = [number, number | null][];
export type TimeseriesMap = Record<string, Record<string, TimeSeries>>;

let cache: TimeseriesMap | null = null;
let loading: Promise<TimeseriesMap> | null = null;

export async function getTimeseries(): Promise<TimeseriesMap> {
  if (cache) return cache;
  if (loading) return loading;
  loading = fetch('/data/timeseries.json')
    .then((r) => r.json())
    .then((data) => {
      cache = data as TimeseriesMap;
      loading = null;
      return cache;
    });
  return loading;
}

export function getSeriesForCountry(ts: TimeseriesMap, iso3: string, indicator: string): TimeSeries {
  return ts[iso3]?.[indicator] ?? [];
}

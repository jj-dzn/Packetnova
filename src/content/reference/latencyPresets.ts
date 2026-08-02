export interface LatencyPreset {
  id: string
  label: string
  distanceKm: number
}

// Approximate great-circle distances -- close enough to anchor the abstract
// km input in a place a visitor actually recognizes, not meant as
// survey-grade figures. Mixes recognizable city pairs with the specific
// cloud-region pairs an engineer estimating cross-region latency would
// actually be picking between.
export const latencyPresets: LatencyPreset[] = [
  { id: 'nyc-la', label: 'New York ↔ Los Angeles', distanceKm: 3940 },
  { id: 'nyc-london', label: 'New York ↔ London', distanceKm: 5570 },
  { id: 'nyc-tokyo', label: 'New York ↔ Tokyo', distanceKm: 10850 },
  { id: 'sf-singapore', label: 'San Francisco ↔ Singapore', distanceKm: 13590 },
  { id: 'sydney-london', label: 'Sydney ↔ London', distanceKm: 17000 },
  {
    id: 'aws-use1-euw1',
    label: 'AWS us-east-1 ↔ eu-west-1 (N. Virginia ↔ Ireland)',
    distanceKm: 5900,
  },
  {
    id: 'aws-usw2-apne1',
    label: 'AWS us-west-2 ↔ ap-northeast-1 (Oregon ↔ Tokyo)',
    distanceKm: 8000,
  },
  {
    id: 'aws-use1-apse1',
    label: 'AWS us-east-1 ↔ ap-southeast-1 (N. Virginia ↔ Singapore)',
    distanceKm: 15700,
  },
]

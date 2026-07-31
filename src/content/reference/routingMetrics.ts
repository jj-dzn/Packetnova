export interface MetricInfo {
  protocol: string
  metricType: string
  description: string
}

export const routingMetrics: MetricInfo[] = [
  {
    protocol: 'RIP',
    metricType: 'Hop count',
    description: 'Simple hop count, max 15 (16 = unreachable). Ignores bandwidth entirely.',
  },
  {
    protocol: 'OSPF',
    metricType: 'Cost',
    description:
      'Cost = reference bandwidth / interface bandwidth, summed along the path. Lower is better.',
  },
  {
    protocol: 'EIGRP',
    metricType: 'Composite (bandwidth + delay)',
    description:
      'Weighted formula combining the slowest bandwidth and cumulative delay along the path (K-values tunable).',
  },
  {
    protocol: 'IS-IS',
    metricType: 'Cost',
    description:
      'Cost assigned per interface, default 10 on most implementations regardless of bandwidth.',
  },
  {
    protocol: 'BGP',
    metricType: 'Not metric-based',
    description:
      'No single metric -- best path is chosen by a sequence of path attributes (see the BGP best path tool).',
  },
]

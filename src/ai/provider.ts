export interface AIRequest {
  task:
    | 'analyze-pcap'
    | 'explain-log'
    | 'review-firewall-config'
    | 'route-analysis'
    | 'analyze-har'
    | 'audit-config'
    | 'generate-tac-report'
  input: string | File
  context?: Record<string, unknown>
}

export interface AIResponse {
  summary: string
  details?: unknown
}

export interface AIProvider {
  isAvailable(): boolean
  analyze(request: AIRequest): Promise<AIResponse>
}

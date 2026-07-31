export interface HttpStatusEntry {
  code: number
  name: string
  description: string
}

// Per RFC 9110 and the IANA HTTP status code registry -- the most commonly
// encountered codes across each class, not the full registry.
export const httpStatusCodes: HttpStatusEntry[] = [
  { code: 100, name: 'Continue', description: 'Client should continue sending the request body' },
  {
    code: 101,
    name: 'Switching Protocols',
    description: 'Server is switching protocols (e.g. to WebSocket)',
  },
  { code: 200, name: 'OK', description: 'Request succeeded' },
  { code: 201, name: 'Created', description: 'Request succeeded and a new resource was created' },
  { code: 204, name: 'No Content', description: 'Request succeeded, no body to return' },
  {
    code: 301,
    name: 'Moved Permanently',
    description: 'Resource has permanently moved to a new URL',
  },
  { code: 302, name: 'Found', description: 'Resource is temporarily at a different URL' },
  {
    code: 304,
    name: 'Not Modified',
    description: 'Cached version is still valid, no body returned',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description: 'Like 302, but guarantees the method/body are preserved',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description: 'Like 301, but guarantees the method/body are preserved',
  },
  { code: 400, name: 'Bad Request', description: 'Request was malformed or invalid' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required (or has failed)' },
  {
    code: 403,
    name: 'Forbidden',
    description: 'Server understood the request but refuses to authorize it',
  },
  { code: 404, name: 'Not Found', description: "Resource doesn't exist at this URL" },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: "HTTP method isn't supported for this resource",
  },
  {
    code: 409,
    name: 'Conflict',
    description: 'Request conflicts with the current state of the resource',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'Client has sent too many requests (rate limited)',
  },
  { code: 500, name: 'Internal Server Error', description: 'Generic server-side failure' },
  { code: 502, name: 'Bad Gateway', description: 'Upstream server returned an invalid response' },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'Server is temporarily overloaded or down for maintenance',
  },
  { code: 504, name: 'Gateway Timeout', description: "Upstream server didn't respond in time" },
]

import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { CopyableTextarea } from '../CopyableTextarea'
import { Pill } from '../../../components/ui/Pill'
import {
  convertJsonToYaml,
  convertYamlToJson,
  formatYaml,
} from '../../../lib/calculations/yamlFormatter'

type Mode = 'format' | 'yaml-to-json' | 'json-to-yaml'

const DEFAULT_YAML = 'name: PacketNova\ntools: [subnet, cidr]\nfree: true\n'
const DEFAULT_JSON = JSON.stringify(
  { name: 'PacketNova', tools: ['subnet', 'cidr'], free: true },
  null,
  2,
)

// yq (the Go implementation, mikefarah/yq -- the standard these days,
// distinct from the older Python jq-wrapper of the same name) expressed
// per mode, using its -o/--output-format flag for the two conversions.
const YQ_CLI: Record<Mode, string> = {
  format: 'yq eval . input.yaml',
  'yaml-to-json': 'yq eval -o=json . input.yaml',
  'json-to-yaml': 'yq eval -P input.json',
}

export function YamlFormatterTool() {
  const [mode, setMode] = useState<Mode>('format')
  const [yamlInput, setYamlInput] = useState(DEFAULT_YAML)
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [showCli, setShowCli] = useState(false)

  function changeMode(next: Mode) {
    setMode(next)
  }

  // js-yaml's load/dump on a large pasted document is real work -- not
  // worth repeating on every render for reasons unrelated to the input
  // itself (e.g. the CLI-snippet toggle).
  const result = useMemo(() => {
    if (mode === 'format') return formatYaml(yamlInput)
    if (mode === 'yaml-to-json') return convertYamlToJson(yamlInput)
    return convertJsonToYaml(jsonInput)
  }, [mode, yamlInput, jsonInput])

  const isJsonInput = mode === 'json-to-yaml'

  return (
    <ToolPageLayout
      category="Utilities"
      title="YAML formatter"
      description="Format and validate YAML, or convert between YAML and JSON."
      status={result.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/json-formatter', label: 'JSON formatter' },
        { to: '/tools/xml-formatter', label: 'XML formatter' },
      ]}
      input={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Pill active={mode === 'format'} onClick={() => changeMode('format')}>
              Format YAML
            </Pill>
            <Pill active={mode === 'yaml-to-json'} onClick={() => changeMode('yaml-to-json')}>
              YAML → JSON
            </Pill>
            <Pill active={mode === 'json-to-yaml'} onClick={() => changeMode('json-to-yaml')}>
              JSON → YAML
            </Pill>
          </div>
          <textarea
            value={isJsonInput ? jsonInput : yamlInput}
            onChange={(e) =>
              isJsonInput ? setJsonInput(e.target.value) : setYamlInput(e.target.value)
            }
            rows={12}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        <div className="flex flex-col gap-4">
          {result.ok ? (
            <CopyableTextarea value={result.result} rows={12} />
          ) : (
            <p className="text-sm text-danger">{result.error}</p>
          )}
          <div>
            <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
              {showCli ? 'Hide' : 'Show'} yq equivalent (expert)
            </Pill>
            {showCli && (
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                {YQ_CLI[mode]}
              </pre>
            )}
          </div>
        </div>
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            YAML represents the same kind of data JSON does -- objects, arrays, strings, numbers,
            booleans -- but uses indentation and bare syntax instead of braces and quotes. Both the
            format and convert modes parse your input into that same underlying data first, then
            re-serialize it as either YAML or JSON, so conversion is lossless for anything both
            formats can represent.
          </p>
        }
        whenToUseThis={
          <p>
            YAML shows up constantly in infrastructure config -- Kubernetes manifests, CI pipeline
            definitions, Ansible playbooks, Docker Compose files. Converting to JSON is useful when
            a tool downstream only speaks JSON, or when YAML's significant whitespace is making a
            diff or a bug hard to spot and you want an unambiguous representation instead.
          </p>
        }
        commonMistakes={
          <p>
            YAML's bare (unquoted) boolean coercion is a well-known trap: unquoted{' '}
            <code className="font-mono">yes</code>, <code className="font-mono">no</code>,{' '}
            <code className="font-mono">on</code>, and <code className="font-mono">off</code> are
            all parsed as booleans in YAML 1.1, not strings -- famously breaking Norway's two-letter
            country code "NO" when left unquoted (the "Norway problem"). Quote any value that should
            stay a literal string. Mixing tabs and spaces for indentation is another common cause of
            parse failures, since YAML indentation must be consistent.
          </p>
        }
        troubleshootingTips={
          <p>
            If YAML fails to parse, check indentation consistency first -- a single misaligned line
            is the most common cause. If a value converts to a boolean or number when you expected a
            string, wrap it in quotes in the source YAML.
          </p>
        }
        relatedReading={
          <p>
            Just working with JSON directly?{' '}
            <Link to="/tools/json-formatter" className="text-accent hover:underline">
              JSON formatter
            </Link>{' '}
            handles pretty-printing and minifying without the YAML layer.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

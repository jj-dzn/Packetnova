import { useState } from 'react'
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

export function YamlFormatterTool() {
  const [mode, setMode] = useState<Mode>('format')
  const [yamlInput, setYamlInput] = useState(DEFAULT_YAML)
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)

  function changeMode(next: Mode) {
    setMode(next)
  }

  const result =
    mode === 'format'
      ? formatYaml(yamlInput)
      : mode === 'yaml-to-json'
        ? convertYamlToJson(yamlInput)
        : convertJsonToYaml(jsonInput)

  const isJsonInput = mode === 'json-to-yaml'

  return (
    <ToolPageLayout
      category="Utilities"
      title="YAML formatter"
      description="Format and validate YAML, or convert between YAML and JSON."
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
        result.ok ? (
          <CopyableTextarea value={result.result} rows={12} />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
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

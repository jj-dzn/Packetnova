import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { DiffPasteBoard } from './DiffPasteBoard'

const DEFAULT_BEFORE = 'subnet mask: 255.255.255.0\ngateway: 10.0.0.1\nvlan: 10\n'
const DEFAULT_AFTER = 'subnet mask: 255.255.255.128\ngateway: 10.0.0.1\nvlan: 20\n'

export function TextDiffViewer() {
  const [before, setBefore] = useState(DEFAULT_BEFORE)
  const [after, setAfter] = useState(DEFAULT_AFTER)

  return (
    <ToolPageLayout
      category="Utilities"
      title="Text diff viewer"
      description="Paste two versions of a text directly into the boxes below -- the differences highlight in place as you type, line-numbered and color-coded the way Notepad++'s Compare plugin or a merge tool shows them. Handy for diffing two router or switch config snapshots to see exactly what a change touched."
      fullWidth={
        <DiffPasteBoard
          before={before}
          after={after}
          onBeforeChange={setBefore}
          onAfterChange={setAfter}
        />
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Each box is directly typeable and pasteable from the moment the page loads -- no
            separate edit step. The line-numbered, color-coded comparison you see is rendered live
            underneath what you're typing, updating on every keystroke: a removed line tints red, an
            added line tints green, and a line that was edited in place tints amber with just the
            specific words that changed highlighted inside it, not the whole line.
          </p>
        }
        whenToUseThis={
          <p>
            A genuinely useful, on-theme case for a networking toolkit: pasting a device's "before"
            and "after" running-config snapshots to see exactly what a change touched, without
            manually scanning two long config dumps for what moved. It holds up well even on long
            snapshots -- both boxes keep their own line numbers and scroll together, and each box's
            text can be selected and copied entirely independently of the other one. It's equally
            useful for any other two versions of text you need to compare -- code, prose, structured
            data.
          </p>
        }
        commonMistakes={
          <p>
            Assuming a "changed" line was two unrelated edits (an old line removed, an unrelated new
            one added) instead of one -- the word-level highlighting inside a changed row is there
            specifically to show it's a single edit to one line, not two.
          </p>
        }
        troubleshootingTips={
          <p>
            If two lines that look identical still show as changed, check for invisible differences
            -- trailing whitespace, different line-ending characters, or a stray tab where you
            expect a space. Those are byte-different even when they render the same on screen.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

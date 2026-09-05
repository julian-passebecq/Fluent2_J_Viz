import { useState } from 'react';
import { JsonSpecEditor } from '@datapass/code';
import { parseStory, type StorySpec } from '../core/spec.js';
export function SpecEditor({ story, apply }: { story: StorySpec; apply: (story: StorySpec) => void }) {
  const [draft, setDraft] = useState(JSON.stringify(story, null, 2));
  const [error, setError] = useState('');
  function validate() {
    try {
      const parsed = parseStory(JSON.parse(draft));
      setError('');
      apply(parsed);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }
  return (
    <div className="spec-editor">
      <p className="eyebrow">Canonical StorySpec · JSON</p>
      <p>Edit the data, encodings or narrative, then validate and apply.</p>
      <JsonSpecEditor
        ariaLabel="Canonical StorySpec · JSON"
        value={draft}
        onChange={setDraft}
        height="420px"
        options={{ wordWrap: 'on', minimap: { enabled: false }, accessibilitySupport: 'on' }}
        diagnostics={error ? [{ severity: 'error', message: error }] : []}
      />
      <button className="button primary" onClick={validate}>
        Validate & apply
      </button>
      <button
        className="text-button"
        onClick={() => {
          setDraft(JSON.stringify(story, null, 2));
          setError('');
        }}
      >
        Revert draft
      </button>
      {error && (
        <pre id="spec-error" className="spec-error" role="alert">
          {error}
        </pre>
      )}
    </div>
  );
}

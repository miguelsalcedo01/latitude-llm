'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'

import { CompileError } from 'promptl-ai'
import { MarkerSeverity, type editor } from 'monaco-editor'

import {
  AppLocalStorage,
  useLocalStorage,
} from '../../../../lib/hooks/useLocalStorage'
import { cn } from '../../../../lib/utils'
import { Button, Icon, Text } from '../../../atoms'
import { type DocumentError, type DocumentTextEditorProps } from '../types'
import { CopilotSection } from './CopilotSection'
import { MonacoDiffEditor } from './DiffEditor'
import { RegularMonacoEditor } from './RegularEditor'

export function DocumentTextEditor({
  value,
  path,
  metadata,
  onChange,
  readOnlyMessage,
  isSaved,
  actionButtons,
  diff,
  copilot,
}: DocumentTextEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null)

  const { value: showCopilot } = useLocalStorage({
    key: AppLocalStorage.editorCopilot,
    defaultValue: true,
  })

  const [editorLines, setEditorLines] = useState(value.split('\n').length)

  const focusNextError = useCallback(() => {
    if (!editorRef.current) return
    const editor = editorRef.current
    editor.trigger('anystring', 'editor.action.marker.next', '')
  }, [])

  const errorMarkers = useMemo<DocumentError[]>(
    () =>
      metadata?.errors.map((error: CompileError) => {
        return {
          startLineNumber: error.start?.line ?? 0,
          startColumn: error.start?.column ?? 0,
          endLineNumber: error.end ? error.end.line : (error.start?.line ?? 0),
          endColumn: error.end ? error.end.column : (error.start?.column ?? 0),
          message: error.message,
          severity: MarkerSeverity.Error,
        }
      }) ?? [],
    [metadata?.errors],
  )

  const handleValueChange = useCallback(
    (value: string | undefined) => {
      setEditorLines(value?.split('\n').length ?? 0)
      onChange?.(value ?? '')
    },
    [onChange],
  )

  const handleAcceptDiff = useCallback(() => {
    if (!diff) return
    if (!diffEditorRef.current) return

    const newValue = diffEditorRef.current.getModifiedEditor().getValue()
    diff.onAccept(newValue)
  }, [diff])

  const handleRejectDiff = useCallback(() => {
    if (!diff) return
    if (!diffEditorRef.current) return

    diff.onReject()
  }, [diff])

  const errorFixFn = useMemo(() => {
    if (!copilot) return undefined

    return (errors: DocumentError[]) => {
      const request =
        'Please, fix the following errors from the prompt:\n' +
        errors.map((error) => ` - ${JSON.stringify(error)}`).join('\n')

      return copilot.requestSuggestion(request)
    }
  }, [copilot])

  return (
    <div className='relative h-full rounded-lg border border-border overflow-hidden flex flex-col bg-secondary'>
      {!!readOnlyMessage && (
        <div className='flex flex-row w-full items-center justify-center px-2 gap-2 py-2'>
          <Icon name='lock' color='foregroundMuted' />
          <Text.H6 color='foregroundMuted'>
            Version published. {readOnlyMessage}
          </Text.H6>
        </div>
      )}
      {diff ? (
        <MonacoDiffEditor
          editorRef={diffEditorRef}
          oldValue={value}
          newValue={diff.newValue}
        />
      ) : (
        <RegularMonacoEditor
          editorRef={editorRef}
          value={value}
          path={path}
          readOnlyMessage={
            readOnlyMessage ||
            (copilot?.isLoading ? 'Copilot is thinking...' : undefined)
          }
          className={cn('w-full h-full flex', {
            'animate-pulse': copilot?.isLoading,
          })}
          onChange={handleValueChange}
          errorMarkers={errorMarkers}
          errorFixFn={errorFixFn}
        />
      )}
      {diff && (
        <div className='flex w-full px-2'>
          <div className='flex flex-col w-full items-center gap-2 bg-background border border-border rounded-md p-2'>
            {diff.description && (
              <div className='w-full max-h-24 overflow-y-auto custom-scrollbar px-2'>
                <Text.H5 color='foregroundMuted'>{diff.description}</Text.H5>
              </div>
            )}
            <div className='flex flex-row gap-2 w-full justify-end'>
              <Button variant='outline' fancy onClick={handleRejectDiff}>
                Discard
              </Button>
              <Button onClick={handleAcceptDiff} fancy>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
      {showCopilot && !readOnlyMessage && !diff && copilot && (
        <CopilotSection
          isLoading={copilot.isLoading}
          requestSuggestion={copilot.requestSuggestion}
          disabledMessage={copilot.disabledMessage}
        />
      )}
      <div className='flex flex-row w-full p-2 items-center justify-between gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <div className='flex flex-row items-center gap-2 px-2 py-1 bg-background border border-border rounded-md'>
            <Text.H6 color='foregroundMuted'>{editorLines} lines</Text.H6>
          </div>
          {!diff && !readOnlyMessage && isSaved !== undefined && (
            <div className='flex flex-row items-center gap-2 px-2 py-1 bg-background border border-border rounded-md'>
              {isSaved ? (
                <>
                  <Text.H6 color='foregroundMuted'>Saved</Text.H6>
                  <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
                </>
              ) : (
                <>
                  <Text.H6 color='foregroundMuted'>Saving...</Text.H6>
                  <LoaderCircle className='h-4 w-4 text-muted-foreground animate-spin' />
                </>
              )}
            </div>
          )}
          {!diff && (metadata?.errors.length ?? 0) > 0 && (
            <Button
              variant='outline'
              onClick={focusNextError}
              size='small'
              className='flex flex-row items-center gap-2 bg-background hover:border-destructive'
            >
              <Text.H6 color='destructive'>
                {metadata!.errors.length} errors
              </Text.H6>
              <AlertCircle className='h-4 w-4 text-destructive' />
            </Button>
          )}
        </div>
        <div className='flex flex-row items-center gap-2'>{actionButtons}</div>
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import { FilePlus, FolderPlus, Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { readFilesToDocuments, type DocumentDraft } from '../lib/read-files'

interface DocumentDropzoneProps {
  onAdd: (drafts: DocumentDraft[]) => void
  disabled?: boolean
}

export function DocumentDropzone({ onAdd, disabled = false }: DocumentDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [reading, setReading] = useState(false)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setReading(true)
    try {
      const { drafts, skipped } = await readFilesToDocuments(Array.from(fileList))
      if (drafts.length > 0) {
        onAdd(drafts)
        toast.success(`${drafts.length}개 문서 추가됨`)
      }
      if (skipped.length > 0) {
        toast.warning(`${skipped.length}개 파일 건너뜀`, {
          description: skipped
            .slice(0, 3)
            .map((s) => `${s.name} — ${s.reason}`)
            .join('\n'),
        })
      }
      if (drafts.length === 0 && skipped.length === 0) {
        toast.error('읽을 수 있는 파일이 없습니다')
      }
    } finally {
      setReading(false)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return
    setDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFilePicker = () => fileInputRef.current?.click()
  const openFolderPicker = () => folderInputRef.current?.click()

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEnd={onDragLeave}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-card px-6 py-10 text-center transition-colors',
        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full bg-muted',
          dragOver && 'bg-primary/10 text-primary',
        )}
      >
        {reading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">
          {reading
            ? '파일을 읽는 중...'
            : dragOver
              ? '여기에 놓아 업로드'
              : '파일을 드래그하거나 아래 버튼을 사용하세요'}
        </p>
        <p className="text-xs text-muted-foreground">
          텍스트 파일만 지원 (.txt, .md, .json, .csv, .log, .html, .yaml, .eml 등 · 최대 5MB)
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={openFilePicker} disabled={reading}>
          <FilePlus className="mr-1 h-4 w-4" />
          파일 추가
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={openFolderPicker} disabled={reading}>
          <FolderPlus className="mr-1 h-4 w-4" />
          폴더 선택
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.markdown,.json,.csv,.tsv,.log,.html,.htm,.xml,.yaml,.yml,.eml,.srt,.vtt,text/*,application/json,application/xml"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error non-standard but widely supported
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

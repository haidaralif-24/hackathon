import { useState } from "react"
import { FolderOpen } from "lucide-react"

interface DrivePickerProps {
  onFolderSelected: (folderId: string, folderName: string) => void
}

function extractFolderId(input: string): string | null {
  const match = input.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  if (/^[a-zA-Z0-9_-]{10,}$/.test(input.trim())) return input.trim()
  return null
}

const DEMO_FOLDER = "https://drive.google.com/drive/folders/1D--1BDi9JLq81RtzzfuVW9V-hnuTn9Uk"

export default function DrivePicker({ onFolderSelected }: DrivePickerProps) {
  const [value, setValue] = useState(DEMO_FOLDER)

  const handleSubmit = () => {
    const id = extractFolderId(value)
    if (id) {
      onFolderSelected(id, value.slice(0, 40))
      setValue(DEMO_FOLDER)
    }
  }

  return (
    <div className="space-y-2 w-full max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={DEMO_FOLDER}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!extractFolderId(value)}
          className="px-4 py-2 text-sm font-medium bg-[#2F6FED] text-white rounded-lg hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          Connect
        </button>
      </div>
      <p className="text-[11px] text-amber-600 flex items-center gap-1">
        ⚠ Demo mode — Google Drive verification pending. Sync uses sample health data.
      </p>
    </div>
  )
}

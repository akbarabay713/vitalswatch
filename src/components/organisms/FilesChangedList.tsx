import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { FileChangeRow } from '@/components/molecules/FileChangeRow'
import type { CommitData } from '@/data/types'

interface FilesChangedListProps {
  commit: CommitData
}

export const FilesChangedList = ({ commit }: FilesChangedListProps) => {
  const totalAdd = commit.filesChanged.reduce((s, f) => s + f.additions, 0)
  const totalDel = commit.filesChanged.reduce((s, f) => s + f.deletions, 0)

  return (
    <Card padding="lg" className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Code changes</CardTitle>
          <CardDescription>
            {commit.filesChanged.length} files ·{' '}
            <span className="text-good">+{totalAdd}</span>{' '}
            <span className="text-poor">−{totalDel}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <div className="divide-y divide-border">
        {commit.filesChanged.map((file) => (
          <FileChangeRow key={file.path} file={file} />
        ))}
      </div>
    </Card>
  )
}

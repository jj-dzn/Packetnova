export interface TransferSizePreset {
  id: string
  label: string
  sizeMB: number
}

// Recognizable real-world file sizes to anchor the abstract MB input --
// order of magnitude matters far more here than exact precision, since
// actual file sizes vary a lot within each category.
export const transferSizePresets: TransferSizePreset[] = [
  { id: 'os-update', label: 'OS update (~500 MB)', sizeMB: 500 },
  { id: 'photo-album', label: 'Phone photo backup, ~500 photos (~2 GB)', sizeMB: 2000 },
  { id: 'linux-iso', label: 'Linux ISO, e.g. Ubuntu (~5.5 GB)', sizeMB: 5500 },
  { id: '4k-movie', label: '4K movie (~25 GB)', sizeMB: 25000 },
  { id: 'db-backup', label: 'Database backup (~250 GB)', sizeMB: 250000 },
]

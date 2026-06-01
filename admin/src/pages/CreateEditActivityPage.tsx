import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode, SyntheticEvent } from 'react'

import './CreateEditActivityPage.css'

import type { Category, Duration, EnergyLevel, Environment, Setup } from '../types/activity'

const CATEGORY_OPTIONS: Category[] = [
  'Opener',
  'Icebreaker',
  'Active',
  'Debrief',
  'Connection',
  'Team Challenge',
]

const GRADE_OPTIONS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const DURATION_OPTIONS: Duration[] = ['5-15 min', '15-30 min', '30+ min']
const ENERGY_OPTIONS: EnergyLevel[] = ['Low', 'Medium', 'High']
const ENVIRONMENT_OPTIONS: Exclude<Environment, 'Any Environment'>[] = [
  'Blacktop',
  'Field',
  'Classroom',
  'Gym/MPR',
]
const SETUP_OPTIONS: Setup[] = ['None', 'Required']
const YOUTUBE_VIDEO_ID_PATTERN = /^[\w-]{11}$/

type YoutubeThumbnailStatus = 'idle' | 'checking' | 'ready' | 'error'

type FormState = {
  title: string
  overview: string
  categories: Category[]
  gradeMin: string
  gradeMax: string
  groupSizeMin: string
  groupSizeMax: string
  anyGroupSize: boolean
  duration: Duration | null
  energyLevel: EnergyLevel | null
  environments: Exclude<Environment, 'Any Environment'>[]
  anyEnvironment: boolean
  setup: Setup | null
  videoUrl: string
  videoThumbnailUrl: string | null
  videoThumbnailStatus: YoutubeThumbnailStatus
  videoThumbnailError: string | null
  thumbnailFile: File | null
  thumbnailPreviewUrl: string | null
}

const createDefaultState = (): FormState => ({
  title: '',
  overview: '',
  categories: [],
  gradeMin: 'K',
  gradeMax: '6',
  groupSizeMin: '',
  groupSizeMax: '',
  anyGroupSize: false,
  duration: null,
  energyLevel: null,
  environments: [],
  anyEnvironment: false,
  setup: null,
  videoUrl: '',
  videoThumbnailUrl: null,
  videoThumbnailStatus: 'idle',
  videoThumbnailError: null,
  thumbnailFile: null,
  thumbnailPreviewUrl: null,
})

const getYoutubeVideoId = (value: string) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return null

  try {
    const url = new URL(trimmedValue)
    const hostname = url.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : null
    }

    if (
      hostname !== 'youtube.com' &&
      hostname !== 'm.youtube.com' &&
      hostname !== 'youtube-nocookie.com'
    ) {
      return null
    }

    const watchId = url.searchParams.get('v')
    if (watchId && YOUTUBE_VIDEO_ID_PATTERN.test(watchId)) return watchId

    const [pathKind, pathId] = url.pathname.split('/').filter(Boolean)
    if (
      ['embed', 'shorts', 'live'].includes(pathKind) &&
      pathId &&
      YOUTUBE_VIDEO_ID_PATTERN.test(pathId)
    ) {
      return pathId
    }
  } catch {
    return null
  }

  return null
}

const getYoutubeThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

type SectionProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="activity-section-card">
      <button
        type="button"
        className="activity-section-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`activity-section-arrow ${isOpen ? 'activity-section-arrow-open' : ''}`}>▼</span>
      </button>
      {isOpen ? <div className="activity-section-body">{children}</div> : null}
    </section>
  )
}

type ChoiceChipProps = {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ChoiceChip({ active, disabled = false, onClick, children }: ChoiceChipProps) {
  return (
    <button
      type="button"
      className={`activity-chip ${active ? 'activity-chip-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function CreateEditActivityPage() {
  const [form, setForm] = useState<FormState>(() => createDefaultState())

  useEffect(() => {
    return () => {
      if (form.thumbnailPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(form.thumbnailPreviewUrl)
      }
    }
  }, [form.thumbnailPreviewUrl])

  const summary = useMemo(
    () => ({
      categories: form.categories.join(', ') || 'None selected',
      grade: `${form.gradeMin} - ${form.gradeMax}`,
      groupSize: form.anyGroupSize
        ? 'Any group size'
        : `${form.groupSizeMin || '-'} - ${form.groupSizeMax || '-'}`,
      environments: form.anyEnvironment
        ? 'Any environment'
        : form.environments.join(', ') || 'None selected',
    }),
    [form],
  )

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleThumbnailFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    setForm((current) => {
      if (current.thumbnailPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(current.thumbnailPreviewUrl)
      }

      return {
        ...current,
        thumbnailFile: nextFile,
        thumbnailPreviewUrl: nextFile ? URL.createObjectURL(nextFile) : null,
      }
    })
  }

  const handleVideoUrlChange = (value: string) => {
    setForm((current) => ({
      ...current,
      videoUrl: value,
      videoThumbnailUrl: null,
      videoThumbnailStatus: 'idle',
      videoThumbnailError: null,
    }))
  }

  const handleExtractThumbnail = () => {
    const videoId = getYoutubeVideoId(form.videoUrl)

    if (!videoId) {
      setForm((current) => ({
        ...current,
        videoThumbnailUrl: null,
        videoThumbnailStatus: 'error',
        videoThumbnailError: 'Enter a valid YouTube URL.',
      }))
      return
    }

    setForm((current) => ({
      ...current,
      videoUrl: current.videoUrl.trim(),
      videoThumbnailUrl: getYoutubeThumbnailUrl(videoId),
      videoThumbnailStatus: 'checking',
      videoThumbnailError: null,
    }))
  }

  const handleThumbnailImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (image.naturalWidth <= 120 && image.naturalHeight <= 90) {
      setForm((current) => ({
        ...current,
        videoThumbnailUrl: null,
        videoThumbnailStatus: 'error',
        videoThumbnailError: 'Unable to find a usable thumbnail for this YouTube URL.',
      }))
      return
    }

    setForm((current) => ({
      ...current,
      videoThumbnailStatus: 'ready',
      videoThumbnailError: null,
    }))
  }

  const handleThumbnailImageError = () => {
    setForm((current) => ({
      ...current,
      videoThumbnailUrl: null,
      videoThumbnailStatus: 'error',
      videoThumbnailError: 'Unable to load a thumbnail for this YouTube URL.',
    }))
  }

  const toggleCategory = (category: Category) => {
    setForm((current) => {
      const isSelected = current.categories.includes(category)
      if (isSelected) {
        return { ...current, categories: current.categories.filter((item) => item !== category) }
      }
      if (current.categories.length >= 3) return current
      return { ...current, categories: [...current.categories, category] }
    })
  }

  const toggleEnvironment = (environment: Exclude<Environment, 'Any Environment'>) => {
    setForm((current) => {
      const isSelected = current.environments.includes(environment)
      return {
        ...current,
        environments: isSelected
          ? current.environments.filter((item) => item !== environment)
          : [...current.environments, environment],
      }
    })
  }

  return (
    <main className="activity-page">
      <header className="activity-page-hero">
        <div>
          <p className="activity-page-eyebrow">Activities</p>
          <h1>Create / Edit Activity</h1>
          <p className="activity-page-copy">
            This screen is now part of the real `admin/` app, but it lives on its own route instead of
            replacing the home page.
          </p>
        </div>
        <aside className="activity-summary-card">
          <h2>Current Summary</h2>
          <p><strong>Categories:</strong> {summary.categories}</p>
          <p><strong>Grades:</strong> {summary.grade}</p>
          <p><strong>Group Size:</strong> {summary.groupSize}</p>
          <p><strong>Environment:</strong> {summary.environments}</p>
        </aside>
      </header>

      <CollapsibleSection title="Overview" defaultOpen>
        <div className="activity-field-stack">
          <div className="activity-field-group">
            <label className="activity-field-label" htmlFor="thumbnail-upload">Thumbnail</label>
            <div className="activity-thumbnail-panel">
              <label className="activity-upload-card" htmlFor="thumbnail-upload">
                {form.thumbnailPreviewUrl ? (
                  <img
                    src={form.thumbnailPreviewUrl}
                    alt="Selected thumbnail preview"
                    className="activity-upload-preview"
                  />
                ) : (
                  <span className="activity-upload-plus">+</span>
                )}
                <span className="activity-upload-title">Upload cover image</span>
                <span className="activity-upload-copy">Upload an image to use as the activity cover.</span>
                <span className="activity-upload-button">Choose Image</span>
                <span className="activity-upload-meta">
                  {form.thumbnailFile ? `Image selected: ${form.thumbnailFile.name}` : 'No image selected'}
                </span>
                <span className="activity-upload-meta">Supported formats: JPG, JPEG, PNG, HEIC, HEIF, WEBP</span>
                <span className="activity-upload-meta">Max size: 10 MB</span>
              </label>
              <input
                id="thumbnail-upload"
                className="activity-sr-only"
                type="file"
                accept=".jpg,.jpeg,.png,.heic,.heif,.webp,image/jpeg,image/png,image/heic,image/heif,image/webp"
                onChange={handleThumbnailFileChange}
              />
            </div>
          </div>

          <div className="activity-field-group">
            <label className="activity-field-label" htmlFor="video-url">YouTube Video URL</label>
            <div className="activity-inline-inputs">
              <input
                id="video-url"
                className="activity-text-input"
                value={form.videoUrl}
                onChange={(event) => handleVideoUrlChange(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <button type="button" className="activity-primary-button" onClick={handleExtractThumbnail}>
                {form.videoThumbnailStatus === 'ready' ? 'Refresh Thumbnail' : 'Extract Thumbnail'}
              </button>
            </div>
            {form.videoThumbnailError ? <p className="activity-error-text">{form.videoThumbnailError}</p> : null}
            {form.videoThumbnailUrl ? (
              <div className="activity-youtube-preview">
                <img
                  src={form.videoThumbnailUrl}
                  alt="Extracted YouTube thumbnail"
                  onLoad={handleThumbnailImageLoad}
                  onError={handleThumbnailImageError}
                />
                <span>
                  {form.videoThumbnailStatus === 'checking' ? 'Checking thumbnail...' : 'Extracted thumbnail'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="activity-field-group">
            <label className="activity-field-label" htmlFor="title">Activity Title</label>
            <input
              id="title"
              className="activity-text-input"
              value={form.title}
              maxLength={40}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Enter activity title"
            />
            <p className="activity-support-text">{form.title.length}/40 characters</p>
          </div>

          <div className="activity-field-group">
            <label className="activity-field-label" htmlFor="overview">Overview</label>
            <textarea
              id="overview"
              className="activity-text-area"
              value={form.overview}
              onChange={(event) => setField('overview', event.target.value)}
              placeholder="Write a short overview for the activity"
              rows={5}
            />
          </div>

          <div className="activity-field-group">
            <p className="activity-field-label">
              Category <span className="activity-field-label-light">(Select up to three)</span>
            </p>
            <div className="activity-chip-grid">
              {CATEGORY_OPTIONS.map((category) => (
                <ChoiceChip
                  key={category}
                  active={form.categories.includes(category)}
                  disabled={!form.categories.includes(category) && form.categories.length >= 3}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </ChoiceChip>
              ))}
            </div>
          </div>

          <div className="activity-two-column-grid">
            <div className="activity-field-group">
              <label className="activity-field-label" htmlFor="grade-min">Grade</label>
              <div className="activity-inline-inputs activity-inline-inputs-slim">
                <select
                  id="grade-min"
                  className="activity-select-input"
                  value={form.gradeMin}
                  onChange={(event) => setField('gradeMin', event.target.value)}
                >
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={`min-${grade}`} value={grade}>{grade}</option>
                  ))}
                </select>
                <span className="activity-range-separator">to</span>
                <select
                  className="activity-select-input"
                  value={form.gradeMax}
                  onChange={(event) => setField('gradeMax', event.target.value)}
                >
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={`max-${grade}`} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">Setup</p>
              <div className="activity-chip-grid">
                {SETUP_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.setup === option}
                    onClick={() => setField('setup', option)}
                  >
                    {option === 'None' ? 'No Props' : 'Props'}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          </div>

          <div className="activity-two-column-grid">
            <div className="activity-field-group">
              <p className="activity-field-label">Group Size</p>
              <label className="activity-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.anyGroupSize}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setForm((current) => ({
                      ...current,
                      anyGroupSize: checked,
                      groupSizeMin: checked ? '' : current.groupSizeMin,
                      groupSizeMax: checked ? '' : current.groupSizeMax,
                    }))
                  }}
                />
                <span>Any group size</span>
              </label>
              <div className="activity-inline-inputs activity-inline-inputs-slim">
                <input
                  className="activity-text-input"
                  inputMode="numeric"
                  value={form.groupSizeMin}
                  disabled={form.anyGroupSize}
                  onChange={(event) => setField('groupSizeMin', event.target.value)}
                  placeholder="Min"
                />
                <span className="activity-range-separator">to</span>
                <input
                  className="activity-text-input"
                  inputMode="numeric"
                  value={form.groupSizeMax}
                  disabled={form.anyGroupSize}
                  onChange={(event) => setField('groupSizeMax', event.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">Duration</p>
              <div className="activity-chip-grid">
                {DURATION_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.duration === option}
                    onClick={() => setField('duration', option)}
                  >
                    {option}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          </div>

          <div className="activity-two-column-grid">
            <div className="activity-field-group">
              <p className="activity-field-label">Energy Level</p>
              <div className="activity-chip-grid">
                {ENERGY_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.energyLevel === option}
                    onClick={() => setField('energyLevel', option)}
                  >
                    {option}
                  </ChoiceChip>
                ))}
              </div>
            </div>

            <div className="activity-field-group">
              <p className="activity-field-label">Environment</p>
              <label className="activity-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.anyEnvironment}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setForm((current) => ({
                      ...current,
                      anyEnvironment: checked,
                      environments: checked ? [] : current.environments,
                    }))
                  }}
                />
                <span>Any environment</span>
              </label>
              <div className="activity-chip-grid">
                {ENVIRONMENT_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    active={form.environments.includes(option)}
                    disabled={form.anyEnvironment}
                    onClick={() => toggleEnvironment(option)}
                  >
                    {option}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </main>
  )
}

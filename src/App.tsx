import { useEffect, useState } from 'react'
import { Chords } from './pages/Chords'
import { Explore } from './pages/Explore'
import { Jam } from './pages/Jam'
import { LessonView } from './pages/LessonView'
import { Home, Lessons, Practice, Progress, Transcribe } from './pages/Pages'
import { useProfile, useStore } from './store/store'

const NAV = [
  ['', 'Home'],
  ['lessons', 'Lessons'],
  ['practice', 'Practice'],
  ['explore', 'Explore'],
  ['chords', 'Chords'],
  ['jam', 'Jam'],
  ['transcribe', 'Tabs from audio'],
  ['progress', 'Progress'],
] as const

function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const [page, arg] = useRoute()
  const state = useStore()
  const profile = useProfile()

  useEffect(() => {
    if (state.theme === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = state.theme
  }, [state.theme])

  const active = page === 'lesson' ? 'lessons' : page
  return (
    <>
      <header className="top">
        <a className="brand" href="#/">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="17" cy="16" r="3" fill="currentColor" />
          </svg>
          Music Coach
        </a>
        <nav aria-label="Main">
          {NAV.map(([path, label]) => (
            <a key={path} href={`#/${path}`} className={active === path ? 'on' : ''}>
              {label}
            </a>
          ))}
        </nav>
        <a className="who" href="#/progress" title="Players and settings">
          {profile.name}
        </a>
      </header>
      <main key={profile.id}>
        {page === '' && <Home />}
        {page === 'lessons' && <Lessons trackId={arg} />}
        {page === 'lesson' && <LessonView key={arg} id={arg} />}
        {page === 'practice' && <Practice exerciseId={arg} />}
        {page === 'explore' && <Explore />}
        {page === 'chords' && <Chords />}
        {page === 'jam' && <Jam />}
        {page === 'transcribe' && <Transcribe />}
        {page === 'progress' && <Progress />}
      </main>
    </>
  )
}

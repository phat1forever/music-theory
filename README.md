# Music Coach

A browser app for learning music theory, guitar and keyboard: structured lessons, practice with
feedback, and tools for exploring scales and chords on the fretboard, the keyboard and the staff.

## What is in it

- **Lessons** in three tracks (56 lessons): music theory, guitar (first notes through to a full
  12-bar solo) and keyboard (finger numbers through to playing hands together). Each lesson has a
  goal, explanations with diagrams, something to play and a quick check. An optional placement
  check lets you skip what you already know.
- **Practice**: every exercise is shown as sheet music with guitar tab or a grand staff, plus a
  fretboard or keyboard diagram of what to play. Listen to it, step through it note by note, or
  play in time with a metronome. Playing is checked by microphone, MIDI keyboard, or yourself.
  Passed exercises come back for review at a higher tempo.
  Pieces can show key signatures, ties, 3/4 time and chord symbols; you can practise one hand or a
  range of bars on a loop, with swing feel and backing chords where the piece calls for them.
- **Explore**: any scale or chord in any key on the fretboard, keyboard, staff and tab, with the
  chords of the key, the circle of fifths, an interval ear trainer and a tuner.
- **Chords**: build a chord sheet for a song. Pick chords, put them in your own order, and set the
  tuning (presets or per string) and capo; shapes are worked out for that setup.
  A key finder names the likely key, labels each chord with its Roman numeral and suggests scales
  to solo with; a chord identifier names any shape you tap out on the fretboard.
- **Jam**: a looping backing track in ten styles with the scale shown on the neck and the current
  chord's notes highlighted.
- Several players can keep separate progress. Everything is saved in the browser (localStorage).

Not built yet: turning an audio recording into tab (the "Tabs from audio" page describes the plan).

## Run it

```bash
npm install
```

```bash
npm run dev
```

Other commands: `npm test` (unit tests), `npm run build` (production build in `dist/`).

The microphone needs a secure page (https or localhost). MIDI input works in Chrome and Edge.

## Layout

```
src/
  theory/      notes, scales, chords, fretboard mapping, chord-shape finder, note-sequence notation
  curriculum/  lesson content for the three tracks
  components/  Fretboard, Keyboard, Score (VexFlow), chord diagram, circle of fifths, tuner
  practice/    exercise runner and grading
  audio/       sound and timing (Tone.js)
  input/       microphone pitch detection (pitchy) and MIDI
  pages/       Home, Lessons, Lesson, Practice, Explore, Chords, Jam, Progress
  store/       saved progress and settings
```

# Future ideas

One place for things the app could do next. Add new ideas under the section they fit, one line
each with a short reason. When an idea is built, delete it from here.

## Highest impact (from the teacher reviews)

Three Opus reviewers (a guitar teacher, a piano teacher and a course designer) read the app as a
curriculum. Their shared verdict: it is accurate, friendly and well paced for the first weeks, and
today delivers a solid **late beginner** (a strong lead guitarist with thin rhythm playing; a
pianist at roughly a first grade). What is missing to reach **intermediate and beyond**, in order:

1. **A song and repertoire library.** The biggest motivation gap. Public-domain and traditional
   songs as chord charts with lyric lines (guitar) and graded pieces (keyboard), unlocked by the
   skills they need, played through the same practice runner. A song should be the reward at the
   end of every unit.
2. **A stage after the tracks.** Both tracks end with advice only.
   - Keyboard: a "first classics" unit (harmonic minor, minor keys, public-domain pieces such as the
     Minuet in G, Clementi and Kuhlau sonatinas, Burgmüller). Needs pickup bars, 2/4 and 6/8, and
     sixteenth notes in the notation engine.
   - Guitar: a "beyond" unit (the whole-neck pentatonic, CAGED triads, a slow blues in 12/8, a
     minor blues, transcribing a solo).
3. **Guitar rhythm and chord depth.**
   - Split barre chords into three or four lessons (partial barres such as Fmaj7 and a small F; the
     E shape moved along the neck, with m, 7 and m7 forms; the A shape).
   - Fingerpicking: arpeggios, then Travis picking. Palm muting. More strumming variety.
   - The major scale across the neck, and playing a tune by ear.
4. **An ear-training track.** Persist interval-trainer results and feed them into review. Add chord
   quality, scale and mode recognition, harmonic and descending intervals, and rhythm dictation.
5. **Session tooling and a sense of progress.** Session timer, practice log (minutes per day,
   calendar), notes, milestones ("first song", "first barre chord"), a "then and now" recording.
   Retire mastered items from review and cap the due queue.
6. **Theory that is generative and just in time.** Quiz items built from random keys with the
   existing theory engine (spell E♭ major, name the IV chord in A, build a B♭ triad). More lessons:
   inversions and slash chords, cadences and harmonic function, 6/8 and syncopation, Nashville
   numbers and transposition, borrowed chords (♭VII, ♭VI), and form (verse, chorus, 12-bar).
7. **Use more of what a MIDI keyboard sends.** Today only note-on is read. Note-off would check
   held notes and ties and tell legato from staccato; velocity would check balance and dynamics; the
   sustain-pedal controller (CC 64) would check pedal timing.
8. **Notation for touch and expression**: dynamics, slurs, staccato and accents, repeat signs,
   pickup bars, 2/4 and 6/8, sixteenths and triplets.

## Lessons and content

- **Keyboard**
  - Harmonic minor scales hands together, and more keys (D, B♭, E minor); a chromatic scale.
  - Pieces where both hands move independently for a whole piece; finger crossings and extensions
    inside melodies.
  - A repertoire lesson between each new concept (every lesson has about one piece today).
  - Touch lessons: legato, staccato, loud and soft (needs the notation and MIDI work above).
  - Alberti bass by name, and more chord types at the keyboard (sus, 7ths with voice-leading).
  - A keyboard-first Jam with left-hand comping patterns.
- **Guitar**
  - Mixing major and minor pentatonic over a blues, with the ♭3 to 3 move.
  - Arpeggio shapes inside the pentatonic boxes (targeting 3rds, not only roots).
  - More solo studies: a slow blues, a minor blues, a study in boxes 2 to 5, one in another key.
  - Bend variations: bend and release, unison bends, double stops.
  - Turnaround licks and call-and-response drills; variations on the shuffle rhythm pattern.
  - Moving a lick to another key or position.
  - A "comping" mode in Jam, where you play rhythm and the app plays lead or bass.
- **Everyone**
  - A week-one practice schedule for complete beginners.
  - Photos or short clips of hand position, posture and common fixes (buzzing strings, sore fingers).
  - A repeated "how to practise" reminder at the start of each unit.

## Practice and grading

- **A self-rating checklist** (steady pulse, no stops, long notes held, correct fingering) in place
  of one "clean" button, and **record yourself and listen back** as evidence for self-rating.
- **A sight-reading generator** in Practice: a random four-bar piece using only the keys, rhythms
  and positions already learned, played once, graded, and logged daily.
- **Unlock by mastery** as an option: a lesson opens when the previous exercise reaches a set
  fraction of its goal tempo (today lessons open as you finish them, and unit checkpoints nudge).
- **Loop a section while playing in time**, not only while listening.
- **Bend target check**: listen for the pitch a bend reaches, not only its starting note.
- **Rhythm-only drills**: tap or strum a rhythm with no pitch checking.
- **Cap self-rated tempos** set far above an exercise's goal.
- **Prompt a human check-in** every few weeks (a teacher, or filming your hands).

## Notation

- **8va marking for high guitar parts**, to avoid stacks of ledger lines at the 12th fret.
- **Double-sharp and double-flat symbols** in text labels (the staff already uses them).
- **Tie rendering on narrow screens**: the second half of a tie across a line break is cramped.
- **Pedal brackets that start a moment after the note**, to match the "press after" rule.

## Explore and Chords

- **Keyboard chord voicings**: one hand position with fingering and inversions, in place of every
  chord tone marked across three octaves.
- **Option to show the keyboard before the fretboard** for keyboard-first players.
- **More chord types**: 11ths, 13ths, altered dominants beyond 7♯9 and 7♭9.
- **Slash chords kept on a chord sheet** with their bass note in the name.
- **More voicings in open tunings** (DADGAD offers one shape for some chords).
- **Print or export a chord sheet.**
- **Song suggestions** for the chords a player already knows.

## Jam

- **More styles**: slow blues in 12/8, reggae, bossa nova, a ballad.
- **Adjustable backing**: mute drums or bass, change the feel, pick the number of choruses.
- **Prompts while playing**: "rest this bar", "answer the last phrase".

## App

- **Move Settings off the Progress page**, and add a calendar and minutes to Progress.
- **Sync progress between devices.** Progress lives in one browser today; this would need accounts
  and a backend.
- **Export and import progress** as a file, as a no-backend alternative.
- **Installable app (PWA)** with offline use.
- **Sampled instrument sounds** in place of the synthesised guitar and piano.
- **Custom tunings in lessons and practice**, not only on the Chords page.
- **Tabs from audio.** Upload an audio file or play into the microphone, detect the notes in the
  browser, and write them out as guitar tab, keyboard notes and sheet music. Works best on
  single-note lines. Pasting a streaming or video link, or transcribing full band mixes, would need
  a backend service; the app has none today. (A placeholder page exists, linked from the footer.)

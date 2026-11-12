import { keys } from '../theory/music'
import { exercise, fm, km, quiz, text, type Track } from './types'

export const theory: Track = {
  id: 'theory',
  title: 'Music theory',
  blurb: 'How music is built: notes, rhythm, scales, keys and chords, shown on both instruments.',
  units: [
    {
      id: 't1',
      title: 'Foundations',
      level: 'Beginner',
      about: 'The musical alphabet, the staff and rhythm.',
      placement: {
        q: 'How many beats does a dotted half note get in 4/4 time?',
        options: ['2', '3', '4', '1½'],
        answer: 1,
      },
      lessons: [
        {
          id: 'th-notes',
          title: 'The twelve notes',
          goal: 'Name all twelve notes and find them on the keyboard and the guitar.',
          minutes: 10,
          steps: [
            text(
              'Seven letters, twelve notes',
              'Music uses seven letter names: **A B C D E F G**, then they repeat. The distance from one note to the next one with the same name is an **octave**.\n\nBetween most letters there is an extra note, named with a **sharp (♯, one step higher)** or a **flat (♭, one step lower)**. C♯ and D♭ are the same pitch with two names. There is **no extra note between B and C or between E and F**. That gives twelve notes in total.',
            ),
            {
              t: 'keyboard',
              title: 'On the keyboard',
              marks: km('C4 C#4 D4 Eb4 E4 F4 F#4 G4 Ab4 A4 Bb4 B4 *C5'),
              from: 60,
              to: 72,
              caption: 'White keys are the seven letters. Black keys are the sharps and flats. Tap a key to hear it.',
            },
            {
              t: 'fretboard',
              title: 'On the guitar',
              marks: fm('*6/0=E 6/1=F 6/2=F♯ 6/3=G 6/4=A♭ 6/5=A 6/6=B♭ 6/7=B 6/8=C 6/9=C♯ 6/10=D 6/11=E♭ *6/12=E'),
              from: 0,
              to: 12,
              caption: 'Each fret is one of the twelve steps. Twelve frets up, the note names start again.',
            },
            text(
              'Half steps and whole steps',
              'The smallest distance, one key or one fret, is a **half step** (semitone). Two of them make a **whole step** (tone). Every scale and chord is a recipe of half and whole steps, so these two words come up constantly.',
            ),
            exercise(
              'th-alphabet',
              'The natural notes',
              keys('C4 D4 E4 F4 | G4 A4 B4 C5 | C5 B4 A4 G4 | F4 E4 D4 C4'),
              60,
              100,
              'Play this on the keyboard or the guitar (start on the 5th string, 3rd fret). Say the names as you go.',
            ),
            quiz('Which two pairs of letters have no sharp/flat between them?', ['A–B and C–D', 'B–C and E–F', 'D–E and G–A', 'F–G and A–B'], 1),
            quiz('How many frets make a whole step?', ['1', '2', '3', '12'], 1),
          ],
        },
        {
          id: 'th-staff',
          title: 'Reading the staff',
          goal: 'Read notes on the treble and bass staff.',
          minutes: 12,
          steps: [
            text(
              'Five lines',
              'Notes are written on a **staff** of five lines. Higher on the staff means higher in pitch. A **clef** at the start tells you which notes the lines stand for.\n\n**Treble clef** (guitar, and the right hand on keyboard):\n- Lines, bottom to top: **E G B D F** (*Every Good Boy Does Fine*)\n- Spaces: **F A C E**\n\n**Bass clef** (left hand on keyboard):\n- Lines: **G B D F A** (*Good Boys Do Fine Always*)\n- Spaces: **A C E G** (*All Cows Eat Grass*)\n\n**Middle C** sits on a short extra line (a ledger line) just below the treble staff and just above the bass staff. It joins the two.',
            ),
            {
              t: 'score',
              piece: keys('C4~C D4~D E4~E F4~F | G4~G A4~A B4~B C5~C | D5~D E5~E F5~F G5~G'),
              caption: 'From middle C upward. Notes alternate line, space, line, space.',
            },
            {
              t: 'score',
              piece: keys('r:w | r:w', 'C3~C D3~D E3~E F3~F | G3~G A3~A B3~B C4~C'),
              caption: 'The bass staff, from the C below middle C up to middle C.',
            },
            text(
              'A note for guitarists',
              'Guitar music is written in treble clef **one octave higher than it sounds**, to keep it on the staff. So the open low E string is written below the staff with three ledger lines. Tab underneath saves you from counting them.',
            ),
            quiz('The spaces of the treble staff, bottom to top, spell…', ['EGBDF', 'FACE', 'ACEG', 'GBDFA'], 1),
            quiz('Where is middle C written in treble clef?', ['On the top line', 'On a ledger line below the staff', 'In the bottom space', 'On the middle line'], 1),
          ],
        },
        {
          id: 'th-rhythm',
          title: 'Rhythm and counting',
          goal: 'Count and play whole, half, quarter and eighth notes in 4/4.',
          minutes: 12,
          steps: [
            text(
              'Beats and bars',
              'The steady pulse you tap your foot to is the **beat**. Beats are grouped into **bars** (measures), separated by vertical bar lines. The **time signature** 4/4 means four beats per bar, with a quarter note worth one beat.\n\n- **Whole note**: 4 beats ("1 2 3 4")\n- **Half note**: 2 beats\n- **Quarter note**: 1 beat\n- **Eighth note**: half a beat, counted "1 and 2 and"\n- A **dot** after a note adds half its length: a dotted half = 3 beats.\n\n**Tempo** is the speed of the beat in beats per minute (bpm). A metronome clicks the beat for you: practise with it and your timing will become reliable.',
            ),
            exercise(
              'th-rhythm1',
              'Counting note values',
              keys('C4:w | C4:h C4:h | C4 C4 C4 C4 | C4:8 C4:8 C4:8 C4:8 C4:8 C4:8 C4:8 C4:8 | C4:hd C4 | C4:w'),
              60,
              100,
              'One note, six rhythms. Count out loud; any C on either instrument works (guitar: 5th string, 3rd fret).',
            ),
            quiz('In 4/4, how many eighth notes fit in one bar?', ['4', '6', '8', '16'], 2),
            quiz('What does a dot after a note do?', ['Doubles its length', 'Adds half its length', 'Halves its length', 'Makes it louder'], 1),
          ],
        },
      ],
    },
    {
      id: 't2',
      title: 'Scales and keys',
      level: 'Beginner',
      about: 'Intervals, the major scale and how keys are organised.',
      placement: {
        q: 'What is the pattern of whole (W) and half (H) steps in a major scale?',
        options: ['W W H W W W H', 'W H W W H W W', 'W W W H W W H', 'H W W H W W W'],
        answer: 0,
      },
      lessons: [
        {
          id: 'th-intervals',
          title: 'Intervals',
          goal: 'Name the distance between two notes and recognise the most common ones.',
          minutes: 12,
          steps: [
            text(
              'Measuring distance',
              'An **interval** is the distance between two notes. It has a number (count the letter names, including both ends: C up to E is C-D-E, a **3rd**) and a quality (major, minor or perfect) that pins down the exact number of half steps.\n\n- Minor 2nd: 1 half step · Major 2nd: 2\n- **Minor 3rd: 3 · Major 3rd: 4**\n- Perfect 4th: 5 · Tritone: 6 · **Perfect 5th: 7**\n- Minor 6th: 8 · Major 6th: 9\n- Minor 7th: 10 · Major 7th: 11 · **Octave: 12**\n\nThe 3rds and the 5th matter most: they are what chords are made of.',
            ),
            {
              t: 'keyboard',
              title: 'From C',
              marks: km('*C4 +Eb4=m3 +E4=M3 G4=P5 *C5=8ve'),
              from: 60,
              to: 72,
              caption: 'Minor 3rd, major 3rd, perfect 5th and octave above C. Tap the keys to compare them.',
            },
            {
              t: 'fretboard',
              title: 'Interval shapes on guitar',
              marks: fm('*6/5=1 5/3=m3 5/4=M3 5/5=4 5/7=5 *4/7=8'),
              from: 2,
              to: 8,
              caption: 'From the root on the 6th string. These shapes are the same from any fret.',
            },
            text(
              'Train your ear',
              'Theory is only useful when you can hear it. Open **Explore → Interval trainer** and spend a few minutes naming intervals by ear. Little and often is the way.',
            ),
            quiz('How many half steps are in a perfect 5th?', ['5', '6', '7', '8'], 2),
            quiz('C up to E is a…', ['Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Major 2nd'], 1),
          ],
        },
        {
          id: 'th-major',
          title: 'The major scale',
          goal: 'Build a major scale from any note using one formula.',
          minutes: 12,
          steps: [
            text(
              'One formula',
              'A **scale** is a set of notes in order. The **major scale** is the reference everything else is measured against. Its formula of whole (W) and half (H) steps is:\n\n**W – W – H – W – W – W – H**\n\nStart on C and follow it and you land on only white keys: C D E F G A B C. Start on any other note and you need sharps or flats to keep the same pattern. G major needs F♯; F major needs B♭.\n\nThe notes of a scale are numbered **1 to 7** (scale degrees). Musicians describe everything else, chords, other scales, melodies, relative to those numbers.',
            ),
            { t: 'scale', root: 'C', scale: 'major', on: 'both', from: 0, to: 5, caption: 'C major. The half steps fall between 3–4 and 7–8.' },
            { t: 'scale', root: 'G', scale: 'major', on: 'both', from: 0, to: 5, caption: 'G major: same formula, so F becomes F♯.' },
            exercise(
              'th-cmajor',
              'C major scale',
              keys('C4 D4 E4 F4 | G4 A4 B4 C5 | C5 B4 A4 G4 | F4 E4 D4 C4'),
              66,
              110,
              'Listen for the two half steps (E–F and B–C).',
            ),
            quiz('Which note is sharp in G major?', ['C', 'F', 'G', 'B'], 1),
            quiz('What is the 5th degree of C major?', ['E', 'F', 'G', 'A'], 2),
          ],
        },
        {
          id: 'th-keys',
          title: 'Keys and the circle of fifths',
          goal: 'Use the circle of fifths to know the sharps or flats of any key.',
          minutes: 12,
          steps: [
            text(
              'What "in the key of" means',
              'A piece **in the key of G major** mostly uses the notes of the G major scale and feels at rest on G. Instead of writing ♯ next to every F, the sharps or flats are written once at the start of each line: the **key signature**.',
            ),
            {
              t: 'circle',
              caption:
                'Go clockwise and each key is a 5th higher and adds one sharp. Go anticlockwise and each key adds one flat. The inner ring is the relative minor that shares the same notes.',
            },
            text(
              'Reading the circle',
              '- **Order of sharps**: F C G D A E B. **Order of flats** is the reverse: B E A D G C F.\n- **Neighbouring keys share six of their seven notes**, so songs move between neighbours easily.\n- The three neighbours C–F–G give you the I, IV and V chords of C. That works at every position on the circle.\n\nGuitar-friendly keys sit on the sharp side (G, D, A, E). Keyboard beginners start at the top (C, G, F).',
            ),
            quiz('How many sharps does D major have?', ['1', '2', '3', '4'], 1, 'D is two steps clockwise from C: F♯ and C♯.'),
            quiz('Which key has one flat?', ['G', 'F', 'B♭', 'D'], 1),
          ],
        },
      ],
    },
    {
      id: 't3',
      title: 'Chords and progressions',
      level: 'Intermediate',
      about: 'How chords are built and why certain chords belong together.',
      placement: {
        q: 'In the key of C major, which chord is the vi chord?',
        options: ['F major', 'G major', 'A minor', 'D minor'],
        answer: 2,
      },
      lessons: [
        {
          id: 'th-triads',
          title: 'Triads',
          goal: 'Build major, minor and diminished triads from any root.',
          minutes: 12,
          steps: [
            text(
              'Stacking thirds',
              'A **triad** is a three-note chord made by stacking two 3rds: the **root**, the **3rd** and the **5th**.\n\n- **Major** = major 3rd + minor 3rd (1 – 3 – 5). Bright, stable.\n- **Minor** = minor 3rd + major 3rd (1 – ♭3 – 5). Darker.\n- **Diminished** = minor 3rd + minor 3rd (1 – ♭3 – ♭5). Tense.\n\nThe only difference between C major and C minor is one note: the 3rd drops a half step from E to E♭.',
            ),
            { t: 'keyboard', title: 'C major', marks: km('*C4 +E4 +G4'), from: 57, to: 72, caption: 'C – E – G: 4 half steps, then 3.' },
            { t: 'keyboard', title: 'C minor', marks: km('*C4 +Eb4 +G4'), from: 57, to: 72, caption: 'C – E♭ – G: 3 half steps, then 4.' },
            {
              t: 'fretboard',
              title: 'The same notes inside an open C chord',
              marks: fm('*5/3=C +4/2=E +3/0=G *2/1=C +1/0=E'),
              from: 0,
              to: 4,
              muted: [6],
              caption: 'A six-string chord is still just three different notes, doubled.',
            },
            exercise(
              'th-triads1',
              'C, F and G triads',
              keys('[C4 E4 G4]:w | [F4 A4 C5]:w | [G4 B4 D5]:w | [C4 E4 G4]:w'),
              60,
              96,
              'On guitar, strum open C, F, G and C chords instead (the microphone accepts any chord tone).',
            ),
            quiz('Which notes make an A minor triad?', ['A C♯ E', 'A C E', 'A D E', 'A C E♭'], 1),
            quiz('What turns a major triad into a minor one?', ['Lower the root', 'Lower the 3rd a half step', 'Raise the 5th', 'Add a 7th'], 1),
          ],
        },
        {
          id: 'th-progressions',
          title: 'Chords in a key',
          goal: 'Name the seven chords of a major key and play the most used progressions.',
          minutes: 15,
          steps: [
            text(
              'Roman numerals',
              'Build a triad on each note of a major scale, using only notes from that scale, and you always get the same pattern of chord types:\n\n**I – ii – iii – IV – V – vi – vii°**\n\nCapitals are major, lower case minor, ° diminished. In C: **C – Dm – Em – F – G – Am – B°**.\n\nNumbers let you describe a song once and play it in any key. "I–V–vi–IV" is C–G–Am–F in C, and G–D–Em–C in G.',
            ),
            text(
              'The progressions to know',
              '- **I – IV – V**: the backbone of blues, rock and folk.\n- **I – V – vi – IV**: countless pop songs.\n- **vi – IV – I – V**: the same four chords starting on the minor chord, for a sadder feel.\n- **ii – V – I**: the core movement of jazz; V wants to resolve to I.\n\nThe V chord creates tension and the I chord releases it. That pull is what makes harmony feel like it is going somewhere.\n\nOpen **Explore** and pick any key to see its seven chords and hear them.',
            ),
            exercise(
              'th-prog1',
              'I – V – vi – IV in C',
              keys('[C4 E4 G4]:w | [B3 D4 G4]:w | [A3 C4 E4]:w | [A3 C4 F4]:w | [C4 E4 G4]:w', 'C3:w | G2:w | A2:w | F2:w | C3:w'),
              60,
              96,
              'Right hand plays close chord shapes; left hand plays the root. Guitarists: strum C, G, Am, F, C.',
            ),
            quiz('What are the I, IV and V chords in G major?', ['G, C, D', 'G, B, D', 'G, A, B', 'G, D, E'], 0),
            quiz('Which chord in a major key is diminished?', ['ii', 'iii', 'vi', 'vii°'], 3),
          ],
        },
        {
          id: 'th-minor',
          title: 'Minor keys',
          goal: 'Find the relative minor of any major key and build the natural minor scale.',
          minutes: 10,
          steps: [
            text(
              'The relative minor',
              'Every major key has a **relative minor** that uses exactly the same notes but treats the **6th degree as home**. C major and A minor share all seven notes; so do G major and E minor.\n\nQuick ways to find it: go **down three half steps** from the major root (three frets on guitar), or read the inner ring of the circle of fifths.\n\nCompared with a major scale on the same root, the **natural minor** lowers the 3rd, 6th and 7th: **1 2 ♭3 4 5 ♭6 ♭7**.',
            ),
            { t: 'scale', root: 'A', scale: 'minor', on: 'both', from: 0, to: 5, caption: 'A natural minor: the same white keys as C major, starting from A.' },
            exercise(
              'th-aminor',
              'A natural minor scale',
              keys('A3 B3 C4 D4 | E4 F4 G4 A4 | A4 G4 F4 E4 | D4 C4 B3 A3'),
              66,
              110,
            ),
            quiz('What is the relative minor of G major?', ['A minor', 'B minor', 'D minor', 'E minor'], 3),
            quiz('Which degrees are lowered in natural minor compared with major?', ['2, 3, 6', '3, 6, 7', '3, 5, 7', '4, 6, 7'], 1),
          ],
        },
      ],
    },
    {
      id: 't4',
      title: 'Colour: pentatonics and modes',
      level: 'Advancing',
      about: 'Where the soloing scales come from and how modes change the mood.',
      placement: {
        q: 'Which scale degrees make up the minor pentatonic scale?',
        options: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 2 ♭3 4 5', '1 3 4 5 7'],
        answer: 1,
      },
      lessons: [
        {
          id: 'th-pent',
          title: 'Pentatonic and blues scales',
          goal: 'Understand how the pentatonic scales are cut from the major and minor scales.',
          minutes: 10,
          steps: [
            text(
              'Take two notes away',
              'A seven-note scale contains two half steps, and those are where the tension lives. Remove one note from each half-step pair and you get a five-note **pentatonic** scale with no half steps at all, which is why it is so hard to play a wrong note.\n\n- **Major pentatonic** = major scale without the 4th and 7th: **1 2 3 5 6**\n- **Minor pentatonic** = natural minor without the 2nd and ♭6th: **1 ♭3 4 5 ♭7**\n\nThey are relatives too: **C major pentatonic and A minor pentatonic are the same five notes**.\n\nAdd a ♭5 to the minor pentatonic and you have the **blues scale**.',
            ),
            { t: 'scale', root: 'A', scale: 'minorPent', on: 'both', from: 4, to: 9, caption: 'A minor pentatonic: A C D E G.' },
            { t: 'scale', root: 'A', scale: 'blues', on: 'both', from: 4, to: 9, caption: 'A blues: the same, plus E♭.' },
            quiz('Which notes of the major scale does the major pentatonic leave out?', ['2nd and 6th', '3rd and 7th', '4th and 7th', '1st and 5th'], 2),
            quiz('A minor pentatonic has the same notes as…', ['A major pentatonic', 'C major pentatonic', 'E major pentatonic', 'G major pentatonic'], 1),
          ],
        },
        {
          id: 'th-modes',
          title: 'A first look at modes',
          goal: 'Hear Dorian and Mixolydian as one-note changes to scales you already know.',
          minutes: 12,
          steps: [
            text(
              'One changed note',
              'A **mode** is what you get when you play the notes of a major scale but treat a different note as home. That definition is correct and not very helpful in practice. A more useful way to think:\n\n- **Dorian** = natural minor with a **raised 6th**. Minor, but brighter and funkier.\n- **Mixolydian** = major with a **lowered 7th**. Major, but bluesy. It fits dominant 7th chords, so it is everywhere in blues-rock.\n\nIf you already solo with the minor pentatonic, adding the 2nd and the major 6th turns it into Dorian. Try it in Jam mode over a minor groove and listen for that one bright note.',
            ),
            { t: 'scale', root: 'A', scale: 'dorian', on: 'both', from: 4, to: 9, caption: 'A Dorian: A B C D E F♯ G. The F♯ is the characteristic note.' },
            { t: 'scale', root: 'A', scale: 'mixolydian', on: 'both', from: 4, to: 9, caption: 'A Mixolydian: A B C♯ D E F♯ G. The G natural is the characteristic note.' },
            quiz('Mixolydian is a major scale with which change?', ['Raised 4th', 'Lowered 3rd', 'Lowered 7th', 'Raised 6th'], 2),
            quiz('Dorian differs from natural minor by its…', ['Raised 6th', 'Lowered 2nd', 'Raised 7th', 'Lowered 5th'], 0),
          ],
        },
      ],
    },
  ],
}

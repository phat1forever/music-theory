import { keys, type PieceOpts } from '../theory/music'
import { exercise, km, quiz, text, type Track } from './types'

/** A left-hand-only piece: the right hand rests for the given number of bars. */
const lh = (src: string, barCount: number, opts?: PieceOpts) => keys(Array(barCount).fill(opts?.meter === 3 ? 'r:hd' : 'r:w').join(' '), src, opts)

export const keyboard: Track = {
  id: 'keys',
  title: 'Keyboard',
  blurb: 'Posture and fingering, reading both clefs, scales, chords and playing hands together.',
  units: [
    {
      id: 'k1',
      title: 'First steps',
      level: 'Beginner',
      about: 'Find your way around the keys and play with each hand in C position.',
      placement: {
        q: 'Where is middle C written in the bass clef (left-hand staff)?',
        options: ['On the bottom line', 'In the second space from the bottom', 'On a short ledger line just above the staff', 'On the middle line'],
        answer: 2,
      },
      lessons: [
        {
          id: 'k-posture',
          title: 'Posture, fingers and finding C',
          goal: 'Sit correctly, number your fingers and find every C on the keyboard.',
          minutes: 8,
          steps: [
            text(
              'Before you play a note',
              'Sit toward the front half of the seat, facing the middle of the keyboard, far enough back that your elbows are slightly in front of your body. Forearms level with the keys, shoulders relaxed.\n\nCurve your fingers as if holding a small ball, and play on the fingertips (the thumb plays on its side). Flat, stiff fingers are the most common beginner habit and the hardest to undo later.\n\n**Fingers are numbered 1 to 5 on both hands, starting from the thumb**: 1 thumb, 2 index, 3 middle, 4 ring, 5 little finger. The small numbers above or below notes tell you which finger to use.',
            ),
            {
              t: 'keyboard',
              title: 'Finding C',
              marks: km('*C3=C3 *C4=C4 *C5=C5'),
              from: 48,
              to: 77,
              caption: 'Black keys come in groups of two and three. C is always the white key just left of a group of two. Middle C (C4) is the C nearest the middle of a full-size piano; on a 61-key keyboard it is the third C from the left.',
            },
            {
              t: 'keyboard',
              title: 'Right hand in C position',
              marks: km('C4=1 D4=2 E4=3 F4=4 G4=5'),
              from: 55,
              to: 72,
              caption: 'Thumb on middle C, one finger per white key. The numbers are finger numbers.',
            },
            exercise(
              'k-findc',
              'Three Cs',
              keys('C4.1:h C4.1:h | C5.1:h C5.1:h | C4.1:h C4.1:h | C4.1:w', 'r:w | r:w | r:w | C3.5:w'),
              60,
              90,
              'Middle C, the C above, then both hands: middle C with the right thumb and the C below with the left little finger.',
            ),
            quiz('How do you find a C?', ['Left of two black keys', 'Left of three black keys', 'Right of two black keys', 'Between two black keys'], 0),
            quiz('Which finger is number 5?', ['Thumb', 'Index', 'Ring', 'Little finger'], 3),
          ],
        },
        {
          id: 'k-five',
          title: 'Right hand: five-finger position',
          goal: 'Play five notes with the right fingers and a first melody.',
          minutes: 10,
          steps: [
            text(
              'One finger, one key',
              'In **C position** your right thumb sits on middle C and the other fingers rest on D, E, F and G. Keep all five fingers resting lightly on their keys even when they are not playing: the hand stays still and only the fingers move.\n\nPlay each note with a relaxed drop of the finger and let it come back up as the next one goes down, so the notes connect smoothly (*legato*).',
            ),
            exercise(
              'k-five1',
              'Five-finger warm-up',
              keys('C4.1 D4.2 E4.3 F4.4 | G4.5 F4.4 E4.3 D4.2 | C4.1 E4.3 G4.5 E4.3 | C4.1:w'),
              60,
              108,
              'Bar 3 skips a key each time: fingers 1, 3, 5.',
            ),
            exercise(
              'k-ode',
              'Ode to Joy (Beethoven)',
              keys(
                'E4.3 E4.3 F4.4 G4.5 | G4.5 F4.4 E4.3 D4.2 | C4.1 C4.1 D4.2 E4.3 | E4.3:qd D4.2:8 D4.2:h | ' +
                  'E4.3 E4.3 F4.4 G4.5 | G4.5 F4.4 E4.3 D4.2 | C4.1 C4.1 D4.2 E4.3 | D4.2:qd C4.1:8 C4.1:h',
              ),
              66,
              108,
              'Your hand never leaves C position. The dotted quarter note lasts a beat and a half.',
            ),
            quiz('In right-hand C position, which finger plays G?', ['3', '4', '5', '1'], 2),
          ],
        },
        {
          id: 'k-lh',
          title: 'Left hand: C position',
          goal: 'Play five notes with the left hand and read them in bass clef.',
          minutes: 10,
          steps: [
            text(
              'A mirror image',
              'The left hand takes the C **below** middle C with the **little finger (5)**, and the thumb (1) lands on G. The fingering is the mirror image of the right hand, so going up the keys the numbers count down: 5 4 3 2 1.\n\nLeft-hand music is written in the **bass clef**. The C you start on sits in the second space from the bottom.',
            ),
            {
              t: 'keyboard',
              title: 'Left hand in C position',
              marks: km('_C3=5 _D3=4 _E3=3 _F3=2 _G3=1'),
              from: 45,
              to: 62,
            },
            exercise(
              'k-lh1',
              'Left-hand warm-up',
              lh('C3.5 D3.4 E3.3 F3.2 | G3.1 F3.2 E3.3 D3.4 | C3.5 E3.3 G3.1 E3.3 | C3.5:w', 4),
              60,
              108,
              'Finger 4 is the weakest and finger 5 the smallest. Keep them curved and let the arm weight help.',
            ),
            quiz('In left-hand C position, which finger plays C?', ['1', '3', '5', '2'], 2),
          ],
        },
      ],
    },
    {
      id: 'k2',
      title: 'Reading and scales',
      level: 'Beginner',
      about: 'Read the grand staff and play one-octave scales with proper fingering.',
      placement: {
        q: 'Playing a C major scale upward with the right hand, which finger plays F?',
        options: ['4 (ring finger)', '1 (thumb, tucked under)', '2 (index)', '5 (little finger)'],
        answer: 1,
      },
      lessons: [
        {
          id: 'k-read',
          title: 'The grand staff',
          goal: 'Read steps and skips on the treble and bass staff using three landmark notes.',
          minutes: 10,
          steps: [
            text(
              'Two staves, one instrument',
              'Keyboard music uses the **grand staff**: a treble staff for the right hand joined to a bass staff for the left.\n\nYou do not need to name every note to read well. Learn three **landmarks** and read everything else by distance from them:\n\n- **Middle C**: on the ledger line between the two staves.\n- **Treble G**: the line the treble clef curls around (second line from the bottom).\n- **Bass F**: the line between the two dots of the bass clef (second line from the top).\n\nFrom one note to the next, a **step** moves line-to-space (the neighbouring key) and a **skip** moves line-to-line or space-to-space (miss a key).',
            ),
            {
              t: 'score',
              piece: keys('C4~C G4~G C4~C G4~G', 'C4~C F3~F C4~C F3~F'),
              caption: 'The three landmarks: middle C in both hands, treble G and bass F.',
            },
            exercise(
              'k-read1',
              'Steps and skips',
              keys('C4.1 D4.2 E4.3 C4.1 | E4.3 F4.4 G4.5:h | G4.5 E4.3 F4.4 D4.2 | C4.1:w'),
              60,
              104,
              'Before playing, point at each note and say "step up", "skip down" and so on.',
            ),
            exercise(
              'k-read2',
              'Left-hand reading',
              lh('G3.1 F3.2 E3.3 G3.1 | E3.3 D3.4 C3.5:h | C3.5 E3.3 D3.4 F3.2 | E3.3:h C3.5:h', 4),
              60,
              104,
            ),
            quiz('A note on a line followed by a note in the very next space is a…', ['Skip', 'Step', 'Leap', 'Repeat'], 1),
          ],
        },
        {
          id: 'k-cscale',
          title: 'The C major scale',
          goal: 'Play one octave of C major with each hand using the thumb-under technique.',
          minutes: 12,
          steps: [
            text(
              'Eight notes, five fingers',
              'A scale has more notes than you have fingers, so the thumb **tucks under** on the way up.\n\n**Right hand going up: 1 2 3 – 1 2 3 4 5.** After finger 3 plays E, the thumb slides under the hand to play F. Coming down, reverse it: finger 3 crosses **over** the thumb.\n\n**Left hand going up: 5 4 3 2 1 – 3 2 1.** After the thumb plays G, finger 3 crosses over to A.\n\nMove the thumb early and keep your wrist level and your elbow quiet: no twisting.',
            ),
            {
              t: 'keyboard',
              title: 'Right-hand fingering',
              marks: km('C4=1 D4=2 E4=3 *F4=1 G4=2 A4=3 B4=4 C5=5'),
              from: 57,
              to: 74,
              caption: 'The orange key is where the thumb tucks under.',
            },
            exercise(
              'k-cscale-rh',
              'C major, right hand',
              keys('C4.1 D4.2 E4.3 F4.1 | G4.2 A4.3 B4.4 C5.5 | C5.5 B4.4 A4.3 G4.2 | F4.1 E4.3 D4.2 C4.1'),
              60,
              112,
            ),
            {
              t: 'keyboard',
              title: 'Left-hand fingering',
              marks: km('_C3=5 _D3=4 _E3=3 _F3=2 _G3=1 *A3=3 _B3=2 _C4=1'),
              from: 45,
              to: 62,
              caption: 'The orange key is where finger 3 crosses over.',
            },
            exercise(
              'k-cscale-lh',
              'C major, left hand',
              lh('C3.5 D3.4 E3.3 F3.2 | G3.1 A3.3 B3.2 C4.1 | C4.1 B3.2 A3.3 G3.1 | F3.2 E3.3 D3.4 C3.5', 4),
              60,
              112,
            ),
            quiz('Right hand, C major going up: what happens after finger 3 plays E?', ['Finger 4 plays F', 'The thumb tucks under to F', 'The hand jumps', 'Finger 5 plays F'], 1),
          ],
        },
        {
          id: 'k-gf',
          title: 'G major and F major',
          goal: 'Play two more scales and meet your first black keys.',
          minutes: 12,
          steps: [
            text(
              'One sharp, one flat',
              '**G major** has one sharp, **F♯**. The right-hand fingering is the same as C major (1 2 3 – 1 2 3 4 5); finger 4 plays the black key.\n\n**F major** has one flat, **B♭**. Its right-hand fingering is different because the thumb should not play a black key: **1 2 3 4 – 1 2 3 4**. Finger 4 plays B♭ and the thumb tucks under to C.\n\n**Left hand:** both scales use the same fingering as C major, **5 4 3 2 1 – 3 2 1**, with finger 3 crossing over after the thumb.\n\n**Reading tip:** from this lesson on, the sharp or flat is written once in the **key signature** at the start of each line, not beside each note. In G major every F you see is F♯; in F major every B is B♭.',
            ),
            {
              t: 'keyboard',
              title: 'G major, right hand',
              marks: km('G4=1 A4=2 B4=3 *C5=1 D5=2 E5=3 F#5=4 G5=5'),
              from: 65,
              to: 81,
            },
            exercise(
              'k-gscale',
              'G major, right hand',
              keys('G4.1 A4.2 B4.3 C5.1 | D5.2 E5.3 F#5.4 G5.5 | G5.5 F#5.4 E5.3 D5.2 | C5.1 B4.3 A4.2 G4.1', undefined, { key: 'G' }),
              60,
              108,
            ),
            {
              t: 'keyboard',
              title: 'F major, right hand',
              marks: km('F4=1 G4=2 A4=3 Bb4=4 *C5=1 D5=2 E5=3 F5=4'),
              from: 62,
              to: 79,
            },
            exercise(
              'k-fscale',
              'F major, right hand',
              keys('F4.1 G4.2 A4.3 Bb4.4 | C5.1 D5.2 E5.3 F5.4 | F5.4 E5.3 D5.2 C5.1 | Bb4.4 A4.3 G4.2 F4.1', undefined, { key: 'F' }),
              60,
              108,
              undefined,
              true,
            ),
            exercise(
              'k-gscale-lh',
              'G major, left hand',
              lh('G2.5 A2.4 B2.3 C3.2 | D3.1 E3.3 F#3.2 G3.1 | G3.1 F#3.2 E3.3 D3.1 | C3.2 B2.3 A2.4 G2.5', 4, { key: 'G' }),
              60,
              108,
            ),
            exercise(
              'k-fscale-lh',
              'F major, left hand',
              lh('F2.5 G2.4 A2.3 Bb2.2 | C3.1 D3.3 E3.2 F3.1 | F3.1 E3.2 D3.3 C3.1 | Bb2.2 A2.3 G2.4 F2.5', 4, { key: 'F' }),
              60,
              108,
              undefined,
              true,
            ),
            quiz('Why does F major use the fingering 1 2 3 4 – 1 2 3 4?', ['It is faster', 'To keep the thumb off the black key', 'It has more notes', 'There is no reason'], 1),
          ],
        },
        {
          id: 'k-minor',
          title: 'Minor scales: A minor and D minor',
          goal: 'Play two minor scales with correct fingering and a minor-key chord pattern.',
          minutes: 12,
          steps: [
            text(
              'The other half of the keys',
              '**A minor** uses only white keys, like C major, but starts and ends on A. The fingering is the same pattern as C major: right hand **1 2 3 – 1 2 3 4 5**, left hand **5 4 3 2 1 – 3 2 1**.\n\n**D minor** has one flat, B♭, the same key signature as F major. Its right-hand fingering is again 1 2 3 – 1 2 3 4 5, with the thumb tucking under to G after finger 3 plays F, so **finger 3 lands on B♭** the second time round.\n\nIn minor keys the 7th note is often raised a half step when the music heads for the V chord (G♯ in A minor). You will see it written in as an accidental.',
            ),
            { t: 'keyboard', title: 'A minor, right hand', marks: km('A3=1 B3=2 C4=3 *D4=1 E4=2 F4=3 G4=4 A4=5'), from: 55, to: 71, caption: 'The orange key is where the thumb tucks under.' },
            exercise(
              'k-amin-rh',
              'A minor, right hand',
              keys('A3.1 B3.2 C4.3 D4.1 | E4.2 F4.3 G4.4 A4.5 | A4.5 G4.4 F4.3 E4.2 | D4.1 C4.3 B3.2 A3.1', undefined, { key: 'Am' }),
              60,
              108,
            ),
            exercise(
              'k-amin-lh',
              'A minor, left hand',
              lh('A2.5 B2.4 C3.3 D3.2 | E3.1 F3.3 G3.2 A3.1 | A3.1 G3.2 F3.3 E3.1 | D3.2 C3.3 B2.4 A2.5', 4, { key: 'Am' }),
              60,
              108,
            ),
            { t: 'keyboard', title: 'D minor, right hand', marks: km('D4=1 E4=2 F4=3 *G4=1 A4=2 Bb4=3 C5=4 D5=5'), from: 60, to: 76 },
            exercise(
              'k-dmin-rh',
              'D minor, right hand',
              keys('D4.1 E4.2 F4.3 G4.1 | A4.2 Bb4.3 C5.4 D5.5 | D5.5 C5.4 Bb4.3 A4.2 | G4.1 F4.3 E4.2 D4.1', undefined, { key: 'Dm' }),
              60,
              108,
              'One flat in the key signature: every B is B♭.',
            ),
            exercise(
              'k-amin-chords',
              'Am – Dm – E – Am',
              keys('[A3 C4 E4].135:w | [A3 D4 F4].135:w | [G#3 B3 E4].125:w | [A3 C4 E4].135:w', undefined, { key: 'Am', chords: 'Am Dm E Am' }),
              60,
              96,
              'The thumb stays on A for the first two chords, then drops a half step to G♯: that note is the raised 7th.',
            ),
            quiz('Which major key has the same key signature as D minor?', ['C major', 'G major', 'F major', 'B♭ major'], 2),
          ],
        },
      ],
    },
    {
      id: 'k3',
      title: 'Chords at the keyboard',
      level: 'Intermediate',
      about: 'Triads, inversions that sit under the hand, and left-hand accompaniment patterns.',
      placement: {
        q: 'Which notes are a C major triad in first inversion (lowest note first)?',
        options: ['C E G', 'E G C', 'G C E', 'C F A'],
        answer: 1,
      },
      lessons: [
        {
          id: 'k-triads',
          title: 'Playing triads',
          goal: 'Play C, F and G chords as block and broken chords.',
          minutes: 10,
          steps: [
            text(
              'Every other key',
              'A triad in **root position** is three notes a 3rd apart. For C, F and G that means every other white key, played with fingers **1 – 3 – 5** in the right hand (5 – 3 – 1 in the left). Other chords use the same hand shape with one or more black keys.\n\nPlay the three notes exactly together, as a **block chord**, with a firm hand and loose wrist. Played one after another it is a **broken chord** (arpeggio).\n\nC, F and G are the I, IV and V chords of C major. With these three you can accompany a huge number of songs.',
            ),
            { t: 'keyboard', title: 'C, F and G in root position', marks: km('*C4=1 +E4=3 +G4=5'), from: 57, to: 76, caption: 'Shown: C major. Move the same hand shape up to F and to G.' },
            exercise(
              'k-triads1',
              'Block chords',
              keys('[C4 E4 G4].135:w | [F4 A4 C5].135:w | [G4 B4 D5].135:w | [C4 E4 G4].135:w'),
              60,
              96,
              'A MIDI keyboard checks all three notes. With the microphone, any note of the chord counts.',
            ),
            exercise(
              'k-triads2',
              'Broken chords',
              keys('C4.1 E4.3 G4.5 E4.3 | F4.1 A4.3 C5.5 A4.3 | G4.1 B4.3 D5.5 B4.3 | [C4 E4 G4].135:w'),
              66,
              112,
            ),
            quiz('Which fingers play a root-position triad in the right hand?', ['1 2 3', '1 3 5', '2 3 4', '1 2 5'], 1),
          ],
        },
        {
          id: 'k-inversions',
          title: 'Inversions',
          goal: 'Change between C, F and G with almost no hand movement.',
          minutes: 12,
          steps: [
            text(
              'Same notes, new order',
              'Jumping the whole hand between root-position chords is slow and sounds choppy. An **inversion** uses the same three notes with a different one on the bottom:\n\n- **Root position**: C E G\n- **1st inversion**: E G C\n- **2nd inversion**: G C E\n\nPick inversions so that the chords **share notes or move by step**. From C (C E G): keep C and move the other two up for **F (C F A)**; move the bottom two down for **G (B D G)**. Your hand barely moves.',
            ),
            { t: 'keyboard', title: 'C: root position', marks: km('*C4=1 +E4=3 +G4=5'), from: 55, to: 72 },
            { t: 'keyboard', title: 'F: 2nd inversion', marks: km('+C4=1 *F4=3 +A4=5'), from: 55, to: 72, caption: 'The thumb stays on C.' },
            { t: 'keyboard', title: 'G: 1st inversion', marks: km('+B3=1 +D4=2 *G4=5'), from: 55, to: 72, caption: 'Finger 5 stays on G.' },
            exercise(
              'k-inv1',
              'C – F – G – C, close voicing',
              keys('[C4 E4 G4].135:w | [C4 F4 A4].135:w | [B3 D4 G4].125:w | [C4 E4 G4].135:w'),
              60,
              100,
            ),
            quiz('What is the lowest note of a G major triad in first inversion?', ['G', 'B', 'D', 'F'], 1),
          ],
        },
        {
          id: 'k-lhpat',
          title: 'Left-hand patterns',
          goal: 'Accompany with root–fifth and broken-chord patterns.',
          minutes: 12,
          steps: [
            text(
              'What the left hand does',
              'In most popular music the right hand plays the melody or chords and the left hand supplies the bass and the pulse. Three patterns cover a lot of ground:\n\n- **Whole-note roots**: one bass note per chord. Simple and always works.\n- **Root–fifth**: alternate the bottom and top notes of the hand position for a steady, country/pop bounce.\n- **Broken chord** (bottom–top–middle–top), known as an **Alberti bass**: the classic flowing accompaniment used from Mozart to pop ballads.',
            ),
            exercise(
              'k-lh-r5',
              'Root–fifth pattern',
              lh('C3.5 G3.1 C3.5 G3.1 | F3.5 C4.1 F3.5 C4.1 | G3.5 D4.1 G3.5 D4.1 | C3.5:w', 4),
              66,
              110,
              'The hand shifts for F and G; keep the same little finger–thumb shape.',
            ),
            exercise(
              'k-lh-broken',
              'Broken-chord pattern',
              lh(
                'C3.5:8 G3.1:8 E3.3:8 G3.1:8 C3.5:8 G3.1:8 E3.3:8 G3.1:8 | B2.5:8 G3.1:8 D3.3:8 G3.1:8 B2.5:8 G3.1:8 D3.3:8 G3.1:8 | C3.5:8 G3.1:8 E3.3:8 G3.1:8 C3.5:8 G3.1:8 E3.3:8 G3.1:8 | C3.5:w',
                4,
              ),
              56,
              96,
              'Rock the hand gently from side to side. The thumb on G should be the quietest note.',
            ),
            quiz('In a root–fifth pattern on a C chord, the left hand alternates…', ['C and E', 'C and G', 'E and G', 'C and B'], 1),
          ],
        },
      ],
    },
    {
      id: 'k4',
      title: 'Hands together',
      level: 'Intermediate',
      about: 'Coordinate both hands and play complete pieces with melody and accompaniment.',
      placement: {
        q: 'The right hand plays a dotted quarter note then an eighth note. The left hand plays two quarter notes. When does the left hand\'s second note sound?',
        options: [
          'Together with the right hand\'s eighth note',
          'Before the right hand\'s eighth note',
          'After the right hand\'s eighth note',
          'Together with the dotted quarter note',
        ],
        answer: 1,
      },
      lessons: [
        {
          id: 'k-together',
          title: 'Hands together',
          goal: 'Play both hands at once: first in parallel, then melody over held bass notes.',
          minutes: 15,
          steps: [
            text(
              'How teachers approach it',
              'Coordination is a separate skill from playing each hand. Use this routine for every new piece:\n\n- **Right hand alone** until it is comfortable.\n- **Left hand alone** until it is comfortable.\n- **Together at half speed**, stopping to notice which notes land at the same moment.\n- Speed up only when it is clean three times in a row.\n\nRead the grand staff **vertically**: notes lined up above each other are played together.',
            ),
            exercise(
              'k-tog1',
              'Parallel five-finger',
              keys(
                'C4.1 D4.2 E4.3 F4.4 | G4.5:w | G4.5 F4.4 E4.3 D4.2 | C4.1:w',
                'C3.5 D3.4 E3.3 F3.2 | G3.1:w | G3.1 F3.2 E3.3 D3.4 | C3.5:w',
              ),
              54,
              96,
              'Both hands play the same notes an octave apart, with mirror-image fingering.',
            ),
            exercise(
              'k-mary',
              'Mary Had a Little Lamb (traditional)',
              keys(
                'E4.3 D4.2 C4.1 D4.2 | E4.3 E4.3 E4.3:h | D4.2 D4.2 D4.2:h | E4.3 G4.5 G4.5:h | E4.3 D4.2 C4.1 D4.2 | E4.3 E4.3 E4.3 E4.3 | D4.2 D4.2 E4.3 D4.2 | C4.1:w',
                'C3.5:w | C3.5:w | G3.1:w | C3.5:w | C3.5:w | C3.5:w | G3.1:w | C3.5:w',
              ),
              60,
              100,
              'The left hand only plays on beat 1 of each bar. Let it hold while the right hand moves.',
            ),
            quiz('On the grand staff, notes written directly above one another are…', ['Played one after the other', 'Played together', 'Optional', 'For the left hand only'], 1),
          ],
        },
        {
          id: 'k-chordmelody',
          title: 'Melody with chords',
          goal: 'Play a full piece with right-hand melody and left-hand chords.',
          minutes: 20,
          steps: [
            text(
              'Your first complete arrangement',
              'This is the tune you learned in the right hand earlier, now with **left-hand chords**: C major and G major in first inversion (B D G), so the left hand barely moves between them.\n\nPractise the left-hand chord change on its own first: little finger slides from C down to B, finger 3 from E down to D, thumb stays on G.',
            ),
            { t: 'keyboard', title: 'Left hand: C', marks: km('_C3=5 _E3=3 _G3=1'), from: 43, to: 60 },
            { t: 'keyboard', title: 'Left hand: G (1st inversion)', marks: km('_B2=5 _D3=3 _G3=1'), from: 43, to: 60, caption: 'The thumb stays on G.' },
            exercise(
              'k-ode2',
              'Ode to Joy, hands together',
              keys(
                'E4.3 E4.3 F4.4 G4.5 | G4.5 F4.4 E4.3 D4.2 | C4.1 C4.1 D4.2 E4.3 | E4.3:qd D4.2:8 D4.2:h | ' +
                  'E4.3 E4.3 F4.4 G4.5 | G4.5 F4.4 E4.3 D4.2 | C4.1 C4.1 D4.2 E4.3 | D4.2:qd C4.1:8 C4.1:h',
                '[C3 E3 G3].531:w | [B2 D3 G3].531:w | [C3 E3 G3].531:w | [B2 D3 G3].531:w | ' +
                  '[C3 E3 G3].531:w | [B2 D3 G3].531:w | [C3 E3 G3].531:w | [B2 D3 G3].531:h [C3 E3 G3].531:h',
              ),
              54,
              96,
              'Aim for a singing right hand and a softer left hand.',
            ),
            text(
              'Where to go from here',
              'You can now read both clefs, play scales with correct fingering, build chords and inversions, and coordinate two hands. To keep growing:\n\n- Add a new scale each week, hands separately, then together.\n- Take any melody you know and add the I, IV and V chords underneath by ear.\n- Use **Explore** to look up the chords of a key, and **Jam** to improvise with the right hand over a backing track.',
            ),
            quiz('In the left-hand change from C to G (first inversion), which finger stays on the same key?', ['5', '3', '1 (thumb)', 'None'], 2),
          ],
        },
      ],
    },
    {
      id: 'k5',
      title: 'Playing pieces',
      level: 'Intermediate',
      about: 'Four complete pieces that bring in 3/4 time, dotted rhythms, ties, a key signature and a change of hand position.',
      placement: {
        q: 'A piece has one sharp in its key signature and 3/4 as its time signature. What does that tell you?',
        options: [
          'Every F is played as F♯, and each bar has three beats',
          'Only the first F is sharp, and each bar has four beats',
          'The first three bars are played sharp',
          'There are three sharps and four beats in a bar',
        ],
        answer: 0,
      },
      lessons: [
        {
          id: 'k-waltz',
          title: 'A waltz in 3/4',
          goal: 'Play a piece in three-beat time, first with held bass notes and then with a waltz left hand.',
          minutes: 15,
          steps: [
            text(
              'Three in a bar',
              'Count "**1** 2 3" and lean slightly on beat 1. The note that fills a bar is the **dotted half note**.\n\nLearn it in two stages. First the left hand simply holds one bass note per bar. Then it plays the classic **waltz pattern**: bass note on beat 1, a two-note chord on beats 2 and 3 ("oom-pah-pah"). Keep beats 2 and 3 lighter than beat 1.\n\nChord names are printed above the staff. Use **Right hand only** and **Left hand only** before putting them together, and set **Bars** to loop any bar that trips you up.',
            ),
            exercise(
              'k-waltz1',
              'Little Waltz, held bass',
              keys(
                'E4.3 G4.5 G4.5 | E4.3 G4.5 G4.5 | F4.4 E4.3 D4.2 | E4.3:hd | D4.2 F4.4 F4.4 | D4.2 F4.4 F4.4 | D4.2 E4.3 D4.2 | C4.1:hd',
                'C3.5:hd | C3.5:hd | G3.1:hd | C3.5:hd | G3.1:hd | G3.1:hd | G3.1:hd | C3.5:hd',
                { meter: 3, chords: 'C . G C G . . C' },
              ),
              72,
              120,
            ),
            exercise(
              'k-waltz2',
              'Little Waltz, waltz bass',
              keys(
                'E4.3 G4.5 G4.5 | E4.3 G4.5 G4.5 | F4.4 E4.3 D4.2 | E4.3:hd | D4.2 F4.4 F4.4 | D4.2 F4.4 F4.4 | D4.2 E4.3 D4.2 | C4.1:hd',
                'C3.5 [E3 G3].31 [E3 G3].31 | C3.5 [E3 G3].31 [E3 G3].31 | B2.5 [D3 G3].31 [D3 G3].31 | C3.5 [E3 G3].31 [E3 G3].31 | B2.5 [D3 G3].31 [D3 G3].31 | B2.5 [D3 G3].31 [D3 G3].31 | B2.5 [D3 G3].31 [D3 G3].31 | C3.5:hd',
                { meter: 3, chords: 'C . G C G . . C' },
              ),
              60,
              108,
              'Between C and G chords the thumb stays on G; fingers 5 and 3 each move down one key.',
            ),
            quiz('In a waltz bass, which beat gets the low bass note?', ['Beat 1', 'Beat 2', 'Beat 3', 'Every beat'], 0),
          ],
        },
        {
          id: 'k-jingle',
          title: 'Jingle Bells',
          goal: 'Play a familiar tune with dotted rhythms over three left-hand chords.',
          minutes: 15,
          steps: [
            text(
              'Three chords, small moves',
              'The right hand stays in C position throughout. The left hand uses three chords chosen so the hand hardly moves:\n\n- **C**: C – E – G (5 – 3 – 1)\n- **F**: C – F – A (5 – 2 – 1). The little finger stays on C.\n- **G**: B – D – G (5 – 3 – 1). The thumb stays on G.\n\nWatch the rhythm in bars 3 and 5: a **dotted quarter note** followed by an **eighth**. Count "1, 2, 3 (and) **and** 4".',
            ),
            { t: 'keyboard', title: 'Left hand: F with C on the bottom', marks: km('_C3=5 _F3=2 _A3=1'), from: 43, to: 60 },
            exercise(
              'k-jingle1',
              'Jingle Bells (J. Pierpont, 1857)',
              keys(
                'E4.3 E4.3 E4.3:h | E4.3 E4.3 E4.3:h | E4.3 G4.5 C4.1:qd D4.2:8 | E4.3:w | F4.4 F4.4 F4.4:qd F4.4:8 | F4.4 E4.3 E4.3 E4.3:8 E4.3:8 | E4.3 D4.2 D4.2 E4.3 | D4.2:h G4.5:h',
                '[C3 E3 G3].531:w | [C3 E3 G3].531:w | [C3 E3 G3].531:w | [C3 E3 G3].531:w | [C3 F3 A3].521:w | [C3 E3 G3].531:w | [B2 D3 G3].531:w | [B2 D3 G3].531:w',
                { chords: 'C . . . F C G .' },
              ),
              66,
              112,
            ),
            quiz('Moving from the C chord to F (C – F – A) in the left hand, which finger stays put?', ['Thumb', 'Finger 3', 'Little finger', 'None'], 2),
          ],
        },
        {
          id: 'k-ties',
          title: 'Ties and long phrases',
          goal: 'Hold tied notes for their full length while the other hand changes.',
          minutes: 12,
          steps: [
            text(
              'Hold on',
              'A **tie** joins two notes of the same pitch into one longer sound: play the first, keep the key down, and do not play the second.\n\nThe hard part is not the tied hand but the other one. In this piece the left hand often plays a new bass note **while the right hand is still holding**. Keep the right-hand finger down and let it sing through the change.\n\nThink of each two-bar group as one **phrase**, like a line of a song: lift gently and "breathe" at the end of each.',
            ),
            exercise(
              'k-tide',
              'Slow Tide',
              keys(
                'C4.1:h E4.3:h- | E4.3 D4.2 C4.1:h | D4.2:h F4.4:h- | F4.4 E4.3 D4.2:h | E4.3:h G4.5:h- | G4.5 F4.4 E4.3:h | D4.2 E4.3 D4.2 C4.1- | C4.1:w',
                'C3.5:w | C3.5:w | G3.1:w | G3.1:w | C3.5:w | C3.5:w | G3.1:w | C3.5:w',
                { chords: 'C . G . C . G C' },
              ),
              60,
              96,
              'In step-by-step mode a tied note counts once: the app does not ask for it again.',
            ),
            quiz('Two notes of the same pitch are joined by a tie. How many times do you strike the key?', ['Once', 'Twice', 'Three times', 'It depends on the tempo'], 0),
          ],
        },
        {
          id: 'k-gpiece',
          title: 'A piece in G major',
          goal: 'Read a key signature and shift hand position in the middle of a piece.',
          minutes: 15,
          steps: [
            text(
              'One sharp, two positions',
              'The key signature has one sharp: **every F is F♯**, even though nothing is written next to the note.\n\nBars 1–4 sit in **G position**: right thumb on G, fingers 1–5 covering G A B C D.\n\nIn bar 5 the melody reaches down to F♯, so the whole hand **shifts down one key**: the thumb now plays F♯ and finger 2 takes over G. The finger numbers show the change. Move the hand as a unit during the long note that ends bar 4; do not stretch.\n\nThe left hand plays just two notes, G and D: the roots of the I and V chords.',
            ),
            { t: 'keyboard', title: 'Bars 1–4: G position', marks: km('G4=1 A4=2 B4=3 C5=4 D5=5'), from: 62, to: 76 },
            { t: 'keyboard', title: 'Bars 5–8: thumb on F♯', marks: km('*F#4=1 G4=2 A4=3 B4=4'), from: 62, to: 76, caption: 'The whole hand has moved one key to the left.' },
            exercise(
              'k-gpiece1',
              'Morning in G',
              keys(
                'G4.1 B4.3 D5.5 B4.3 | C5.4 B4.3 A4.2:h | B4.3 A4.2 G4.1 A4.2 | G4.1:w | G4.2 F#4.1 G4.2 A4.3 | B4.4 A4.3 G4.2:h | A4.3 G4.2 F#4.1 A4.3 | G4.2:w',
                'G2.5:w | D3.1:w | G2.5:h D3.1:h | G2.5:w | G2.5:w | G2.5:w | D3.1:w | G2.5:w',
                { key: 'G', chords: 'G D G . G . D G' },
              ),
              60,
              104,
            ),
            text(
              'Where to go from here',
              'You have now played in two time signatures, read a key signature, held ties and moved your hand mid-piece. That is the toolkit for most easy sheet music.\n\n- Pick up a book of easy arrangements and read one new piece a week, hands separately first.\n- Keep one scale and one chord pattern in your daily warm-up.\n- Use **Jam** to improvise right-hand melodies over a backing track, and **Explore** to look up any chord a song throws at you.',
            ),
            quiz('The key signature has one sharp. You see an F with nothing written beside it. What do you play?', ['F', 'F♯', 'G', 'E'], 1),
          ],
        },
      ],
    },
  ],
}

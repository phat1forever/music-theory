// Keyboard studio units (open to everyone, for players whose skills are uneven) and the shared ear-training lessons.
import { keys, type PieceOpts } from '../theory/music'
import { exercise, km, quiz, text, type Unit } from './types'

const lh = (src: string, barCount: number, opts?: PieceOpts) => keys(Array(barCount).fill(opts?.meter === 3 ? 'r:hd' : 'r:w').join(' '), src, opts)
const alberti = (low: string, top: string, mid: string) => `${low}:8 ${top}:8 ${mid}:8 ${top}:8 ${low}:8 ${top}:8 ${mid}:8 ${top}:8`

export const keysStudio: Unit[] = [
  {
    id: 'ks-tech',
    title: 'Studio: technique',
    level: 'Intermediate',
    free: true,
    skill: 'technique',
    about: 'Harmonic minor scales, new keys with black-key starts, and sixteenth notes.',
    lessons: [
      {
        id: 'k-i-harm',
        title: 'Harmonic minor scales',
        goal: 'Play A and D harmonic minor, and A harmonic minor with both hands.',
        minutes: 15,
        related: ['th-harmonic'],
        steps: [
          text(
            'The raised seventh under your fingers',
            'The **harmonic minor** scale is the natural minor with its **7th note raised a half step**: in A minor, G becomes **G♯**. The fingering does not change (right hand 1 2 3 – 1 2 3 4 5, left hand 5 4 3 2 1 – 3 2 1), but finger 4 of the right hand now reaches up to a black key, and the gap between F and G♯ is a step and a half: let the hand **open slightly** rather than stretching the fingers.\n\nThe key signature of A minor is empty, so the G♯ is written in as an accidental every time.',
          ),
          {
            t: 'keyboard',
            title: 'A harmonic minor, right hand',
            marks: km('A3=1 B3=2 C4=3 *D4=1 E4=2 F4=3 G#4=4 A4=5'),
            from: 55,
            to: 71,
            caption: 'The orange key is where the thumb tucks under. Finger 4 plays G♯.',
          },
          exercise(
            'k-harm-rh',
            'A harmonic minor, right hand',
            keys('A3.1 B3.2 C4.3 D4.1 | E4.2 F4.3 G#4.4 A4.5 | A4.5 G#4.4 F4.3 E4.2 | D4.1 C4.3 B3.2 A3.1', undefined, { key: 'Am' }),
            60,
            104,
          ),
          exercise(
            'k-harm-par',
            'A harmonic minor, hands together',
            keys(
              'A3.1 B3.2 C4.3 D4.1 | E4.2 F4.3 G#4.4 A4.5 | A4.5 G#4.4 F4.3 E4.2 | D4.1 C4.3 B3.2 A3.1',
              'A2.5 B2.4 C3.3 D3.2 | E3.1 F3.3 G#3.2 A3.1 | A3.1 G#3.2 F3.3 E3.1 | D3.2 C3.3 B2.4 A2.5',
              { key: 'Am' },
            ),
            50,
            88,
            'The hands shift at different moments. Going up, the right thumb tucks under after C; in the left hand, finger 3 crosses over the thumb after E. Practise each hand alone first.',
          ),
          exercise(
            'k-harm-d',
            'D harmonic minor, right hand',
            keys('D4.1 E4.2 F4.3 G4.1 | A4.2 Bb4.3 C#5.4 D5.5 | D5.5 C#5.4 Bb4.3 A4.2 | G4.1 F4.3 E4.2 D4.1', undefined, { key: 'Dm' }),
            60,
            104,
            'One flat in the key signature (B♭), plus the raised 7th, C♯: two black keys next to each other under fingers 3 and 4.',
          ),
          quiz('Which note is raised in D harmonic minor?', ['B♭ becomes B', 'C becomes C♯', 'F becomes F♯', 'G becomes G♯'], 1),
        ],
      },
      {
        id: 'k-i-keys',
        title: 'New keys: D major and B♭ major',
        goal: 'Play scales and the three main chords in a sharp key and a flat key.',
        minutes: 15,
        related: ['th-keys'],
        steps: [
          text(
            'Two sharps',
            '**D major** has two sharps, **F♯ and C♯**. The fingering is the same as C major in both hands: the black keys simply fall under fingers 3 and 4 of the right hand, which suits the shape of the hand well. Many pianists find D major more comfortable than C.',
          ),
          exercise(
            'k-d-rh',
            'D major, right hand',
            keys('D4.1 E4.2 F#4.3 G4.1 | A4.2 B4.3 C#5.4 D5.5 | D5.5 C#5.4 B4.3 A4.2 | G4.1 F#4.3 E4.2 D4.1', undefined, { key: 'D' }),
            60,
            108,
            'Two sharps in the key signature: every F and every C is sharp.',
          ),
          exercise(
            'k-d-lh',
            'D major, left hand',
            lh('D3.5 E3.4 F#3.3 G3.2 | A3.1 B3.3 C#4.2 D4.1 | D4.1 C#4.2 B3.3 A3.1 | G3.2 F#3.3 E3.4 D3.5', 4, { key: 'D' }),
            60,
            108,
          ),
          exercise(
            'k-d-chords',
            'D – G – A – D, close position',
            keys('[D4 F#4 A4].135:w | [D4 G4 B4].135:w | [C#4 E4 A4].125:w | [D4 F#4 A4].135:w', 'D3.5:w | G2.5:w | A2.5:w | D3.5:w', { key: 'D', chords: 'D G A D' }),
            60,
            96,
            'The same hand moves you learned in C: keep the bottom note for the IV chord, drop a half step for the V.',
          ),
          text(
            'Starting on a black key',
            '**B♭ major** has two flats, **B♭ and E♭**, and it starts on a black key, so the fingering changes: the thumb never plays a black key in a scale.\n\n- **Right hand: 2 1 2 3 – 1 2 3 4.** Start with finger 2 on B♭; the thumb takes C and then F.\n- **Left hand: 3 2 1 – 4 3 2 1 – 3.** Start with finger 3 on B♭; finger 4 crosses over to E♭.\n\nThe rule behind every flat-key fingering: **long fingers on black keys, thumbs on white keys.**',
          ),
          {
            t: 'keyboard',
            title: 'B♭ major, right hand',
            marks: km('Bb3=2 *C4=1 D4=2 Eb4=3 *F4=1 G4=2 A4=3 Bb4=4'),
            from: 57,
            to: 72,
            caption: 'Orange keys are the thumb: C and F.',
          },
          exercise(
            'k-bb-rh',
            'B♭ major, right hand',
            keys('Bb3.2 C4.1 D4.2 Eb4.3 | F4.1 G4.2 A4.3 Bb4.4 | Bb4.4 A4.3 G4.2 F4.1 | Eb4.3 D4.2 C4.1 Bb3.2', undefined, { key: 'Bb' }),
            56,
            100,
          ),
          exercise(
            'k-bb-lh',
            'B♭ major, left hand',
            lh('Bb2.3 C3.2 D3.1 Eb3.4 | F3.3 G3.2 A3.1 Bb3.3 | Bb3.3 A3.1 G3.2 F3.3 | Eb3.4 D3.1 C3.2 Bb2.3', 4, { key: 'Bb' }),
            56,
            100,
          ),
          quiz('Why does the right hand start B♭ major with finger 2?', ['To keep the thumb off the black key', 'Finger 2 is stronger', 'To play louder', 'It is optional'], 0),
          quiz('Which two notes are sharp in D major?', ['F and C', 'F and G', 'C and G', 'B and E'], 0),
        ],
      },
      {
        id: 'k-i-16',
        title: 'Sixteenth notes and dotted rhythms',
        goal: 'Play even sixteenth-note runs and the dotted "long–short" rhythm.',
        minutes: 12,
        related: ['th-rhythm'],
        steps: [
          text(
            'Four to a beat',
            'A **sixteenth note** is half an eighth note: four to a beat, counted "**1** e & a **2** e & a". Runs of sixteenths should sound like a string of pearls: all the same size. Keep the fingers close to the keys and the wrist loose, and practise slowly enough to hear every note.\n\nA **dotted eighth note followed by a sixteenth** shares one beat three-to-one: "**1** (e &) **a**". It is the skipping, long–short rhythm of marches and many folk tunes. Say "**long**–short, **long**–short".',
          ),
          exercise(
            'k-16a',
            'Runs and skips',
            keys(
              'C4.1:16 D4.2:16 E4.3:16 F4.4:16 G4.5 F4.4:16 E4.3:16 D4.2:16 C4.1:16 D4.2 | E4.3:16 F4.4:16 G4.5:16 F4.4:16 E4.3 D4.2:16 E4.3:16 F4.4:16 E4.3:16 D4.2 | C4.1:8d E4.3:16 G4.5:8d E4.3:16 C4.1:8d E4.3:16 G4.5 | C4.1:w',
            ),
            50,
            84,
            'Bars 1 and 2 are sixteenth-note runs; bar 3 is the dotted rhythm.',
          ),
          exercise(
            'k-16b',
            'Sixteenths over a steady left hand',
            keys(
              'C4.1:16 D4.2:16 E4.3:16 F4.4:16 G4.5:16 F4.4:16 E4.3:16 D4.2:16 C4.1:16 D4.2:16 E4.3:16 F4.4:16 G4.5 | G4.5:16 F4.4:16 E4.3:16 D4.2:16 C4.1:16 D4.2:16 E4.3:16 F4.4:16 G4.5:16 F4.4:16 E4.3:16 D4.2:16 C4.1 | [C4 E4 G4].135:w',
              'C3.5 G3.1 C3.5 G3.1 | C3.5 G3.1 C3.5 G3.1 | C3.5:w',
            ),
            46,
            76,
            'Four right-hand notes to each left-hand note. The left hand is the clock: keep it steady and fit the right hand to it.',
          ),
          quiz('How many sixteenth notes fill one beat?', ['2', '3', '4', '8'], 2),
          quiz('A dotted eighth note plus a sixteenth note together last…', ['Half a beat', 'One beat', 'One and a half beats', 'Two beats'], 1),
        ],
      },
    ],
  },
  {
    id: 'ks-acc',
    title: 'Studio: chords and accompaniment',
    level: 'Intermediate',
    free: true,
    skill: 'chords',
    about: 'Smooth chord changes in any key, seventh-chord shells, and rhythm patterns for accompanying songs.',
    lessons: [
      {
        id: 'k-i-voice',
        title: 'Voice leading',
        goal: 'Move between chords by the shortest path, with triads and with seventh-chord shells.',
        minutes: 15,
        related: ['th-progressions', 'th-sevenths'],
        steps: [
          text(
            'The shortest path',
            'Think of each note of a chord as a singer in a choir. Good **voice leading** means no singer jumps when a small move will do:\n\n- **Keep** any note the two chords share.\n- **Move** the others to the **nearest** note of the new chord, usually a step.\n\nThe result sounds smooth and is easier to play, because your hand hardly moves. Pianists do this by instinct after a while; it is the difference between "chords" and "accompaniment".',
          ),
          exercise(
            'k-vl1',
            'I – vi – IV – V in C',
            keys('[C4 E4 G4].135:w | [C4 E4 A4].135:w | [C4 F4 A4].135:w | [B3 D4 G4].125:w | [C4 E4 G4].135:w', 'C3.5:w | A2.5:w | F2.5:w | G2.5:w | C3.5:w', {
              chords: 'C Am F G C',
            }),
            60,
            96,
            'Watch how few notes change: one note from C to Am, one from Am to F. The left hand plays the roots.',
          ),
          exercise(
            'k-vl2',
            'The same in G',
            keys('[G4 B4 D5].135:w | [G4 B4 E5].135:w | [G4 C5 E5].135:w | [F#4 A4 D5].125:w | [G4 B4 D5].135:w', 'G2.5:w | E2.5:w | C3.5:w | D3.5:w | G2.5:w', {
              key: 'G',
              chords: 'G Em C D G',
            }),
            60,
            96,
            'Exactly the same hand movements, a fifth higher. One sharp in the key signature.',
          ),
          text(
            'Shells: the 3rd and the 7th',
            'In a seventh chord, two notes carry all the colour: the **3rd** (major or minor?) and the **7th**. Play just those two in the right hand over the **root** in the left and you have a **shell voicing**, the standard sound of jazz and soul piano.\n\nIn a **ii – V – I** something lovely happens: at each change **only one note moves, down a step**, and the other stays.',
          ),
          exercise(
            'k-vl3',
            'ii – V – I with shells',
            keys('[F4 C5].15:w | [F4 B4].14:w | [E4 B4].15:w | [E4 B4].15:w', 'D3.5:w | G2.5:w | C3.5:w | C3.5:w', { chords: 'Dm7 G7 Cmaj7 .' }),
            60,
            92,
            'Dm7: F and C. G7: the C drops to B. Cmaj7: the F drops to E.',
          ),
          quiz('In good voice leading, what happens to a note that two chords share?', ['It moves up an octave', 'It stays where it is', 'It is left out', 'It moves to the bass'], 1),
          quiz('Which two notes make up a shell voicing in the right hand?', ['Root and 5th', '3rd and 7th', '3rd and 5th', 'Root and octave'], 1),
        ],
      },
      {
        id: 'k-i-comp',
        title: 'Comping patterns',
        goal: 'Accompany a song with two rhythm patterns: bass-and-chord, and the 3+3+2 pop rhythm.',
        minutes: 15,
        steps: [
          text(
            'Being the band',
            '**Comping** is playing the chords of a song in a rhythm that supports a singer or soloist. The notes are easy: the skill is in the **rhythm** and in staying out of the way.\n\n**Pattern 1, bass and chord:** the left hand plays the root on beat 1 and the fifth on beat 3; the right hand answers with the chord on beats 2 and 4. It is the "boom-chick" of country, folk and early rock and roll.\n\n**Pattern 2, three-three-two:** the right hand plays the chord three times in a bar, on beat 1, the "and" of 2, and beat 4, over a held bass note. Counting eighth notes, the gaps are 3 + 3 + 2. It is one of the most used rhythms in pop.',
          ),
          exercise(
            'k-comp1',
            'Bass and chord',
            keys(
              'r [E4 G4 C5].135 r [E4 G4 C5].135 | r [F4 A4 C5].135 r [F4 A4 C5].135 | r [D4 G4 B4].135 r [D4 G4 B4].135 | [E4 G4 C5].135:w',
              'C3.5 r G3.1 r | F2.5 r C3.1 r | G2.5 r D3.1 r | C3.5:w',
              { chords: 'C F G C' },
            ),
            60,
            100,
            'The hands never play together until the last bar: left, right, left, right.',
          ),
          exercise(
            'k-comp2',
            'Three, three, two',
            keys(
              '[E4 G4 C5].135:qd [E4 G4 C5]:8- [E4 G4 C5] [E4 G4 C5] | [E4 A4 C5].135:qd [E4 A4 C5]:8- [E4 A4 C5] [E4 A4 C5] | [F4 A4 C5].135:qd [F4 A4 C5]:8- [F4 A4 C5] [F4 A4 C5] | [D4 G4 B4].135:qd [D4 G4 B4]:8- [D4 G4 B4] [D4 G4 B4] | [E4 G4 C5].135:w',
              'C3.5:w | A2.5:w | F2.5:w | G2.5:w | C3.5:w',
              { chords: 'C Am F G C' },
            ),
            60,
            96,
            'Count "1 2 & 3 4": the chords land on 1, the "&" of 2, and 4. The middle chord arrives early and is held across beat 3: that is the tie.',
          ),
          text(
            'Use it on a real song',
            'Take any song you know with three or four chords, look up its chord chart, and play it with one of these patterns while you **hum or sing the melody**. Choose close chord positions as in the voice-leading lesson. Then change pattern for the chorus: that contrast is most of what an arranger does.',
          ),
          quiz('In the bass-and-chord pattern, on which beats does the right hand play?', ['1 and 3', '2 and 4', 'Every beat', 'Only beat 1'], 1),
        ],
      },
    ],
  },
  {
    id: 'ks-rep',
    title: 'Studio: pieces and independent hands',
    level: 'Intermediate',
    free: true,
    skill: 'hands',
    about: 'A flowing left hand under a melody, and a first classic: the Minuet in G.',
    lessons: [
      {
        id: 'k-i-alberti',
        title: 'Alberti bass under a melody',
        goal: 'Keep an even broken-chord left hand going while the right hand sings.',
        minutes: 20,
        steps: [
          text(
            'A moving left hand',
            'Until now your left hand has mostly held notes or chords. In the **Alberti bass** it never stops: the notes of each chord are played **bottom, top, middle, top** in steady eighth notes. It is the sound of Mozart and Clementi, and of countless pop ballads.\n\nTwo things make it work:\n\n- **Rotate, do not lift.** Rock the hand gently from side to side, like turning a door handle. The fingers stay close to the keys.\n- **Keep it quiet.** The left hand is the accompaniment. The **thumb**, which plays every other note, must be the softest of all, or it will drown the melody.\n\nLearn the left hand alone until it runs by itself. Then add the right hand, which here has long notes so you can listen to the balance.',
          ),
          exercise(
            'k-alb-lh',
            'The left hand alone',
            lh(`${alberti('C3.5', 'G3.1', 'E3.3')} | ${alberti('B2.5', 'G3.1', 'D3.3')} | ${alberti('C3.5', 'A3.1', 'F3.2')} | [C3 E3 G3].531:w`, 4, { chords: 'C G F C' }),
            54,
            92,
            'C, then G with B on the bottom, then F with C on the bottom. The little finger and thumb barely move.',
          ),
          exercise(
            'k-alb1',
            'Sonatina Sketch',
            keys(
              'E4.3:h G4.5:h | F4.4 E4.3 D4.2:h | E4.3 F4.4 G4.5:h | D4.2:hd r | F4.4 E4.3 F4.4 G4.5 | E4.3:h C4.1:h | D4.2 F4.4 E4.3 D4.2 | C4.1:w',
              [
                alberti('C3.5', 'G3.1', 'E3.3'),
                alberti('B2.5', 'G3.1', 'D3.3'),
                alberti('C3.5', 'G3.1', 'E3.3'),
                alberti('B2.5', 'G3.1', 'D3.3'),
                alberti('C3.5', 'A3.1', 'F3.2'),
                alberti('C3.5', 'G3.1', 'E3.3'),
                alberti('B2.5', 'G3.1', 'D3.3'),
                '[C3 E3 G3].531:w',
              ].join(' | '),
              { chords: 'C G C G F C G C' },
            ),
            50,
            88,
            'Use "Left hand only" and "Right hand only" first. When together, listen: can you hear the tune clearly above the left hand?',
          ),
          quiz('In what order does an Alberti bass play the notes of a chord?', ['Bottom, middle, top, middle', 'Bottom, top, middle, top', 'Top, middle, bottom, middle', 'All together'], 1),
          quiz('Which left-hand finger should be the quietest in an Alberti bass?', ['The little finger', 'The thumb', 'Finger 3', 'They should all be loud'], 1),
        ],
      },
      {
        id: 'k-i-minuet',
        title: 'A first classic: Minuet in G',
        goal: 'Play the opening eight bars of the Minuet in G, hands together.',
        minutes: 25,
        related: ['th-rests', 'th-keys'],
        steps: [
          text(
            'About the piece',
            'This minuet comes from the notebook that J. S. Bach began for his wife, Anna Magdalena, in 1725. It was long thought to be by Bach; it is now credited to **Christian Petzold**. It has been a first "real" piece for piano students for well over a century.\n\nA **minuet** is a graceful dance in **3/4**: feel a gentle lean on beat 1 of each bar. The key is **G major**, so every F is **F♯**.\n\nWhat makes it a step up:\n\n- The right hand mixes **quarter notes and eighth notes** and leaves the five-finger position: watch the finger numbers, especially in bar 7, where finger 2 crosses **over** the thumb to reach F♯.\n- The **two hands have different rhythms** in nearly every bar.\n\nIt assumes you know the **G major scale** and have played pieces **hands together** (the keyboard path\'s units 2 and 4). If either is new, do those first: this piece will still be here.\n\nThe left hand here is slightly simplified from the original.',
          ),
          exercise(
            'k-min-rh',
            'Minuet in G: right hand',
            keys(
              'D5.5 G4.1:8 A4.2:8 B4.3:8 C5.4:8 | D5.5 G4.1 G4.1 | E5.3 C5.1:8 D5.2:8 E5.3:8 F#5.4:8 | G5.5 G4.1 G4.1 | C5.4 D5.5:8 C5.4:8 B4.3:8 A4.2:8 | B4.3 C5.4:8 B4.3:8 A4.2:8 G4.1:8 | F#4.2 G4.1:8 A4.2:8 B4.3:8 G4.1:8 | A4.2:hd',
              undefined,
              { meter: 3, key: 'G' },
            ),
            60,
            104,
            'Learn bars 1 to 4, then bars 5 to 8, using Bars and Loop. In bar 3 the hand moves up: the thumb takes C.',
          ),
          exercise(
            'k-min1',
            'Minuet in G: hands together',
            keys(
              'D5.5 G4.1:8 A4.2:8 B4.3:8 C5.4:8 | D5.5 G4.1 G4.1 | E5.3 C5.1:8 D5.2:8 E5.3:8 F#5.4:8 | G5.5 G4.1 G4.1 | C5.4 D5.5:8 C5.4:8 B4.3:8 A4.2:8 | B4.3 C5.4:8 B4.3:8 A4.2:8 G4.1:8 | F#4.2 G4.1:8 A4.2:8 B4.3:8 G4.1:8 | A4.2:hd',
              'G3.5:h A3.4 | B3.3:hd | C4.2:hd | B3.3:hd | A3.4:hd | G3.5:hd | D4.1 B3.2 G3.4 | D4.1 D3.5:8 C4.1:8 B3.2:8 A3.3:8',
              { meter: 3, key: 'G' },
            ),
            50,
            96,
            'Mostly one left-hand note per bar under a moving right hand. Bar 8 hands the eighth notes to the left hand, leading back to the start.',
          ),
          text(
            'Playing it like music',
            'When the notes are secure: play the two repeated quarter notes in bars 2 and 4 **lightly and a little detached**, shape each two-bar phrase with a gentle rise and fall, and keep the left hand softer than the right. The full piece continues for another 24 bars; any beginner\'s anthology of Baroque keyboard music has it, and you now have the skills to read the rest.',
          ),
          quiz('What is the time signature of a minuet?', ['2/4', '3/4', '4/4', '6/8'], 1),
          quiz('In bar 7, how does the right hand reach the F♯ below the thumb?', ['The thumb plays it', 'Finger 2 crosses over the thumb', 'The left hand plays it', 'It is left out'], 1),
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------------------------
// Ear training lessons (in the theory track, open to everyone)
// ---------------------------------------------------------------------------------------------

export const earUnit: Unit = {
  id: 'te',
  title: 'Studio: ear training',
  level: 'Intermediate',
  free: true,
  skill: 'ear',
  about: 'How to hear intervals, chord colours and melodies, with drills that keep score. Useful at every level.',
  lessons: [
    {
      id: 'e-intervals',
      title: 'Hearing intervals',
      goal: 'Know what to listen for in each interval, and start a daily habit of naming them.',
      minutes: 10,
      related: ['th-intervals'],
      steps: [
        text(
          'Why train your ear',
          'Every skill in this app gets easier with a better ear: finding a tune on your instrument, hearing when a chord changes, knowing whether your bend reached the note, learning songs from recordings. The ear is trained like a muscle: **a few minutes most days** beats an hour once a week, and it works at any age.\n\nAn **interval** is the distance between two notes, and it is the atom of everything you hear. Each one has a character:\n\n- **Seconds** (1 or 2 half steps): neighbours. A minor 2nd grinds; a major 2nd is the start of a scale.\n- **Thirds** (3 or 4): sweet. The minor 3rd is sad, the major 3rd bright. They are the bottom of minor and major chords.\n- **Perfect 4th** (5) and **perfect 5th** (7): open and strong, like a fanfare. The 5th is the sound of a power chord.\n- **Tritone** (6): restless, unsettled.\n- **Sixths** (8 or 9): wide and warm. **Sevenths** (10 or 11): wide and tense.\n- **Octave** (12): the same note, higher.',
        ),
        text(
          'Three things that help',
          '- **Sing it.** Sing the lower note, then the upper one. If you can sing an interval you can recognise it. It does not matter what your voice sounds like.\n- **Use a tune you know.** Many people fix an interval to the first two notes of a song: a perfect 4th starts "Amazing Grace" and "Here Comes the Bride"; a perfect 5th starts "Twinkle, Twinkle, Little Star"; a major 6th starts "My Bonnie Lies over the Ocean"; an octave starts "Somewhere over the Rainbow". Choose your own.\n- **Start small.** Begin with five intervals (minor and major 3rd, 4th, 5th, octave), and add more when you score eight out of ten.\n\nNow open the [Intervals drill](#/ear/intervals) and do ten questions. Come back to it for two minutes a day.',
        ),
        quiz('How many half steps are in a major 3rd?', ['3', '4', '5', '7'], 1),
        quiz('What is the most effective way to practise ear training?', ['One long session a month', 'A few minutes most days', 'Only before a performance', 'By reading about it'], 1),
      ],
    },
    {
      id: 'e-chords',
      title: 'Hearing chords and progressions',
      goal: 'Tell major from minor by ear, and recognise the most common chord progressions.',
      minutes: 10,
      related: ['th-triads', 'th-progressions'],
      steps: [
        text(
          'Colour first',
          'Do not try to pick out the separate notes of a chord at first. Listen to its **colour**, the way you recognise a face without measuring it:\n\n- **Major**: bright, settled, "happy".\n- **Minor**: darker, "sad" or serious.\n- **Diminished**: tense and cramped, wants to move.\n- **Augmented**: strange, floating, unresolved.\n- **Dominant 7th**: major with an edge, bluesy; it leans forward. **Major 7th**: dreamy. **Minor 7th**: mellow.\n\nThen check yourself by **singing the notes from the bottom up**: if the second note is close to the first (3 half steps), the chord is minor.\n\nTry the [Chords drill](#/ear/chords), starting with just major and minor.',
        ),
        text(
          'Hearing where the chords go',
          'In a song, listen to the **bass**: the lowest note usually names the chord. Then listen for **home**. The I chord feels like arriving; the **V** chord feels like the moment just before; the **IV** feels like moving away; the **vi** is the sad relative of home.\n\nA few progressions account for a huge share of popular music, so it is worth knowing their sound:\n\n- **I – IV – V – I**: folk, blues, rock and roll.\n- **I – V – vi – IV**: the pop "four chords".\n- **I – vi – IV – V**: the 1950s.\n- **ii – V – I**: jazz.\n\nThe [Progressions drill](#/ear/progressions) plays them in different keys. Next time a song comes on, try to name its pattern.',
        ),
        quiz('You hear a chord that sounds dark and serious. It is most likely…', ['Major', 'Minor', 'Augmented', 'A power chord'], 1),
        quiz('In a song, which part most reliably tells you which chord is being played?', ['The drums', 'The bass note', 'The highest note', 'The lyrics'], 1),
      ],
    },
    {
      id: 'e-playback',
      title: 'Playing back what you hear',
      goal: 'Follow a method for finding any short melody on your instrument by ear.',
      minutes: 12,
      related: ['th-major'],
      steps: [
        text(
          'From the ear to the hands',
          'Playing by ear is not a gift: it is a method plus practice. For any short tune:\n\n- **Listen** until you can **sing or hum** it. If you cannot sing it, you have not really heard it yet.\n- **Find the home note** (the tonic): the note the tune could comfortably end on. Hum it and hunt for it on your instrument.\n- **Find the first note** of the tune, relative to home.\n- **Follow the shape.** Does the next note go **up, down or stay**? By a **step** (the next note of the scale) or a **leap**? Most melodies move mostly by step, with the occasional leap between chord notes.\n- **Check** by playing it back, and fix one note at a time.\n\nThe tune will almost always use the notes of **one scale**. Once you know home, the major (or minor) scale from that note is your short list: seven notes instead of twelve.',
        ),
        text(
          'Train it',
          'The [Play it back](#/ear/echo) drill plays a short phrase and waits for you to play it, on your real instrument through the microphone or a MIDI keyboard, or by tapping the on-screen keys or fretboard. It starts with three notes and grows.\n\nAway from the app, do the same with real music: pick the first line of a tune you have known since childhood and find it. Then a riff from a song you like. Slowly at first, this becomes the skill that lets you **learn songs straight from recordings**, which is how most of the players you admire learned.',
        ),
        quiz('What is the first step in working out a tune by ear?', ['Guess notes until one fits', 'Listen until you can sing or hum it', 'Look up the sheet music', 'Play all twelve notes'], 1),
        quiz('How do most melodies move from note to note?', ['Mostly by step, with some leaps', 'Only in big leaps', 'At random', 'Always upward'], 0),
      ],
    },
  ],
}

// Guitar: the fuller barre-chord sequence, the fingerpicking unit, and the open "studio" units for intermediate players.
import { gtr } from '../theory/music'
import { exercise, fm, quiz, text, type Lesson, type Unit } from './types'

const rep = (bar: string, times: number) => Array(times).fill(bar).join(' | ')

// ---------------------------------------------------------------------------------------------
// Barre chords: lessons that go around the existing "F and Bm" lesson
// ---------------------------------------------------------------------------------------------

export const barrePartial: Lesson = {
  id: 'g-barre-partial',
  title: 'Small barres first',
  goal: 'Hold two strings with one finger, and play F without the full barre.',
  minutes: 12,
  steps: [
    text(
      'Why barre chords feel impossible, and why they are not',
      'A full barre asks one finger to hold six strings while three others make a shape. Almost nobody gets a clean one in the first week. The way through is to **build up to it**:\n\n- **Fmaj7**: no barre at all. Three fingers and an open top string.\n- **Small F**: the first finger lies flat across the **two thinnest strings**. This is a *partial barre*.\n- **Full F**: the same idea across all six (next lesson).\n\nThe small F is a real chord that you can use in songs straight away, and many players keep using it for life.',
    ),
    { t: 'chords', names: ['Fmaj7', 'Fsmall', 'C'], caption: 'Fmaj7 and the small F differ by one thing: the first finger flattens to cover two strings. Only the top four strings are played.' },
    text(
      'How to flatten a finger',
      '- Place fingers 3 and 2 first, then let finger 1 **collapse at its top joint** so its pad covers strings 1 and 2.\n- Keep it **close to the fret wire**: that needs far less pressure.\n- Roll the finger very slightly onto its **bony outer edge**.\n- Thumb behind the neck, roughly opposite finger 1, and let the **weight of your arm** pull back gently. Do not squeeze.\n\nPick the strings one at a time. If the 1st string buzzes, move the finger a millimetre toward the fret or roll it a little more.',
    ),
    exercise(
      'g-bp1',
      'Fmaj7 to small F',
      gtr('{Fmaj7}:h {Fsmall}:h | {C}:h {Fsmall}:h | {Fmaj7}:h {Fsmall}:h | {C}:w', { chords: 'F C F C' }),
      56,
      92,
      'Fingers 2 and 3 stay in the same place for Fmaj7 and F. Only finger 1 changes.',
    ),
    exercise(
      'g-bp2',
      'C – F – G with the small F',
      gtr('{C}:h {C}:h | {Fsmall}:h {Fsmall}:h | {G}:h {G}:h | {C}:w', { chords: 'C F G C' }),
      60,
      100,
      'The three main chords of the key of C. Strum only the top four strings on F.',
    ),
    text(
      'A plan for the next few weeks',
      'Barre strength comes from **short, frequent** practice, not long sessions: two minutes, three times a day, beats one twenty-minute struggle. Stop when your hand aches, shake it out, and come back later. Carry on with other lessons in the meantime; the barre will arrive.',
    ),
    quiz('What is a partial barre?', ['One finger holding two or three strings', 'A chord with open strings only', 'A barre played with finger 4', 'Half a strum'], 0),
    quiz('What is the best way to build barre strength?', ['One long session a week', 'Short sessions several times a day', 'Squeezing as hard as possible', 'Waiting until your hands are bigger'], 1),
  ],
}

export const barreE: Lesson = {
  id: 'g-barre-e',
  title: 'The E shape, all along the neck',
  goal: 'Play any major, minor or seventh chord from a root on the 6th string.',
  minutes: 15,
  related: ['th-triads'],
  steps: [
    text(
      'One shape, twelve chords',
      'The full F chord is an open **E shape** pushed up one fret, with your first finger standing in for the nut. Slide it and the chord changes name. The name comes from the **note under your barre on the 6th string**:\n\n- fret 1 **F** · fret 3 **G** · fret 5 **A** · fret 7 **B** · fret 8 **C** · fret 10 **D**\n\nThe frets in between are the sharps and flats (fret 2 is F♯, fret 4 is A♭, fret 6 is B♭).',
    ),
    {
      t: 'fretboard',
      title: 'Roots on the 6th string',
      marks: fm('*6/1=F *6/3=G *6/5=A *6/7=B *6/8=C *6/10=D'),
      from: 0,
      to: 12,
      caption: 'Wherever the barre sits, this note names the chord.',
    },
    { t: 'chords', names: ['F', 'Gbarre', 'Abarre'], caption: 'The same hand shape at frets 1, 3 and 5. The small number beside a diagram is the fret where it starts.' },
    exercise(
      'g-be1',
      'E shape up the neck',
      gtr('{F}:w | {Gbarre}:w | {Abarre}:w | {Gbarre}:w', { chords: 'F G A G' }),
      56,
      88,
      'Release the pressure slightly as you slide, keep the shape, and squeeze again when you arrive.',
    ),
    text(
      'One finger changes everything',
      'From the major shape, small changes give you the other chord types, exactly as they did for the open E chords:\n\n- **Minor**: lift finger 2. The barre now holds the 3rd string too.\n- **Seventh (7)**: lift finger 4.\n- **Minor seventh (m7)**: lift fingers 2 and 4. Only finger 3 is left in front of the barre.\n\nFour chord types at twelve frets: 48 chords from one shape.',
    ),
    { t: 'chords', names: ['F', 'Fm', 'F7', 'Fm7'], caption: 'Tap each one and listen for the change of colour.' },
    exercise(
      'g-be2',
      'Major and minor',
      gtr('{Gbarre}:h {Gm}:h | {Gbarre}:h {Gm}:h | {F}:h {Fm}:h | {F}:w', { chords: 'G G F F' }),
      56,
      88,
      'Only finger 2 moves. Check that the 3rd string still rings when it lifts.',
    ),
    exercise(
      'g-be3',
      'Four colours from one shape',
      gtr('{F}:h {F7}:h | {Fm}:h {Fm7}:h | {F}:h {F7}:h | {Fm7}:w', { chords: 'F Fm F Fm7' }),
      56,
      88,
    ),
    quiz('You play the E-shape barre with the barre on the 7th fret. Which chord is it?', ['A', 'B', 'C', 'D'], 1, 'The 6th string at fret 7 is B.'),
    quiz('How do you turn an E-shape major barre chord into a minor one?', ['Lift finger 2', 'Lift finger 3', 'Move up one fret', 'Add finger 4'], 0),
  ],
}

export const barreA: Lesson = {
  id: 'g-barre-a',
  title: 'The A shape: roots on the 5th string',
  goal: 'Play barre chords from the 5th string, and combine both shapes to play in any key.',
  minutes: 15,
  steps: [
    text(
      'The second movable shape',
      'B and Bm are open **A shapes** pushed up two frets. Their root is on the **5th string**, and the 6th string is not played:\n\n- fret 1 **B♭** · fret 2 **B** · fret 3 **C** · fret 5 **D** · fret 7 **E**\n\nIn the major shape, fingers 2, 3 and 4 line up on one fret (many players flatten finger 3 across those three strings instead). The minor shape is the open Am shape in front of the barre.',
    ),
    { t: 'chords', names: ['Bb', 'B', 'Cbarre', 'Dbarre'], caption: 'Major chords from the 5th string. Mute the 6th string with the tip of finger 1.' },
    exercise(
      'g-ba1',
      'A shape up the neck',
      gtr('{Bb}:w | {Cbarre}:w | {Dbarre}:w | {Cbarre}:w', { chords: 'Bb C D C' }),
      56,
      88,
      undefined,
      true,
    ),
    { t: 'chords', names: ['Bm', 'Cm', 'Dmbarre', 'Embarre'], caption: 'Minor chords from the 5th string.' },
    text(
      'Two shapes, every key',
      'With one shape rooted on the 6th string and one on the 5th, the three main chords of any key sit **within two frets of each other**. In G: **G** is the E shape at fret 3, **C** is the A shape at fret 3, **D** is the A shape at fret 5. Move the whole group up two frets and you are in A. That is how rhythm players handle any key without a capo.',
    ),
    exercise(
      'g-ba2',
      'I – IV – V in G, all barre chords',
      gtr('{Gbarre}:h {Gbarre}:h | {Cbarre}:h {Cbarre}:h | {Dbarre}:h {Dbarre}:h | {Gbarre}:w', { chords: 'G C D G' }),
      56,
      92,
      'G to C: the barre stays on fret 3 and the hand changes shape. C to D: the shape stays and slides up two frets.',
    ),
    exercise(
      'g-ba3',
      'Am – Dm – Em around the 5th fret',
      gtr('{Ambarre}:h {Ambarre}:h | {Dmbarre}:h {Dmbarre}:h | {Embarre}:h {Embarre}:h | {Ambarre}:w', { chords: 'Am Dm Em Am' }),
      56,
      92,
    ),
    text(
      'Using them in real songs',
      'You rarely play barre chords all the way through a song. Mix them with open chords, and use them where they are needed: for F, B♭ and Bm, for keys with no open chords, and when you want a tight, **short** sound (release the pressure right after the strum to cut the chord off, which open chords cannot do).\n\nIf a chord will not ring after two weeks of daily practice, ask a teacher or a guitar shop to check the height of your strings: a high **action** makes barre chords far harder than they should be.',
    ),
    quiz('You play the A-shape barre with the barre on the 3rd fret. Which chord is it?', ['B♭', 'B', 'C', 'D'], 2, 'The 5th string at fret 3 is C.'),
    quiz('In the key of G using barre chords, where is the IV chord (C)?', ['A shape at fret 3', 'E shape at fret 5', 'A shape at fret 7', 'E shape at fret 1'], 0),
  ],
}

/** Extra exercise for the existing "F and Bm" lesson, so Bm is actually played. */
export const bmExercise = exercise(
  'g-barre2',
  'D – Bm – G – A',
  gtr('{D}:h {D}:h | {Bm}:h {Bm}:h | {G}:h {G}:h | {A}:h {A}:h', { chords: 'D Bm G A' }),
  56,
  96,
  'One barre chord among three open ones, the way it usually turns up in songs.',
)

// ---------------------------------------------------------------------------------------------
// Fingerpicking unit
// ---------------------------------------------------------------------------------------------

const roll = (bass: string, g: number, b: number, e: number) => `${bass}:8 3/${g}:8 2/${b}:8 1/${e}:8`
const rollPima = (bass: string, g: number, b: number, e: number) => `${bass}:8~p 3/${g}:8~i 2/${b}:8~m 1/${e}:8~a`
const waltzRoll = (bass: string, g: number, b: number, e: number) => `${bass}:8 3/${g}:8 2/${b}:8 1/${e}:8 2/${b}:8 3/${g}:8`
const travis = (b1: string, b2: string, g: number, b: number) => `${b1}:8 2/${b}:8 ${b2}:8 3/${g}:8 ${b1}:8 2/${b}:8 ${b2}:8 3/${g}:8`
const pinch = (bass: string, top: number, g: number, b: number, bass2: string) => `[${bass} 1/${top}] 3/${g}:8 2/${b}:8 ${bass2} 3/${g}:8 2/${b}:8`

export const fingerpicking: Unit = {
  id: 'gfp',
  title: 'Fingerpicking',
  level: 'Late beginner',
  skill: 'fingerstyle',
  about: 'Put the pick down: arpeggios with thumb and fingers, the alternating-thumb pattern, and a first fingerstyle piece.',
  placement: {
    q: 'In fingerpicking, the letters p, i, m, a stand for…',
    options: ['Thumb, index, middle, ring', 'Pick, index, mute, accent', 'Pinky, index, middle, all', 'Four kinds of strum'],
    answer: 0,
  },
  placement2: {
    q: 'In Travis picking, what does the thumb do?',
    options: ['Rests on the guitar', 'Alternates between two bass strings on every beat', 'Plays the melody on the top string', 'Strums all six strings'],
    answer: 1,
  },
  check: {
    title: 'Arpeggios on Em and Am',
    piece: gtr(`${roll('6/0', 0, 0, 0)} ${roll('6/0', 0, 0, 0)} | ${roll('5/0', 2, 1, 0)} ${roll('5/0', 2, 1, 0)}`, { chords: 'Em Am' }),
    tempo: 66,
  },
  lessons: [
    {
      id: 'g-fp-basics',
      title: 'Thumb and fingers: p i m a',
      goal: 'Set up your picking hand and play a steady four-note roll over two chords.',
      minutes: 12,
      steps: [
        text(
          'A new right hand',
          'Fingerpicking (fingerstyle) plays the strings with the thumb and fingers instead of a pick. It lets you play a bass line and the chord at the same time, and it is the sound of folk, classical and a great deal of pop.\n\nThe fingers are named from Spanish: **p** = thumb, **i** = index, **m** = middle, **a** = ring. The little finger is not used.\n\n**Home position** for the next lessons:\n\n- **p** (thumb) looks after the three **bass strings**: 6, 5 and 4.\n- **i** plays the **3rd** string, **m** the **2nd**, **a** the **1st**.\n\nRest your forearm on the body of the guitar and let the hand hang loosely over the sound hole, wrist a little arched, thumb **ahead of** the fingers (toward the neck) so they do not collide. The thumb pushes **down** through the string; the fingers pull gently **up into the palm**. Move from the big knuckle, with small relaxed strokes.',
        ),
        exercise(
          'g-fp1',
          'p i m a on Em and Am',
          gtr(`${rollPima('6/0', 0, 0, 0)} ${rollPima('6/0', 0, 0, 0)} | ${rollPima('6/0', 0, 0, 0)} ${rollPima('6/0', 0, 0, 0)} | ${rollPima('5/0', 2, 1, 0)} ${rollPima('5/0', 2, 1, 0)} | ${rollPima('5/0', 2, 1, 0)} ${rollPima('5/0', 2, 1, 0)}`, {
            chords: 'Em . Am .',
          }),
          56,
          96,
          'Hold the chord shape with your fretting hand and let the notes ring into each other. For Am the thumb moves to the 5th string.',
        ),
        text(
          'The thumb chooses the bass',
          'The thumb plays the **root** of each chord, so it changes string as the chords change: the **6th** string for E, Em and G, the **5th** for A, Am and C, the **4th** for D and Dm. The fingers stay on their own three strings the whole time. That one rule covers most fingerpicking.',
        ),
        exercise(
          'g-fp2',
          'Three bass strings',
          gtr(`${roll('6/0', 0, 0, 0)} ${roll('6/0', 0, 0, 0)} | ${roll('5/0', 2, 1, 0)} ${roll('5/0', 2, 1, 0)} | ${roll('4/0', 2, 3, 2)} ${roll('4/0', 2, 3, 2)} | ${roll('5/0', 2, 1, 0)} ${roll('5/0', 2, 1, 0)}`, {
            chords: 'Em Am D Am',
          }),
          56,
          96,
          'Em, Am, D, Am. Watch the thumb: strings 6, 5, 4, 5.',
        ),
        quiz('Which strings does the thumb look after?', ['1, 2 and 3', '6, 5 and 4', 'Only the 6th', 'All six'], 1),
        quiz('Which finger plays the 2nd string in home position?', ['p', 'i', 'm', 'a'], 2),
      ],
    },
    {
      id: 'g-fp-arps',
      title: 'Arpeggio patterns',
      goal: 'Play rolling arpeggios in 3/4 and 4/4 through a chord progression.',
      minutes: 15,
      related: ['th-rests'],
      steps: [
        text(
          'Up and back',
          'An arpeggio pattern is simply an order of fingers repeated over every chord. Two patterns cover a huge number of songs:\n\n- **In 3/4** (six eighth notes): **p i m a m i**. Up to the top string and back down. Count "1 & 2 & 3 &".\n- **In 4/4** (eight eighth notes): thumb on the root, then walk **up through the strings and back**: for a chord rooted on the 5th string, strings 5 4 3 2 1 2 3 4, with the thumb playing strings 5 and 4.\n\nLearn the picking pattern on **one chord** until your hand does it without thought. Only then add the chord changes. If a change is late, keep the picking hand going and let the first note be an open string: nobody will notice.',
        ),
        exercise(
          'g-fp3',
          'Rolling arpeggio in 3/4',
          gtr(
            [
              waltzRoll('5/0', 2, 1, 0),
              waltzRoll('5/3', 0, 1, 0),
              waltzRoll('4/0', 2, 3, 2),
              waltzRoll('4/3', 2, 1, 0),
              waltzRoll('5/0', 2, 1, 0),
              waltzRoll('5/3', 0, 1, 0),
              waltzRoll('6/0', 1, 0, 0),
              waltzRoll('6/0', 1, 0, 0),
              '[5/0 3/2 2/1 1/0]:hd',
            ].join(' | '),
            { meter: 3, chords: 'Am C D Fmaj7 Am C E . Am' },
          ),
          56,
          100,
          'A minor-key progression in the style of a folk ballad. The F is the easy Fmaj7 shape with the thumb on the 4th string.',
        ),
        exercise(
          'g-fp4',
          'Eight-note pattern in 4/4',
          gtr(
            '5/0:8 4/2:8 3/2:8 2/1:8 1/0:8 2/1:8 3/2:8 4/2:8 | 5/3:8 4/2:8 3/0:8 2/1:8 1/0:8 2/1:8 3/0:8 4/2:8 | 6/3:8 4/0:8 3/0:8 2/0:8 1/3:8 2/0:8 3/0:8 4/0:8 | 6/0:8 4/2:8 3/0:8 2/0:8 1/0:8 2/0:8 3/0:8 4/2:8',
            { chords: 'Am C G Em' },
          ),
          56,
          96,
          'Am, C, G, Em. The thumb plays the first two notes of each bar and the last one.',
        ),
        quiz('In the 3/4 pattern p i m a m i, how many notes are in each bar?', ['3', '4', '6', '8'], 2),
        quiz('Your fretting hand is late for a chord change while fingerpicking. What should the picking hand do?', ['Stop and wait', 'Keep the pattern going', 'Strum instead', 'Play louder'], 1),
      ],
    },
    {
      id: 'g-fp-travis',
      title: 'Travis picking: the alternating thumb',
      goal: 'Keep a steady alternating bass with the thumb while the fingers fill in between.',
      minutes: 15,
      steps: [
        text(
          'The thumb is the drummer',
          'In **Travis picking** (named after Merle Travis) the thumb plays a bass note on **every beat**, swapping between **two bass strings**, like a bass player and drummer in one. The fingers add notes **in between** the beats. It is the engine behind a vast amount of folk, country and acoustic pop.\n\nThe thumb must become automatic before anything else is added, so start with the **thumb alone**. Count "1 2 3 4" and keep it as even as a clock.',
        ),
        exercise(
          'g-fp5',
          'Thumb alone',
          gtr('5/3 4/2 5/3 4/2 | 6/3 4/0 6/3 4/0 | 5/0 4/2 5/0 4/2 | 5/3 4/2 5/3:h', { chords: 'C G Am C' }),
          60,
          108,
          'Hold each chord shape. For C the thumb swaps strings 5 and 4; for G, strings 6 and 4; for Am, 5 and 4.',
        ),
        text(
          'Adding the fingers',
          'Now the fingers drop in on the "**and**" of each beat: **m** on the 2nd string after beats 1 and 3, **i** on the 3rd string after beats 2 and 4. The whole pattern is "**thumb**, m, **thumb**, i" twice per bar.\n\nPractise it very slowly at first, saying "thumb, finger, thumb, finger". The thumb notes should be slightly louder and absolutely regular.',
        ),
        exercise(
          'g-fp6',
          'The Travis pattern',
          gtr([travis('5/3', '4/2', 0, 1), travis('6/3', '4/0', 0, 0), travis('5/0', '4/2', 2, 1), travis('6/0', '4/2', 0, 0)].join(' | '), { chords: 'C G Am Em' }),
          50,
          92,
          'C, G, Am, Em. If the thumb loses its place, go back to the thumb-alone exercise for a minute.',
        ),
        quiz('In Travis picking, when does the thumb play?', ['Only on beat 1', 'On every beat', 'Only between the beats', 'Whenever it likes'], 1),
      ],
    },
    {
      id: 'g-fp-piece',
      title: 'A fingerstyle piece',
      goal: 'Play a complete piece with a bass note and a melody note plucked together.',
      minutes: 15,
      steps: [
        text(
          'The pinch',
          'A **pinch** is the thumb and a finger plucking **at the same moment**: a bass note and a top note together. It gives each bar a clear first beat and lets a tune sit on top of the accompaniment.\n\nIn this piece every bar starts with a pinch (thumb on the root, ring finger on the 1st string), followed by **i** and **m**, then a second bass note and **i**, **m** again. Count "**1** 2 & **3** 4 &".',
        ),
        exercise(
          'g-fp7',
          'Morning Fingers',
          gtr(
            [
              pinch('5/3', 0, 0, 1, '4/2'),
              pinch('6/3', 3, 0, 0, '4/0'),
              pinch('5/0', 0, 2, 1, '4/2'),
              pinch('4/3', 0, 2, 1, '4/3'),
              pinch('5/3', 0, 0, 1, '4/2'),
              pinch('6/3', 3, 0, 0, '4/0'),
              pinch('4/3', 0, 2, 1, '4/3'),
              '[5/3 4/2 3/0 2/1 1/0]:w',
            ].join(' | '),
            { chords: 'C G Am Fmaj7 C G Fmaj7 C' },
          ),
          54,
          92,
          'Loop bars 1 to 2 first (set Bars to 1 and 2). The last bar is a slow strum with the thumb across the C chord.',
        ),
        text(
          'Where fingerstyle goes next',
          'From here the patterns stay the same and the music grows: melodies picked out on the top strings over a Travis bass, hammer-ons inside chord shapes, and alternate tunings such as **DADGAD** and **Open G** (set them on the **Chords** page to see the shapes). Grow your nails slightly or not, as you prefer: flesh gives a warm sound, nail a bright one.',
        ),
        quiz('What is a pinch?', ['A very quiet note', 'Thumb and a finger plucking together', 'A bend with two fingers', 'Muting with the palm'], 1),
      ],
    },
  ],
}

// ---------------------------------------------------------------------------------------------
// Studio units: open to everyone, for players whose skills are uneven
// ---------------------------------------------------------------------------------------------

const boogie16 = (c: string) => `{${c}}:8 {${c}}:16 {${c}}:16 {${c}}:8 {${c}}:16 {${c}}:16 {${c}}:8 {${c}}:16 {${c}}:16 {${c}}:8 {${c}}:16 {${c}}:16`

export const guitarStudio: Unit[] = [
  {
    id: 'gs-rhythm',
    title: 'Studio: rhythm guitar',
    level: 'Intermediate',
    free: true,
    skill: 'rhythm',
    about: 'Syncopation, sixteenth-note strumming and palm muting: what separates a strummer from a rhythm guitarist.',
    lessons: [
      {
        id: 'g-i-sync',
        title: 'Syncopation: pushing the beat',
        goal: 'Change chords early, on the "and" of 4, and play off-beat chords.',
        minutes: 15,
        related: ['th-rests'],
        steps: [
          text(
            'Off the beat',
            '**Syncopation** means putting the weight where the listener does not expect it: between the beats. It is what makes a rhythm part feel alive.\n\nThe most common move in pop and rock is the **push** (or anticipation): the new chord arrives **an eighth note early**, on the "and" of beat 4, and is **held over the bar line**. In notation that is a **tie**: you strum the chord once and let it ring through beat 1 of the next bar. Your hand still makes its down-swing on beat 1, but misses the strings.',
          ),
          exercise(
            'g-sync1',
            'The push',
            gtr('{G} {G}:8 {G}:8 {G} {G}:8 {C}:8- | {C} {C}:8 {C}:8 {C} {C}:8 {D}:8- | {D} {D}:8 {D}:8 {D} {D}:8 {G}:8- | {G}:w', { chords: 'G C D G' }),
            60,
            100,
            'Each new chord is strummed on the last upstroke of the bar and held. Count "1 2 & 3 4 &(change)".',
          ),
          text(
            'Only the off-beats',
            'Reggae and ska turn the idea inside out: the guitar plays **only on the "and"s**, short and sharp, and leaves the beats empty. Strum up, then relax your fretting hand at once so the chord stops dead. Count the beats out loud and play in the gaps.',
          ),
          exercise(
            'g-sync2',
            'Off-beat chords',
            gtr(
              ['Am', 'Dm', 'Am', 'Em'].map((c) => `r:8 {${c}}:8~↑ r:8 {${c}}:8~↑ r:8 {${c}}:8~↑ r:8 {${c}}:8~↑`).join(' | '),
              { chords: 'Am Dm Am Em' },
            ),
            66,
            104,
            'Turn on Backing chords: the drums play the beats and you play the spaces between them.',
          ),
          quiz('In a "push", when does the new chord arrive?', ['On beat 1', 'An eighth note before beat 1', 'On beat 2', 'A whole bar early'], 1),
        ],
      },
      {
        id: 'g-i-16',
        title: 'Sixteenth-note strumming',
        goal: 'Strum patterns built on sixteenth notes, counted "1 e & a".',
        minutes: 15,
        related: ['th-rhythm'],
        steps: [
          text(
            'Twice as fine',
            'A **sixteenth note** is half an eighth note: four to a beat, counted "**1** e & a **2** e & a". Funk, soul, pop ballads and most acoustic strumming at slower tempos live here.\n\nYour hand now swings **down on the number and the "&"**, and **up on the "e" and the "a"**: the same pendulum as before at double speed, so keep the wrist loose and the strokes small. As always, patterns come from choosing which swings hit the strings.\n\nThe first pattern is "**1** (e) **& a**": down, miss, down, up.',
          ),
          exercise(
            'g-16a',
            'Down, down-up in sixteenths',
            gtr(['Em', 'Am', 'C', 'D'].map(boogie16).join(' | '), { chords: 'Em Am C D' }),
            50,
            84,
            'Each beat is one long strum and two short ones: "1 . & a, 2 . & a". Start very slowly.',
          ),
          text(
            'Leaving holes',
            'Funk rhythm guitar is as much about the **silences** as the strums. In the next pattern the chord is hit in short bursts with rests between. Keep the hand swinging in sixteenths through the rests, and relax the fretting hand to cut each chord short.',
          ),
          exercise(
            'g-16b',
            'Bursts and gaps',
            gtr(
              ['Am7', 'Am7', 'D7', 'D7']
                .map((c) => `{${c}}:16 {${c}}:16 r:8 {${c}}:8 {${c}}:16 {${c}}:16 r:8 {${c}}:16 {${c}}:16 {${c}}:8 r:8`)
                .join(' | '),
              { chords: 'Am7 . D7 .' },
            ),
            50,
            80,
            'The strokes you play fall on "1 e", "2 & a", "& a" (of beat 3) and "4". Listen first, then copy the sound.',
          ),
          quiz('How are sixteenth notes counted?', ['1 & 2 &', '1 e & a', '1 2 3 4', '1 a 2 a'], 1),
          quiz('In sixteenth-note strumming, which strokes are downstrokes?', ['The numbers and the "&"s', 'Only the numbers', 'The "e"s and "a"s', 'All of them'], 0),
        ],
      },
      {
        id: 'g-i-pm',
        title: 'Palm muting and accents',
        goal: 'Control the length and weight of notes with the picking hand.',
        minutes: 12,
        steps: [
          text(
            'Tight and loud, tight and quiet',
            '**Palm muting (PM)**: rest the fleshy edge of your picking hand on the strings right where they leave the bridge. The notes become short and chunky. Slide the hand a few millimetres toward the neck for a deader sound, back toward the bridge for more ring. Rock rhythm parts constantly switch between muted single notes and **open, ringing chords**: the contrast is the whole effect.\n\n**Accents (>)**: play marked notes louder by using a bigger stroke, not a tenser hand. Accenting beats 2 and 4, the **backbeat**, is what makes a rhythm part groove with a drummer.',
          ),
          exercise(
            'g-pm1',
            'Mute, then open',
            gtr(
              '6/0:8~PM 6/0:8 6/0:8 6/0:8 [6/3 5/5]:8 6/0:8~PM [6/5 5/7]:8 6/0:8~PM | 6/0:8~PM 6/0:8 6/0:8 6/0:8 [6/5 5/7]:8 6/0:8~PM [6/3 5/5]:8 6/0:8~PM | 6/0:8~PM 6/0:8 6/0:8 6/0:8 [6/3 5/5]:8 6/0:8~PM [6/5 5/7]:8 6/0:8~PM | [6/0 5/2]:w',
            ),
            70,
            120,
            'The low E notes are palm muted; lift the hand for the two-note power chords so they jump out.',
          ),
          exercise(
            'g-pm2',
            'Accent the backbeat',
            gtr(`${rep('5/0:8~PM 5/0:8 [5/0 4/2]:8~> 5/0:8 5/0:8 5/0:8 [5/0 4/2]:8~> 5/0:8', 3)} | [5/0 4/2]:w`),
            70,
            120,
            'Muted A notes with an open, louder A5 on beats 2 and 4.',
          ),
          quiz('Where does the picking hand rest for a palm mute?', ['On the strings near the bridge', 'Over the 12th fret', 'On the body, away from the strings', 'On the nut'], 0),
        ],
      },
    ],
  },
  {
    id: 'gs-chords',
    title: 'Studio: chords up the neck',
    level: 'Intermediate',
    free: true,
    skill: 'chords',
    about: 'Small three-note shapes and movable seventh chords: the vocabulary of a second guitarist, funk, soul and jazz.',
    lessons: [
      {
        id: 'g-i-triads',
        title: 'Triads on the top three strings',
        goal: 'Play any major chord in three places using small three-note shapes.',
        minutes: 15,
        related: ['th-triads'],
        steps: [
          text(
            'Less is more',
            'A chord only needs three notes. On the **top three strings** every major triad has **three small shapes**, one for each note that can be on top. They are the same three notes in a different order (the **inversions**):\n\n- **Root position** (root lowest): the shape of an open D chord without its bass.\n- **1st inversion** (3rd lowest): a small slanted shape.\n- **2nd inversion** (5th lowest): a tiny barre with one finger behind, like the top of an F chord.\n\nThese shapes cut through a band without clashing with the bass, and they put you next to melody notes all over the neck. They are also the heart of the **CAGED** way of seeing the fretboard: each one is the top of a bigger chord shape you already know.',
          ),
          {
            t: 'fretboard',
            title: 'C major, three shapes',
            marks: fm('*3/5=C +2/5=E 1/3=G +3/9=E 2/8=G *1/8=C 3/12=G *2/13=C +1/12=E'),
            from: 2,
            to: 14,
            caption: 'Orange: the root, C. Teal: the 3rd, E. Grey: the 5th, G. Left to right: root position, 1st inversion, 2nd inversion.',
          },
          exercise(
            'g-tri1',
            'C triad in three places',
            gtr('[3/5 2/5 1/3]:h~C [3/9 2/8 1/8]:h | [3/12 2/13 1/12]:h [3/9 2/8 1/8]:h | [3/5 2/5 1/3]:w'),
            60,
            96,
            'Strum only the top three strings. Say which note is on top each time: G, C, E, C, G.',
          ),
          text(
            'Changing chords without moving',
            'Because every chord has a shape in every part of the neck, you can change chords and hardly move your hand. Around frets 5 to 9, **C**, **F** and **G** are right next to each other: choose the inversion of each one that is closest to the last.',
          ),
          exercise(
            'g-tri2',
            'C – F – G in one place',
            gtr('[3/5 2/5 1/3]:h [3/5 2/5 1/3]:h | [3/5 2/6 1/5]:h [3/5 2/6 1/5]:h | [3/7 2/8 1/7]:h [3/7 2/8 1/7]:h | [3/9 2/8 1/8]:w', { chords: 'C F G C' }),
            60,
            100,
            'C to F: the note on the 3rd string stays put. Try it over the Fifties or Pop style in Jam, playing short stabs.',
          ),
          quiz('How many different notes are in a major triad?', ['2', '3', '4', '6'], 1),
          quiz('Which note is lowest in a 1st-inversion triad?', ['The root', 'The 3rd', 'The 5th', 'The 7th'], 1),
        ],
      },
      {
        id: 'g-i-7ths',
        title: 'Movable seventh chords',
        goal: 'Play maj7, 7 and m7 chords from the 6th and 5th strings, and a ii–V–I in two keys.',
        minutes: 15,
        related: ['th-sevenths'],
        steps: [
          text(
            'Four notes, four strings',
            'Jazz, soul, bossa nova and neo-soul are built on seventh chords. The standard guitar shapes use just **four strings** and skip one, which keeps them clear and easy to move.\n\n**Root on the 6th string** (the 5th string is muted by the side of finger 1):\n\n- **maj7**: 3 x 4 4 3 x · **7**: 3 x 3 4 3 x · **m7**: 3 x 3 3 3 x (all shown on G)\n\n**Root on the 5th string**:\n\n- **maj7**: x 3 5 4 5 x · **7**: x 3 5 3 5 x · **m7**: x 3 5 3 4 x (all shown on C)\n\nCompare neighbours: from maj7 to 7, one note drops a fret (the 7th). From 7 to m7, another drops (the 3rd).',
          ),
          {
            t: 'fretboard',
            title: 'G7 and Cmaj7',
            marks: fm('*6/3=G +4/3=F +3/4=B 2/3=D *5/3=C 4/5=G +3/4=B +2/5=E'),
            from: 1,
            to: 7,
            caption: 'G7 from the 6th string uses strings 6, 4, 3, 2. Cmaj7 from the 5th string uses strings 5, 4, 3, 2. They share the B on the 3rd string.',
          },
          exercise(
            'g-7a',
            'ii – V – I in C',
            gtr('[5/5 4/7 3/5 2/6]:w~Dm7 | [6/3 4/3 3/4 2/3]:w~G7 | [5/3 4/5 3/4 2/5]:w~Cmaj7 | [5/3 4/5 3/4 2/5]:w', { chords: 'Dm7 G7 Cmaj7 .' }),
            60,
            96,
            'Dm7 from the 5th string, G7 from the 6th, Cmaj7 from the 5th. The most important progression in jazz.',
          ),
          exercise(
            'g-7b',
            'ii – V – I in G',
            gtr('[6/5 4/5 3/5 2/5]:w~Am7 | [5/5 4/7 3/5 2/7]:w~D7 | [6/3 4/4 3/4 2/3]:w~Gmaj7 | [6/3 4/4 3/4 2/3]:w', { chords: 'Am7 D7 Gmaj7 .' }),
            60,
            96,
            'The same three chord types starting from the other string. Try both over the ii–V–I style in Jam.',
          ),
          quiz('From a maj7 shape to a dominant 7 shape, what changes?', ['The root moves', 'The 7th drops one fret', 'The 5th rises', 'Nothing'], 1),
        ],
      },
    ],
  },
  {
    id: 'gs-lead',
    title: 'Studio: lead guitar',
    level: 'Intermediate',
    free: true,
    skill: 'lead',
    about: 'The major scale, mixing major and minor, playing the chord tones, and a slow blues solo with bends.',
    lessons: [
      {
        id: 'g-i-major',
        title: 'The major scale across the neck',
        goal: 'Play a two-octave major scale in one position and use it for a melody.',
        minutes: 15,
        related: ['th-major'],
        steps: [
          text(
            'Seven notes',
            'The pentatonic scale has five notes; the **major scale** has seven, and with it you can play **melodies**: almost every tune you can sing is made from it. This pattern covers two octaves **without moving your hand**: finger 1 plays fret 2, finger 2 fret 3, finger 3 fret 4 and finger 4 fret 5.\n\nIt starts with **finger 2 on the root** on the 6th string. Here that is fret 3, so the scale is **G major**. Like every pattern on the guitar it is movable: start with finger 2 on fret 5 and it is A major.',
          ),
          { t: 'scale', root: 'G', scale: 'major', on: 'guitar', from: 1, to: 6, caption: 'G major in 2nd position. Orange dots are the root, G. (Ignore the open strings and fret 1.)' },
          exercise(
            'g-maj1',
            'G major, two octaves',
            gtr('6/3 6/5 5/2 5/3 | 5/5 4/2 4/4 4/5 | 3/2 3/4 3/5 2/3 | 2/5 1/2 1/3:h', { key: 'G' }),
            60,
            112,
            'Alternate pick, one finger per fret. Sing "do re mi" along with the first octave.',
          ),
          text(
            'Play a tune you know',
            'A scale earns its keep when you use it for a melody. Here is the opening of **Ode to Joy** in this position. Afterwards, pick any simple tune you know well (a nursery rhyme, a carol) and **find it by ear** inside the same pattern, starting from G. The [Play it back](#/ear/echo) drill trains exactly this.\n\nThe major pentatonic you already know is this scale **without its 4th and 7th notes**: you now have the two notes it leaves out.',
          ),
          exercise(
            'g-maj2',
            'Ode to Joy in G',
            gtr('3/4 3/4 3/5 2/3 | 2/3 3/5 3/4 3/2 | 4/5 4/5 3/2 3/4 | 3/4:qd 3/2:8 3/2:h', { key: 'G' }),
            66,
            108,
          ),
          quiz('Which finger starts this major scale pattern on the 6th string?', ['Finger 1', 'Finger 2', 'Finger 3', 'Finger 4'], 1),
        ],
      },
      {
        id: 'g-i-mix',
        title: 'Mixing major and minor pentatonic',
        goal: 'Use the major 3rd and 6th over the I chord of a blues, and switch back to minor for the IV.',
        minutes: 15,
        steps: [
          text(
            'The sound of the greats',
            'Minor pentatonic alone sounds tough. Major pentatonic alone sounds sweet. Blues, country and classic rock players **mix them**, and the mix is what sounds expressive.\n\nOver the **I chord** (A7 in an A blues), add the notes of **A major pentatonic** to your minor box. Two of them matter most:\n\n- **C♯**, the major 3rd: one fret above the C you already play. **Hammer or slide from C into C♯**: that ♭3-to-3 move is the single most recognisable sound in blues.\n- **F♯**, the 6th: on the 2nd string, fret 7.\n\nOver the **IV chord** (D7), go back to plain minor pentatonic: its C is the 7th of D7 and sounds perfect, while C♯ would clash.',
          ),
          {
            t: 'fretboard',
            title: 'Box 1 with the two sweet notes',
            marks: fm('*6/5=A 6/8=C 5/5=D 5/7=E 4/5=G *4/7=A 3/5=C +3/6=C♯ 3/7=D 2/5=E +2/7=F♯ 2/8=G *1/5=A 1/8=C'),
            from: 4,
            to: 9,
            caption: 'Teal: C♯ and F♯, borrowed from A major pentatonic. Use them over the A7 chord.',
          },
          exercise(
            'g-mix1',
            'Minor 3rd to major 3rd',
            gtr('3/5:8 3/6:8~H 2/5 1/5:h | 2/7:8 2/5:8 3/6 4/7:h', { chords: 'A7 .' }),
            60,
            100,
            'Bar 1: C hammered to C♯, then E and A. Bar 2: F♯, E, C♯, A.',
          ),
          exercise(
            'g-mix2',
            'Major over I, minor over IV',
            gtr('4/7:8 3/6:8 2/5 2/7:h | 2/8:8 2/5:8 3/7 3/5:h | 3/5:8 3/6:8~H 2/5 1/5:h | 4/7:w~vib', { chords: 'A7 D7 A7 .' }),
            60,
            100,
            'Bar 2 is over D7: plain minor pentatonic, ending on C. Bar 3 brings the C♯ back as the A7 returns.',
          ),
          quiz('Over which chord of an A blues does C♯ sound best?', ['A7 (the I chord)', 'D7 (the IV chord)', 'Neither', 'Both equally'], 0),
        ],
      },
      {
        id: 'g-i-arp',
        title: 'Playing the chord tones',
        goal: 'Outline each chord of a blues with its arpeggio, and land on the 3rd of each chord.',
        minutes: 15,
        related: ['th-sevenths'],
        steps: [
          text(
            'Solos that follow the chords',
            'A scale fits the whole key. An **arpeggio** fits **one chord**: it is that chord played a note at a time. When a soloist seems to "play the changes", they are leaning on the arpeggio of each chord as it goes by.\n\nA dominant 7th arpeggio has four notes: **root, 3rd, 5th, ♭7th**. All three arpeggios of the A blues sit in and around box 1, so you do not need to move.',
          ),
          {
            t: 'fretboard',
            title: 'A7 arpeggio in box 1',
            marks: fm('*6/5=A +5/4=C♯ 5/7=E 4/5=G *4/7=A +3/6=C♯ 2/5=E 2/8=G *1/5=A'),
            from: 3,
            to: 9,
            caption: 'Orange: root. Teal: the 3rd, C♯, the note that makes the chord major.',
          },
          exercise(
            'g-arp1',
            'A7, D7 and E7 arpeggios',
            gtr('6/5 5/4 5/7 4/5 | 4/7 3/6 2/5 2/8 | 5/5 4/4 4/7 3/5 | 3/7 2/7 1/5 1/8 | 5/7 4/6 4/9 3/7 | 3/9 2/9 1/7:h', { chords: 'A7 . D7 . E7 .' }),
            60,
            104,
            'Two bars on each chord, climbing: root, 3rd, 5th, 7th, and again an octave higher.',
          ),
          text(
            'The 3rd is the target',
            'The **3rd** tells the ear which chord it is hearing. Landing on it just as the chord arrives is the strongest thing a soloist can do. In the next exercise every bar approaches the 3rd of its chord from **one fret below**: C into **C♯** for A7, F into **F♯** for D7, G into **G♯** for E7.',
          ),
          exercise(
            'g-arp2',
            'Thirds through the 12-bar blues',
            gtr(
              'A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 E7'
                .split(' ')
                .map((c) => (c === 'A7' ? '3/5:8 3/6:8~H 3/6:hd' : c === 'D7' ? '2/6:8 2/7:8~sl 2/7:hd' : '2/8:8 2/9:8~sl 2/9:hd'))
                .join(' | '),
              { chords: 'A7 . . . D7 . A7 . E7 D7 A7 E7' },
            ),
            66,
            104,
            'Turn on Backing chords and listen to each target note lock into its chord.',
          ),
          quiz('Which note of a chord tells the ear whether it is major or minor?', ['The root', 'The 3rd', 'The 5th', 'The octave'], 1),
        ],
      },
      {
        id: 'g-i-slowblues',
        title: 'Slow blues solo',
        goal: 'Play a 12-bar solo with bends, releases and the major–minor mix.',
        minutes: 20,
        steps: [
          text(
            'Fewer notes, more feeling',
            'At a slow tempo there is nowhere to hide: every note is heard, so **how** you play matters more than what you play. This study uses everything from the studio lessons:\n\n- the **♭3-to-3 hammer** (C to C♯) over A7,\n- **chord 3rds** as targets: F♯ over D7 in bars 5 and 10, G♯ over E7 in bar 9,\n- a **full bend with a release**: bend the note up a whole step, then let it back down to where it started, both in one pick stroke,\n- **space**: bars 1 and 3 start with a rest, and bar 8 breathes.\n\nThis blues has a **quick change**: it goes to D7 in bar 2 and straight back.',
          ),
          exercise(
            'g-slow1',
            'Slow blues in A',
            gtr(
              'r 3/5:8 3/6:8~H 2/5:h | 2/8:8~full 2/8:8~rel 2/5 3/7:h | r 2/5:8 2/7:8 1/5:h | 1/8:8~full 1/5:8 2/8 2/5:h | ' +
                '3/7:h 2/7:8 3/7:8 3/5 | 2/8:8 2/5:8 3/7 3/5:h | 3/5:8 3/6:8~H 2/5 2/7 1/5 | 1/5:h~vib r:h | ' +
                '2/9:h 2/5 3/7 | 2/7:h 3/7 3/5 | 3/5:8 3/6:8~H 2/5 3/7:8 3/5:8 4/7 | 4/6:8 4/7:8 4/9:hd~vib',
              { chords: 'A7 D7 A7 . D7 . A7 . E7 D7 A7 E7' },
            ),
            56,
            80,
            'Learn four bars at a time with Bars and Loop. The last bar walks up to B, the 5th of E7, to lead back to the top.',
          ),
          text(
            'Make it speak',
            'Once the notes are safe, record yourself over the **Quick-change blues** in Jam and listen back. Ask three questions: Are my bends reaching the pitch? Is my vibrato even? Did I leave room to breathe? Then play it again and change one phrase to your own.',
          ),
          quiz('What is a bend "release"?', ['Letting go of the string', 'Letting a bent note fall back to its starting pitch', 'A very fast bend', 'A bend on an open string'], 1),
        ],
      },
    ],
  },
]

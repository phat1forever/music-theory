import { quiz, text, type Lesson } from './types'

/** A short, instrument-aware lesson on how to practise, placed at the end of each instrument's first unit. */
export function practiceLesson(instrument: 'guitar' | 'keys'): Lesson {
  const guitar = instrument === 'guitar'
  return {
    id: guitar ? 'g-practice' : 'k-practice',
    title: 'How to practise',
    goal: 'Plan a 20-minute session that gets results, and know what progress to expect.',
    minutes: 8,
    steps: [
      text(
        'Little and often',
        `Twenty minutes on five days beats two hours on one. Your brain and hands build skill **while you rest** between sessions, so how often you play matters more than how long.\n\nA realistic picture: ${
          guitar ? 'first clean chords after two to four weeks, a steady strumming rhythm after a couple of months' : 'a smooth one-octave scale and your first simple pieces after two to four weeks'
        }, and nine to twelve months of regular practice to work through this whole track. Judge your progress over a month, never a single day.`,
      ),
      text(
        'A 20-minute session',
        `- **Warm up (3 minutes).** ${guitar ? 'Slow chord changes or an easy scale, to loosen your hands.' : 'A slow five-finger pattern or a scale, hands relaxed.'}\n- **Review (5 minutes).** Open **Practice**: exercises marked *due* come back for review, a little faster each time.\n- **New material (7 minutes).** The next lesson's exercise. Find the hardest bar and loop just that (use **Bars X to Y**).\n- **Ear (2 minutes).** Ten questions in [Ear training](#/ear). Small and daily is what works.\n- **Play (3 minutes).** Something you enjoy: a piece you know, or **Jam**. Finish on a good note.\n\nThe Home page lays this session out for you every day.`,
      ),
      text(
        'Slow is fast',
        'Play at a speed where you can be **clean three times in a row**, and only then go faster: the tempo steps in this app (+8 bpm each pass) work like that.\n\nIf you make the same mistake twice, slow down or loop only those notes: practising a mistake teaches the mistake. Use the metronome, count the bar in, and keep going through small slips so your sense of time grows. Once a week, **record yourself** and listen back: it is the quickest way to hear what to fix.',
      ),
      text(
        'Look after your body',
        guitar
          ? 'Sit or stand relaxed with your shoulders down, wrists straight, and take a one-minute break every ten to fifteen minutes. **Sore fingertips are normal** for the first two or three weeks and toughen up. **Stop** if you feel sharp pain, numbness or tingling in your wrist, hand or forearm, and ask a teacher to check your technique: small problems are easy to fix early and hard to fix late.'
          : 'Sit at a height where your forearms are level with the keys, shoulders down, wrists level and arms loose. Take a one-minute break every ten to fifteen minutes. **Stop** if you feel sharp pain, numbness or tingling in your wrist, hand or forearm, and ask a teacher to check your technique: small problems are easy to fix early and hard to fix late.',
      ),
      quiz('Which routine gives the most progress?', ['20 minutes, five days a week', 'Two hours once a week', 'Only when you feel inspired', 'As fast as you can'], 0),
      quiz('You keep making the same mistake in one bar. What now?', ['Play it faster to get past it', 'Slow down and loop just that bar', 'Skip the bar', 'Start the whole piece again'], 1),
    ],
  }
}

import type {
  StoicQuote,
  DailyReflectionData,
  CommunityBroadcast,
} from '../utils/stoicLogic';

export const INITIAL_QUOTES: StoicQuote[] = [
  {
    id: 'q1',
    text: 'Some things are in our control, while others are not.',
    author: 'Epictetus',
    source: 'Enchiridion, 1',
    virtue: 'wisdom',
    application: 'Put your attention on the next action you can take, not on the result you cannot command.',
  },
  {
    id: 'q2',
    text: 'The happiness of your life depends upon the quality of your thoughts.',
    author: 'Marcus Aurelius',
    source: 'Meditations, 3.9',
    virtue: 'wisdom',
    application: 'Choose one useful, honest thought to guide the way you meet today.',
  },
  {
    id: 'q3',
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    source: 'Letters, 13.4',
    virtue: 'courage',
    application: 'Separate what has happened from what you fear might happen; respond strictly to the facts.',
  },
  {
    id: 'q4',
    text: 'First say to yourself what you would be; and then do what you have to do.',
    author: 'Epictetus',
    source: 'Discourses, 3.23',
    virtue: 'justice',
    application: 'Name the quality you want to practice, then make it visible in one concrete action.',
  },
  {
    id: 'q5',
    text: 'Waste no more time arguing what a good person should be. Be one.',
    author: 'Marcus Aurelius',
    source: 'Meditations, 10.16',
    virtue: 'temperance',
    application: 'Turn a value into a small act of craft, fairness, or self-restraint today.',
  },
  {
    id: 'q6',
    text: 'Difficulties strengthen the mind, as labor does the body.',
    author: 'Seneca',
    source: 'Letters, 71.13',
    virtue: 'courage',
    application: 'Welcome a difficult obstacle today as an opportunity to build mental resilience.',
  },
  {
    id: 'q7',
    text: 'No person has the power to have everything they want, but it is in their power not to want what they have not, and cheerfully put to good use what they have.',
    author: 'Seneca',
    source: 'Moral Letters, 123.3',
    virtue: 'temperance',
    application: 'Practice gratitude for the basic necessities and current tools you already possess.',
  },
  {
    id: 'q8',
    text: 'What is bad luck for one person is good luck for another. What hurts the body does not necessarily hurt the soul unless you allow it.',
    author: 'Marcus Aurelius',
    source: 'Meditations, 4.49',
    virtue: 'wisdom',
    application: 'Reframe unexpected delays or mishaps as tests of composure rather than personal injuries.',
  },
];

export const INITIAL_PROMPTS = [
  { id: 'p1', title: 'Give one important task my full attention', virtue: 'wisdom', steps: 'Choose one task, define the next step, silence distractions' },
  { id: 'p2', title: 'Approach one difficult conversation with honesty and care', virtue: 'courage', steps: 'Name what matters, listen fully, speak respectfully' },
  { id: 'p3', title: 'Make one useful contribution to someone else’s work', virtue: 'justice', steps: 'Ask what would help, offer a specific action, follow through' },
  { id: 'p4', title: 'Practice restraint with my time and attention', virtue: 'temperance', steps: 'Choose a stopping point, take a deliberate break, return with focus' },
  { id: 'p5', title: 'Learn from a mistake without letting it define the day', virtue: 'wisdom', steps: 'Identify what happened, choose one adjustment, try again' },
  { id: 'p6', title: 'Take one step toward a task I have been avoiding', virtue: 'courage', steps: 'Break it into a small action, begin for 15 minutes, review progress' },
  { id: 'p7', title: 'Treat one person with patience and fairness', virtue: 'justice', steps: 'Hear their perspective, check my assumptions, respond with respect' },
];

export const INITIAL_BROADCAST: CommunityBroadcast = {
  id: 'b1',
  title: 'Weekly Focus: The Dichotomy of Control in Daily Friction',
  message: 'When traffic halts, servers drop, or someone acts impolitely, pause for three breaths. Ask yourself: "Does this lie within my realm of choice?" Meet reality as an ally, not an adversary.',
  type: 'challenge',
  active: true,
  createdAt: '2026-11-08T00:00:00Z',
};

export const INITIAL_MAXIMS = [
  { id: 'm1', principle: 'Amor Fati', explanation: 'Love whatever happens; view fate as fuel for the soul.' },
  { id: 'm2', principle: 'Memento Mori', explanation: 'Keep mortality in mind to eliminate trivial distractions.' },
  { id: 'm3', principle: 'The Inner Citadel', explanation: 'Protect your peace of mind from external chaos; tranquility is an internal fortress.' },
  { id: 'm4', principle: 'Sympatheia', explanation: 'Recognize our mutual interdependence; act with fairness and kindness to society.' },
];

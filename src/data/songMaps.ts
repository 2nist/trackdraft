import { SongMap } from '../types/structure';

/**
 * MAP Method Templates - Narrative structure templates for songwriting
 * Based on the HTWS methodology
 */

export const songMaps: SongMap[] = [
  {
    id: 'pec',
    name: 'Problem → Escalation → Change',
    structure: 'V-C-V-C-B-C',
    sections: [
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Introduce the problem or conflict',
          secondaryConsiderations: [
            'Set the scene with specific details',
            'Establish the emotional state',
            'Create a relatable situation',
          ],
          questions: [
            'What is the main problem or conflict?',
            'Where is this happening?',
            'How does the character feel?',
          ],
          sensoryChecklist: ['Visual details', 'Emotional state', 'Physical setting'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'Express the core emotional response to the problem',
          secondaryConsiderations: [
            'Make it memorable and repeatable',
            'Use strong, emotional language',
            'Create a hook that sticks',
          ],
          questions: [
            'What is the main feeling about this problem?',
            'What is the central message?',
            'What do you want listeners to remember?',
          ],
          sensoryChecklist: ['Emotional intensity', 'Memorable phrases', 'Repetition'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Show the escalation or deepening of the problem',
          secondaryConsiderations: [
            'Add new information or perspective',
            'Show how things are getting worse',
            'Reveal more about the situation',
          ],
          questions: [
            'How has the problem intensified?',
            'What new details emerge?',
            'What is different from verse 1?',
          ],
          sensoryChecklist: ['Escalation', 'New information', 'Deeper emotion'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the emotional core',
          secondaryConsiderations: [
            'Maintain consistency with first chorus',
            'Can add slight variation for interest',
          ],
          questions: [
            'Does this still capture the core emotion?',
            'Should there be any variation?',
          ],
          sensoryChecklist: ['Consistency', 'Emotional resonance'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Show the change, realization, or resolution',
          secondaryConsiderations: [
            'Offer a new perspective',
            'Show growth or understanding',
            'Create contrast with verses and chorus',
          ],
          questions: [
            'What has changed?',
            'What new understanding has emerged?',
            'How is this different from before?',
          ],
          sensoryChecklist: ['New perspective', 'Contrast', 'Transformation'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with the transformed understanding',
          secondaryConsiderations: [
            'Can be slightly modified to reflect change',
            'End on a strong, memorable note',
          ],
          questions: [
            'How has the meaning changed?',
            'What is the final message?',
          ],
          sensoryChecklist: ['Transformation', 'Final impact'],
        },
      },
    ],
    narrativeLogic: 'Starts with a problem, shows it escalating, then reveals how the character changes or grows through it.',
    prompts: {},
    difficulty: 'beginner',
    genres: ['Pop', 'Rock', 'Country', 'Folk'],
    description: 'Classic narrative arc: problem, escalation, resolution. Perfect for storytelling songs.',
  },
  {
    id: 'scx-cq',
    name: 'Situation → Context → Consequence',
    structure: 'V-C-V-C-B-C',
    sections: [
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Describe the initial situation',
          secondaryConsiderations: [
            'Paint a clear picture',
            'Use concrete details',
            'Establish the setting',
          ],
          questions: [
            'What is happening?',
            'Who is involved?',
            'Where and when is this?',
          ],
          sensoryChecklist: ['Visual details', 'Setting', 'Characters'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'Reveal the broader context or meaning',
          secondaryConsiderations: [
            'Connect situation to bigger picture',
            'Show why this matters',
          ],
          questions: [
            'What does this situation mean?',
            'Why is it significant?',
            'What is the bigger context?',
          ],
          sensoryChecklist: ['Meaning', 'Context', 'Significance'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Show the consequences or implications',
          secondaryConsiderations: [
            'What happens as a result?',
            'How does it affect others?',
            'What are the ripple effects?',
          ],
          questions: [
            'What are the consequences?',
            'How does this affect the future?',
            'Who else is impacted?',
          ],
          sensoryChecklist: ['Consequences', 'Impact', 'Future implications'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the context and meaning',
          secondaryConsiderations: [
            'Maintain emotional core',
            'Can add depth with new understanding',
          ],
          questions: [
            'Has the context deepened?',
            'What new layers are revealed?',
          ],
          sensoryChecklist: ['Depth', 'Layered meaning'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Reflect on the full picture or offer insight',
          secondaryConsiderations: [
            'Tie everything together',
            'Offer wisdom or reflection',
            'Create a moment of clarity',
          ],
          questions: [
            'What is the full picture?',
            'What have we learned?',
            'What is the takeaway?',
          ],
          sensoryChecklist: ['Reflection', 'Wisdom', 'Clarity'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with the complete understanding',
          secondaryConsiderations: [
            'Show how context has deepened',
            'End with resonance',
          ],
          questions: [
            'What is the final understanding?',
            'How has the context evolved?',
          ],
          sensoryChecklist: ['Complete understanding', 'Final resonance'],
        },
      },
    ],
    narrativeLogic: 'Presents a situation, reveals its broader context, then explores the consequences. Great for reflective songs.',
    prompts: {},
    difficulty: 'intermediate',
    genres: ['Folk', 'Singer-Songwriter', 'Indie', 'Acoustic'],
    description: 'Builds understanding layer by layer: what happened, why it matters, what it means.',
  },
  {
    id: 'for',
    name: 'Feeling → Obstacle → Resolution',
    structure: 'V-C-V-C-B-C',
    sections: [
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Express the initial feeling or emotion',
          secondaryConsiderations: [
            'Be specific about the emotion',
            'Show, don\'t just tell',
            'Use sensory language',
          ],
          questions: [
            'What is the feeling?',
            'How does it manifest physically?',
            'What triggers this feeling?',
          ],
          sensoryChecklist: ['Emotional specificity', 'Physical manifestation', 'Sensory details'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'State the obstacle or challenge',
          secondaryConsiderations: [
            'What stands in the way?',
            'What makes this feeling difficult?',
            'Create emotional intensity',
          ],
          questions: [
            'What is the obstacle?',
            'Why is this feeling a problem?',
            'What makes it hard to resolve?',
          ],
          sensoryChecklist: ['Obstacle clarity', 'Emotional intensity', 'Conflict'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Deepen the feeling or show it evolving',
          secondaryConsiderations: [
            'How has the feeling changed?',
            'Add complexity or nuance',
            'Show internal struggle',
          ],
          questions: [
            'How has the feeling evolved?',
            'What new layers are there?',
            'What is the internal conflict?',
          ],
          sensoryChecklist: ['Emotional evolution', 'Complexity', 'Internal struggle'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the obstacle',
          secondaryConsiderations: [
            'Maintain intensity',
            'Can add variation',
          ],
          questions: [
            'Is the obstacle still clear?',
            'Has it intensified?',
          ],
          sensoryChecklist: ['Intensity', 'Clarity'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Show the resolution or acceptance',
          secondaryConsiderations: [
            'How is the obstacle overcome?',
            'Or how is it accepted?',
            'Show growth or change',
          ],
          questions: [
            'What is the resolution?',
            'How is the obstacle handled?',
            'What has changed?',
          ],
          sensoryChecklist: ['Resolution', 'Growth', 'Transformation'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with the resolved feeling',
          secondaryConsiderations: [
            'Show how feeling has transformed',
            'Can modify to reflect resolution',
          ],
          questions: [
            'How has the feeling changed?',
            'What is the final emotional state?',
          ],
          sensoryChecklist: ['Transformed emotion', 'Resolution', 'Peace'],
        },
      },
    ],
    narrativeLogic: 'Starts with a feeling, identifies what makes it difficult, then shows how it\'s resolved or accepted.',
    prompts: {},
    difficulty: 'beginner',
    genres: ['Pop', 'Ballad', 'R&B', 'Soul'],
    description: 'Emotion-focused structure: feeling, obstacle, resolution. Perfect for emotional songs.',
  },
  {
    id: 'pie',
    name: 'Problem → Intensification → Escalation',
    structure: 'V-C-V-C-B-C',
    sections: [
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Introduce the problem',
          secondaryConsiderations: [
            'Be specific and concrete',
            'Set up the stakes',
            'Create initial tension',
          ],
          questions: [
            'What is the problem?',
            'Why does it matter?',
            'What are the initial stakes?',
          ],
          sensoryChecklist: ['Specificity', 'Stakes', 'Initial tension'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'Express the emotional weight of the problem',
          secondaryConsiderations: [
            'Show why this matters',
            'Create emotional hook',
            'Make it memorable',
          ],
          questions: [
            'Why is this problem significant?',
            'What is the emotional core?',
            'What makes it urgent?',
          ],
          sensoryChecklist: ['Emotional weight', 'Significance', 'Urgency'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Show the intensification',
          secondaryConsiderations: [
            'How is it getting worse?',
            'What new complications arise?',
            'Raise the stakes',
          ],
          questions: [
            'How has it intensified?',
            'What new problems emerged?',
            'How are the stakes higher?',
          ],
          sensoryChecklist: ['Intensification', 'Complications', 'Raised stakes'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the emotional core',
          secondaryConsiderations: [
            'Maintain consistency',
            'Can add intensity',
          ],
          questions: [
            'Has the emotion intensified?',
            'Should there be variation?',
          ],
          sensoryChecklist: ['Consistency', 'Intensity'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Show the peak escalation or crisis point',
          secondaryConsiderations: [
            'This is the climax',
            'Maximum tension',
            'The breaking point',
          ],
          questions: [
            'What is the peak crisis?',
            'How bad can it get?',
            'What is the breaking point?',
          ],
          sensoryChecklist: ['Peak tension', 'Crisis', 'Breaking point'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with the aftermath or new understanding',
          secondaryConsiderations: [
            'How has it changed?',
            'What is the new state?',
            'Can modify to reflect aftermath',
          ],
          questions: [
            'What happens after the crisis?',
            'What is the new understanding?',
            'How has everything changed?',
          ],
          sensoryChecklist: ['Aftermath', 'New understanding', 'Transformation'],
        },
      },
    ],
    narrativeLogic: 'Builds tension progressively: problem, intensification, escalation to crisis, then aftermath.',
    prompts: {},
    difficulty: 'intermediate',
    genres: ['Rock', 'Alternative', 'Punk', 'Metal'],
    description: 'Tension-building structure: problem escalates to crisis, then resolves. Great for intense songs.',
  },
  {
    id: 'classic-pop',
    name: 'Classic Pop',
    structure: 'V-C-V-C-B-C',
    sections: [
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Set up the story or situation',
          secondaryConsiderations: [
            'Hook the listener immediately',
            'Establish the scene',
            'Create intrigue',
          ],
          questions: [
            'What is the story?',
            'Who is the character?',
            'What is the situation?',
          ],
          sensoryChecklist: ['Story setup', 'Character', 'Situation'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'Deliver the main hook and message',
          secondaryConsiderations: [
            'Make it catchy and memorable',
            'Use repetition',
            'Create emotional impact',
          ],
          questions: [
            'What is the main message?',
            'What is the hook?',
            'What do you want people to remember?',
          ],
          sensoryChecklist: ['Catchiness', 'Memorability', 'Emotional impact'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Develop the story further',
          secondaryConsiderations: [
            'Add new information',
            'Show progression',
            'Maintain interest',
          ],
          questions: [
            'How does the story progress?',
            'What new information is revealed?',
            'How is it different from verse 1?',
          ],
          sensoryChecklist: ['Progression', 'New information', 'Development'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the hook',
          secondaryConsiderations: [
            'Maintain consistency',
            'Can add slight variation',
          ],
          questions: [
            'Is the hook still strong?',
            'Should there be variation?',
          ],
          sensoryChecklist: ['Consistency', 'Hook strength'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Provide contrast and new perspective',
          secondaryConsiderations: [
            'Different from verses and chorus',
            'Can be instrumental or lyrical',
            'Builds to final chorus',
          ],
          questions: [
            'What new perspective?',
            'How is it different?',
            'Does it build tension?',
          ],
          sensoryChecklist: ['Contrast', 'New perspective', 'Tension'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with maximum impact',
          secondaryConsiderations: [
            'Can be extended or modified',
            'Add intensity',
            'End memorably',
          ],
          questions: [
            'How to maximize impact?',
            'Should it be extended?',
            'What is the final impression?',
          ],
          sensoryChecklist: ['Maximum impact', 'Intensity', 'Memorable ending'],
        },
      },
    ],
    narrativeLogic: 'Classic pop structure: verse-chorus-verse-chorus-bridge-chorus. Tried and true formula.',
    prompts: {},
    difficulty: 'beginner',
    genres: ['Pop', 'Dance', 'Electronic', 'Top 40'],
    description: 'The most common pop structure. Versatile and familiar to listeners.',
  },
  {
    id: 'modern-pop',
    name: 'Modern Pop',
    structure: 'C-V-C-V-B-C',
    sections: [
      {
        type: 'chorus',
        label: 'Chorus (First)',
        purpose: {
          primaryGoal: 'Hook the listener immediately',
          secondaryConsiderations: [
            'Start with the strongest part',
            'Immediate impact',
            'Set the tone',
          ],
          questions: [
            'What is the strongest hook?',
            'How to grab attention immediately?',
            'What sets the tone?',
          ],
          sensoryChecklist: ['Immediate impact', 'Hook strength', 'Tone setting'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 1',
        purpose: {
          primaryGoal: 'Provide context after the hook',
          secondaryConsiderations: [
            'Explain the chorus',
            'Add backstory',
            'Develop the narrative',
          ],
          questions: [
            'What context is needed?',
            'How does this explain the chorus?',
            'What backstory is important?',
          ],
          sensoryChecklist: ['Context', 'Backstory', 'Narrative development'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the hook with new understanding',
          secondaryConsiderations: [
            'Now has context from verse',
            'Deeper meaning',
            'Maintain catchiness',
          ],
          questions: [
            'How has meaning deepened?',
            'What new understanding?',
          ],
          sensoryChecklist: ['Deeper meaning', 'Contextual understanding'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2',
        purpose: {
          primaryGoal: 'Further develop the story',
          secondaryConsiderations: [
            'Add new information',
            'Show progression',
            'Build toward bridge',
          ],
          questions: [
            'How does story progress?',
            'What new information?',
            'How to build tension?',
          ],
          sensoryChecklist: ['Progression', 'New information', 'Tension building'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge',
        purpose: {
          primaryGoal: 'Provide contrast and build to finale',
          secondaryConsiderations: [
            'Different energy',
            'Build tension',
            'Set up final chorus',
          ],
          questions: [
            'What contrast is needed?',
            'How to build tension?',
            'How to set up finale?',
          ],
          sensoryChecklist: ['Contrast', 'Tension', 'Finale setup'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus',
        purpose: {
          primaryGoal: 'End with maximum impact',
          secondaryConsiderations: [
            'Can be extended',
            'Add layers',
            'End powerfully',
          ],
          questions: [
            'How to maximize impact?',
            'Should it be extended?',
            'What is the final message?',
          ],
          sensoryChecklist: ['Maximum impact', 'Power', 'Final message'],
        },
      },
    ],
    narrativeLogic: 'Modern pop structure starts with the chorus for immediate impact, then provides context. Very current and engaging.',
    prompts: {},
    difficulty: 'beginner',
    genres: ['Pop', 'Hip-Hop', 'R&B', 'Electronic'],
    description: 'Starts with the hook for immediate impact. Very common in modern pop music.',
  },
  {
    id: 'story-arc',
    name: 'Story Arc',
    structure: 'I-V-C-V-C-B-C-O',
    sections: [
      {
        type: 'intro',
        label: 'Intro',
        purpose: {
          primaryGoal: 'Set the scene and mood',
          secondaryConsiderations: [
            'Establish atmosphere',
            'Can be instrumental or lyrical',
            'Hook the listener',
          ],
          questions: [
            'What is the mood?',
            'What atmosphere?',
            'How to hook immediately?',
          ],
          sensoryChecklist: ['Atmosphere', 'Mood', 'Initial hook'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 1 (Setup)',
        purpose: {
          primaryGoal: 'Introduce characters and situation',
          secondaryConsiderations: [
            'Who is involved?',
            'What is the situation?',
            'Set up the conflict',
          ],
          questions: [
            'Who are the characters?',
            'What is the situation?',
            'What conflict is emerging?',
          ],
          sensoryChecklist: ['Characters', 'Situation', 'Conflict setup'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus',
        purpose: {
          primaryGoal: 'Express the central theme or conflict',
          secondaryConsiderations: [
            'What is the main theme?',
            'Create emotional core',
            'Make it memorable',
          ],
          questions: [
            'What is the central theme?',
            'What is the emotional core?',
            'What is the main conflict?',
          ],
          sensoryChecklist: ['Theme', 'Emotional core', 'Conflict'],
        },
      },
      {
        type: 'verse',
        label: 'Verse 2 (Conflict)',
        purpose: {
          primaryGoal: 'Show the conflict developing',
          secondaryConsiderations: [
            'How does conflict escalate?',
            'What complications arise?',
            'Raise the stakes',
          ],
          questions: [
            'How does conflict develop?',
            'What complications?',
            'How are stakes raised?',
          ],
          sensoryChecklist: ['Conflict development', 'Complications', 'Raised stakes'],
        },
      },
      {
        type: 'chorus',
        label: 'Chorus (Repeat)',
        purpose: {
          primaryGoal: 'Reinforce the theme',
          secondaryConsiderations: [
            'Maintain consistency',
            'Can add intensity',
          ],
          questions: [
            'Is theme still clear?',
            'Has intensity increased?',
          ],
          sensoryChecklist: ['Consistency', 'Intensity'],
        },
      },
      {
        type: 'bridge',
        label: 'Bridge (Climax)',
        purpose: {
          primaryGoal: 'Reach the climax or turning point',
          secondaryConsiderations: [
            'Peak of the story',
            'Maximum tension',
            'The turning point',
          ],
          questions: [
            'What is the climax?',
            'What is the turning point?',
            'How is tension at peak?',
          ],
          sensoryChecklist: ['Climax', 'Turning point', 'Peak tension'],
        },
      },
      {
        type: 'chorus',
        label: 'Final Chorus (Resolution)',
        purpose: {
          primaryGoal: 'Show the resolution or new understanding',
          secondaryConsiderations: [
            'How is it resolved?',
            'What is the new state?',
            'Can modify to reflect resolution',
          ],
          questions: [
            'What is the resolution?',
            'How has it changed?',
            'What is the final understanding?',
          ],
          sensoryChecklist: ['Resolution', 'Transformation', 'Final understanding'],
        },
      },
      {
        type: 'outro',
        label: 'Outro',
        purpose: {
          primaryGoal: 'Bring the story to a close',
          secondaryConsiderations: [
            'Can echo intro',
            'Fade out or strong ending',
            'Leave lasting impression',
          ],
          questions: [
            'How to end memorably?',
            'Should it echo intro?',
            'What is the final impression?',
          ],
          sensoryChecklist: ['Memorable ending', 'Echo intro', 'Final impression'],
        },
      },
    ],
    narrativeLogic: 'Complete story arc: setup, conflict, climax, resolution. Like a short story in song form.',
    prompts: {},
    difficulty: 'advanced',
    genres: ['Folk', 'Country', 'Singer-Songwriter', 'Rock'],
    description: 'Full narrative arc with intro and outro. Perfect for storytelling songs.',
  },
];

// Helper function to get a map by ID
export function getSongMapById(id: string): SongMap | undefined {
  return songMaps.find((map) => map.id === id);
}

// Helper function to get maps by difficulty
export function getSongMapsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): SongMap[] {
  return songMaps.filter((map) => map.difficulty === difficulty);
}

// Helper function to get maps by genre
export function getSongMapsByGenre(genre: string): SongMap[] {
  return songMaps.filter((map) => map.genres.includes(genre));
}


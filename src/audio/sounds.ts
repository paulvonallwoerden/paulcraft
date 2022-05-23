export const ListOfSounds = {
    'block.door.open': 'audio/door-open.mp3',
    'block.door.close': 'audio/door-close.mp3',
} as const;

export type SoundNames = Array<keyof typeof ListOfSounds>;

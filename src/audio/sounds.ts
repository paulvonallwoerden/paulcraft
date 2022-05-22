export const ListOfSounds = {
    'block.door.open': '/audio/dig0.mp3',
    'block.door.close': '/audio/place0.mp3',
} as const;

export type SoundNames = Array<keyof typeof ListOfSounds>;

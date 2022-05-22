import pReduce from 'p-reduce';
import { Audio, AudioListener, AudioLoader } from 'three';

export class AudioManager<S extends string[]> {
    private sounds?: Record<S[number], AudioBuffer>;
    private readonly audios: Audio[] = [];

    public constructor(
        private readonly audioListener: AudioListener,
        private readonly audioLoader: AudioLoader,
        private readonly soundSrc: Record<S[number], string>,
    ) {}

    public async load() {
        this.sounds = await pReduce(Object.entries<string>(this.soundSrc), async (map, [name, src]) => ({
            ...map,
            [name]: await this.audioLoader.loadAsync(src),
        }));
    }

    public playSound(name: S[number]): void {
        if (!this.sounds) {
            throw new Error('Can\'t play sound as the sounds haven\'t been loaded yet');
        }

        this.getAudio().setBuffer(this.sounds[name]).play();
    }

    private getAudio(): Audio {
        for (let i = 0; i < this.audios.length; i += 1) {
            const audio = this.audios[i];
            if (!audio.isPlaying) {
                return audio;
            }
        }

        const newAudio = new Audio(this.audioListener);
        this.audios.push(newAudio);

        return newAudio;
    }
}

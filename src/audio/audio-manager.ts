import pReduce from 'p-reduce';
import { Audio, AudioListener, AudioLoader, PositionalAudio, Scene, Vector3 } from 'three';
import { Game } from '../game';

export class AudioManager<S extends string[]> {
    private sounds?: Record<S[number], AudioBuffer>;
    private readonly audios: Audio[] = [];
    private readonly positionalAudios: PositionalAudio[] = [];

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

    public playSound3D(name: S[number], pos: Vector3): void {
        if (!this.sounds) {
            throw new Error('Can\'t play sound as the sounds haven\'t been loaded yet');
        }

        const audio = this.getPositionalAudio();
        audio.setBuffer(this.sounds[name]);
        audio.setVolume(0.5);
        audio.setRefDistance(20);
        audio.position.set(pos.x, pos.y, pos.z);
        audio.play();
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

    private getPositionalAudio(): PositionalAudio {
        for (let i = 0; i < this.positionalAudios.length; i += 1) {
            const audio = this.positionalAudios[i];
            if (!audio.isPlaying) {
                return audio;
            }
        }

        const newAudio = new PositionalAudio(this.audioListener);
        Game.main.scene.add(newAudio);

        this.positionalAudios.push(newAudio);

        return newAudio;
    }
}

import { Game } from './game';

export async function bootstrap() {
    const gameDomElement = document.getElementById('game');
    if (!gameDomElement) {
        throw new Error('Document is missing element with id `game`!');
    }

    const game = new Game(gameDomElement);
    (window as any).game = game;

    console.log('Loading...');
    await game.init();
    console.log("Loading finished successfully!");

    game.startLoop();
}

bootstrap();

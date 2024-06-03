export class GamePlay {
    constructor(story, appElement, lifeElement, mode = 'normal') {
        this.story = story;
        this.appElement = appElement;
        this.lifeElement = lifeElement;
        this.mode = mode;
        this.life = 3;
    }

    async gameLoop() {
        this.updateLifeDisplay();
        for (const chapter of this.story.chapters) {
            for (const scene of chapter.scenes) {
                for (const subscene of scene.subscenes) {
                    await this.displaySubscene(subscene);
                }

                await this.displayChallenge(scene.challenge);
            }
        }
    }

    displaySubscene(subscene) {
        return new Promise(resolve => {
            this.appElement.innerHTML = `<img width="500px" src="${subscene.image}" alt="">`;
            const textContainer = document.createElement('div');
            this.appElement.appendChild(textContainer);
            this.typeWriter(subscene.text, textContainer);

            const subsceneDuration = this.mode === 'fast' ? 1000 : subscene.duration * 1000;

            setTimeout(() => {
                resolve();
            }, subsceneDuration);
        });
    }

    displayChallenge(challenge) {
        return new Promise(resolve => {
            this.appElement.innerHTML = challenge.display();
            this.addChallengeEventListeners(challenge, resolve);
        });
    }

    typeWriter(text, element, speed = 50) {
        let i = 0;
        function type() {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
        type();
    }

    displayChallenge(challenge) {
        return new Promise(resolve => {
            this.appElement.innerHTML = challenge.display();
            this.addChallengeEventListeners(challenge, resolve);
        });
    }

    addChallengeEventListeners(challenge, resolve) {
        const button = this.appElement.querySelector('.challenge button');
        button.onclick = () => {
            const selectedOption = this.appElement.querySelector('input[name="alternative"]:checked');
            if (selectedOption) {
                const answer = selectedOption.value;
                if (answer == challenge.correctAnswer) {
                    challenge.callback(challenge.question, answer);
                    resolve();
                } else {
                    this.life--;
                    this.updateLifeDisplay();
                    if (this.life <= 0) {
                        this.gameOver();
                    } else {
                        resolve();
                    }
                }
            }
        };
    }

    updateLifeDisplay() {
        this.lifeElement.innerHTML = `Vidas: ${this.life}`;
    }

    gameOver() {
        this.appElement.innerHTML = "<h1>Você perdeu</h1>";
    }
}

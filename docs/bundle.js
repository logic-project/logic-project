(function () {
'use strict';

class GamePlay {
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

class Story {
    constructor(title, chapters) {
        this.title = title;
        this.chapters = chapters;
    }
}

class Chapter {
    constructor(scenes) {
        this.scenes = scenes;
    }
}

class Scene {
    constructor(title, subscenes, challenge) {
        this.title = title;
        this.subscenes = subscenes;
        this.challenge = challenge;
    }
}

class SubScene {
    constructor(text, image, duration) {
        this.text = text;
        this.image = image;
        this.duration = duration;
    }

    display() {
        return `
        <div class="subscene">
            <p>${this.text}</p>
            <img src="${this.image}" />
        </div>
        `
    }
 }

class Challenge {
    constructor(question, image, alternatives, correctAnswer, callback) {
        this.question = question;
        this.image = image;
        this.alternatives = alternatives;
        this.correctAnswer = correctAnswer;
        this.callback = callback;
    }
    
    display() {
       return `
        <div class="challenge">
            <h2>${this.question}</h2>
            <img width="500px" src="${this.image}" />
            <ul>
                ${this.alternatives.map((alternative, index) => {
                    return `
                    <li>
                        <input type="radio" id="alternative${index}" name="alternative" value="${index}">
                        <label for="alternative${index}">${alternative}</label>
                    </li>
                    `
                }).join('')}
            </ul>
            <button onclick="${this.callback}()">Submit</button>
        </div>
        `
    }
}

const appEl = document.getElementById("app");
const lifeEl = document.getElementById("life");

const challengeCallback = (sceneTitle, answer) => {
    console.log(`Scene: ${sceneTitle}`);
    console.log(`Answer: ${answer}`);
};

const chapters = [
    new Chapter([
        new Scene("O Chamado do Guardião", 
            [
                new SubScene(
                    "Hiroshi, um jovem samurai, acorda com um estranho som vindo do jardim do seu dojo. Ao investigar, ele encontra um espírito guardião chamado Yukimura.", 
                    "assets/img/_5d3dd153-5f4b-4baf-8392-403885b93daa.jpeg", 
                    10
                ),
                new SubScene(
                    "Yukimura está desesperado e pede a ajuda de Hiroshi para salvar a Princesa Akemi, que foi sequestrada pelo sombrio Senhor das Sombras, Daichi. Hiroshi, inicialmente hesitante, se lembra das histórias dos antigos heróis samurais que salvaram o reino e decide que agora é sua vez de ser o herói.", 
                    "assets/img/_4589d4e9-b533-4c0a-aff6-b17a4896aad1.jpeg", 
                    15
                ),
            ],
            new Challenge(
                "Encontrar a chave da porta do quarto de Hiroshi",
                "assets/img/_e6ec1a3e-b73a-4e06-b347-ed3d2c89419e.jpeg",
                [
                    "Hiroshi precisa encontrar a chave da porta do quarto para poder sair de casa e ir ao encontro de Yukimura.",
                    "A chave está escondida em um dos vasos de plantas do jardim.",
                    "Hiroshi deve procurar a chave em cada um dos vasos de plantas até encontrá-la."
                ],
                1,
                challengeCallback
            )
        ),
        new Scene("A Jornada Começa", 
            [
                new SubScene(
                    "Hiroshi e Yukimura partem em busca da Princesa. No caminho, eles enfrentam guerreiros das sombras e encontram Hana, uma ágil kunoichi presa em uma armadilha. Eles a libertam e ganham uma nova aliada.", 
                    "assets/img/_3ccb5766-7a00-4aa3-ac56-70fe81f3bed5.jpeg", 
                    12
                ),
                new SubScene(
                    "Em seguida, encontram Kenji, um sábio monge, que traz informações valiosas sobre a localização de Akemi.", 
                    "assets/img/_d7495537-90cb-443e-a0f5-acb1afe9ab38.jpeg", 
                    8
                ),
            ],
            new Challenge(
                "Encontrar a saída da floresta",
                "assets/img/_e6ec1a3e-b73a-4e06-b347-ed3d2c89419e.jpeg",
                [
                    "Hiroshi, Yukimura, Hana e Kenji estão perdidos na floresta.",
                    "Eles precisam encontrar a saída para continuar a jornada.",
                    "A saída está escondida atrás de uma cachoeira."
                ],
                2,
                challengeCallback
            )
        ),
    ]),
];


const story = new Story("A Aventura de Hiroshi no Reino das Sombras", chapters);
const game = new GamePlay(story, appEl, lifeEl, "normal");
game.gameLoop();

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIGxpZmVFbGVtZW50LCBtb2RlID0gJ25vcm1hbCcpIHtcbiAgICAgICAgdGhpcy5zdG9yeSA9IHN0b3J5O1xuICAgICAgICB0aGlzLmFwcEVsZW1lbnQgPSBhcHBFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2FtZUxvb3AoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGlmZURpc3BsYXkoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGFwdGVyIG9mIHRoaXMuc3RvcnkuY2hhcHRlcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2NlbmUgb2YgY2hhcHRlci5zY2VuZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YnNjZW5lIG9mIHNjZW5lLnN1YnNjZW5lcykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlTdWJzY2VuZShzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwbGF5U3Vic2NlbmUoc3Vic2NlbmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IGA8aW1nIHdpZHRoPVwiNTAwcHhcIiBzcmM9XCIke3N1YnNjZW5lLmltYWdlfVwiIGFsdD1cIlwiPmA7XG4gICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICB0aGlzLnR5cGVXcml0ZXIoc3Vic2NlbmUudGV4dCwgdGV4dENvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDEwMDAgOiBzdWJzY2VuZS5kdXJhdGlvbiAqIDEwMDA7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXNwbGF5Q2hhbGxlbmdlKGNoYWxsZW5nZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gY2hhbGxlbmdlLmRpc3BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHlwZVdyaXRlcih0ZXh0LCBlbGVtZW50LCBzcGVlZCA9IDUwKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZnVuY3Rpb24gdHlwZSgpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MICs9IHRleHQuY2hhckF0KGkpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0eXBlLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSgpO1xuICAgIH1cblxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGFsbGVuZ2UgYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsdGVybmF0aXZlXCJdOmNoZWNrZWQnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuc3dlciA9IHNlbGVjdGVkT3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChhbnN3ZXIgPT0gY2hhbGxlbmdlLmNvcnJlY3RBbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbGxlbmdlLmNhbGxiYWNrKGNoYWxsZW5nZS5xdWVzdGlvbiwgYW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlmZS0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUxpZmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50LmlubmVySFRNTCA9IGBWaWRhczogJHt0aGlzLmxpZmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IFwiPGgxPlZvY8OqIHBlcmRldTwvaDE+XCI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY2hhcHRlcnMpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLmNoYXB0ZXJzID0gY2hhcHRlcnM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDaGFwdGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZXMpIHtcbiAgICAgICAgdGhpcy5zY2VuZXMgPSBzY2VuZXM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIHN1YnNjZW5lcywgY2hhbGxlbmdlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5zdWJzY2VuZXMgPSBzdWJzY2VuZXM7XG4gICAgICAgIHRoaXMuY2hhbGxlbmdlID0gY2hhbGxlbmdlO1xuICAgIH1cbn1cblxuXG5cblxuIiwiZXhwb3J0IGNsYXNzIFN1YlNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBpbWFnZSwgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuXG4gICAgZGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInN1YnNjZW5lXCI+XG4gICAgICAgICAgICA8cD4ke3RoaXMudGV4dH08L3A+XG4gICAgICAgICAgICA8aW1nIHNyYz1cIiR7dGhpcy5pbWFnZX1cIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgYFxuICAgIH1cbiB9IiwiZXhwb3J0IGNsYXNzIENoYWxsZW5nZSB7XG4gICAgY29uc3RydWN0b3IocXVlc3Rpb24sIGltYWdlLCBhbHRlcm5hdGl2ZXMsIGNvcnJlY3RBbnN3ZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmFsdGVybmF0aXZlcyA9IGFsdGVybmF0aXZlcztcbiAgICAgICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gY29ycmVjdEFuc3dlcjtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBcbiAgICBkaXNwbGF5KCkge1xuICAgICAgIHJldHVybiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgIDxoMj4ke3RoaXMucXVlc3Rpb259PC9oMj5cbiAgICAgICAgICAgIDxpbWcgd2lkdGg9XCI1MDBweFwiIHNyYz1cIiR7dGhpcy5pbWFnZX1cIiAvPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICR7dGhpcy5hbHRlcm5hdGl2ZXMubWFwKChhbHRlcm5hdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIG5hbWU9XCJhbHRlcm5hdGl2ZVwiIHZhbHVlPVwiJHtpbmRleH1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCI+JHthbHRlcm5hdGl2ZX08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiJHt0aGlzLmNhbGxiYWNrfSgpXCI+U3VibWl0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBgXG4gICAgfVxufSIsImltcG9ydCB7IEdhbWVQbGF5IH0gZnJvbSBcIi4vR2FtZVwiO1xuaW1wb3J0IHsgU3RvcnkgfSBmcm9tIFwiLi9TdG9yeVwiO1xuaW1wb3J0IHsgQ2hhcHRlciB9IGZyb20gXCIuL0NoYXB0ZXJcIjtcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4vU2NlbmVcIjtcbmltcG9ydCB7IFN1YlNjZW5lIH0gZnJvbSBcIi4vU3ViU2NlbmVcIjtcbmltcG9ydCB7IENoYWxsZW5nZSB9IGZyb20gXCIuL0NoYWxsZW5nZVwiO1xuXG5cbmNvbnN0IGFwcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5cbmNvbnN0IGNoYWxsZW5nZUNhbGxiYWNrID0gKHNjZW5lVGl0bGUsIGFuc3dlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTY2VuZTogJHtzY2VuZVRpdGxlfWApO1xuICAgIGNvbnNvbGUubG9nKGBBbnN3ZXI6ICR7YW5zd2VyfWApO1xufVxuXG5jb25zdCBjaGFwdGVycyA9IFtcbiAgICBuZXcgQ2hhcHRlcihbXG4gICAgICAgIG5ldyBTY2VuZShcIk8gQ2hhbWFkbyBkbyBHdWFyZGnDo29cIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIHVtIGpvdmVtIHNhbXVyYWksIGFjb3JkYSBjb20gdW0gZXN0cmFuaG8gc29tIHZpbmRvIGRvIGphcmRpbSBkbyBzZXUgZG9qby4gQW8gaW52ZXN0aWdhciwgZWxlIGVuY29udHJhIHVtIGVzcMOtcml0byBndWFyZGnDo28gY2hhbWFkbyBZdWtpbXVyYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltZy9fNWQzZGQxNTMtNWY0Yi00YmFmLTgzOTItNDAzODg1YjkzZGFhLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiWXVraW11cmEgZXN0w6EgZGVzZXNwZXJhZG8gZSBwZWRlIGEgYWp1ZGEgZGUgSGlyb3NoaSBwYXJhIHNhbHZhciBhIFByaW5jZXNhIEFrZW1pLCBxdWUgZm9pIHNlcXVlc3RyYWRhIHBlbG8gc29tYnJpbyBTZW5ob3IgZGFzIFNvbWJyYXMsIERhaWNoaS4gSGlyb3NoaSwgaW5pY2lhbG1lbnRlIGhlc2l0YW50ZSwgc2UgbGVtYnJhIGRhcyBoaXN0w7NyaWFzIGRvcyBhbnRpZ29zIGhlcsOzaXMgc2FtdXJhaXMgcXVlIHNhbHZhcmFtIG8gcmVpbm8gZSBkZWNpZGUgcXVlIGFnb3JhIMOpIHN1YSB2ZXogZGUgc2VyIG8gaGVyw7NpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1nL180NTg5ZDRlOS1iNTMzLTRjMGEtYWZmNi1iMTdhNDg5NmFhZDEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJFbmNvbnRyYXIgYSBjaGF2ZSBkYSBwb3J0YSBkbyBxdWFydG8gZGUgSGlyb3NoaVwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltZy9fZTZlYzFhM2UtYjczYS00ZTA2LWIzNDctZWQzZDJjODk0MTllLmpwZWdcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBwcmVjaXNhIGVuY29udHJhciBhIGNoYXZlIGRhIHBvcnRhIGRvIHF1YXJ0byBwYXJhIHBvZGVyIHNhaXIgZGUgY2FzYSBlIGlyIGFvIGVuY29udHJvIGRlIFl1a2ltdXJhLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkEgY2hhdmUgZXN0w6EgZXNjb25kaWRhIGVtIHVtIGRvcyB2YXNvcyBkZSBwbGFudGFzIGRvIGphcmRpbS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGRldmUgcHJvY3VyYXIgYSBjaGF2ZSBlbSBjYWRhIHVtIGRvcyB2YXNvcyBkZSBwbGFudGFzIGF0w6kgZW5jb250csOhLWxhLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgSm9ybmFkYSBDb21lw6dhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgWXVraW11cmEgcGFydGVtIGVtIGJ1c2NhIGRhIFByaW5jZXNhLiBObyBjYW1pbmhvLCBlbGVzIGVuZnJlbnRhbSBndWVycmVpcm9zIGRhcyBzb21icmFzIGUgZW5jb250cmFtIEhhbmEsIHVtYSDDoWdpbCBrdW5vaWNoaSBwcmVzYSBlbSB1bWEgYXJtYWRpbGhhLiBFbGVzIGEgbGliZXJ0YW0gZSBnYW5oYW0gdW1hIG5vdmEgYWxpYWRhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1nL18zY2NiNTc2Ni03YTAwLTRhYTMtYWM1Ni03MGZlODFmM2JlZDUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbSBzZWd1aWRhLCBlbmNvbnRyYW0gS2VuamksIHVtIHPDoWJpbyBtb25nZSwgcXVlIHRyYXogaW5mb3JtYcOnw7VlcyB2YWxpb3NhcyBzb2JyZSBhIGxvY2FsaXphw6fDo28gZGUgQWtlbWkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWcvX2Q3NDk1NTM3LTkwY2ItNDQzZS1hMGY1LWFjYjFhZmU5YWIzOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiRW5jb250cmFyIGEgc2HDrWRhIGRhIGZsb3Jlc3RhXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1nL19lNmVjMWEzZS1iNzNhLTRlMDYtYjM0Ny1lZDNkMmM4OTQxOWUuanBlZ1wiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBZdWtpbXVyYSwgSGFuYSBlIEtlbmppIGVzdMOjbyBwZXJkaWRvcyBuYSBmbG9yZXN0YS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHByZWNpc2FtIGVuY29udHJhciBhIHNhw61kYSBwYXJhIGNvbnRpbnVhciBhIGpvcm5hZGEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQSBzYcOtZGEgZXN0w6EgZXNjb25kaWRhIGF0csOhcyBkZSB1bWEgY2FjaG9laXJhLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG5dO1xuXG5cbmNvbnN0IHN0b3J5ID0gbmV3IFN0b3J5KFwiQSBBdmVudHVyYSBkZSBIaXJvc2hpIG5vIFJlaW5vIGRhcyBTb21icmFzXCIsIGNoYXB0ZXJzKTtcbmNvbnN0IGdhbWUgPSBuZXcgR2FtZVBsYXkoc3RvcnksIGFwcEVsLCBsaWZlRWwsIFwibm9ybWFsXCIpO1xuZ2FtZS5nYW1lTG9vcCgpO1xuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFFBQVEsQ0FBQztJQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLFFBQVEsRUFBRTtRQUN6RCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztLQUNqQjs7SUFFRCxNQUFNLFFBQVEsR0FBRztR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
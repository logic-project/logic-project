(function () {
'use strict';

class GamePlay {
    constructor(story, appElement, scoreElement, lifeElement, mode = 'normal') {
        this.story = story;
        this.appElement = appElement;
        this.scoreElement = scoreElement;
        this.lifeElement = lifeElement;
        this.mode = mode;
        this.life = 3;
        this.score = 0;
        this.baseUrl = window.location.hostname === "" ? '' : 'logic-project';
    }

    async gameLoop() {
        this.updateLifeDisplay();
        this.updateScoreDisplay();
        for (const chapter of this.story.chapters) {
            for (const scene of chapter.scenes) {
                for (const subscene of scene.subscenes) {
                    await this.displaySubscene(scene, subscene);
                }

                await this.displayChallenge(scene.challenge);
            }
        }
    }

    displaySubscene(scene, subscene) {
        return new Promise(resolve => {
            const subsceneContainer = document.createElement('div');
            subsceneContainer.classList.add('subscene');
            subsceneContainer.innerHTML = `<h1 class="subscene__title">${scene.title}</h1>`;
            
            const img = new Image();
            img.classList.add('subscene__img');
            img.src = subscene.image;
            img.onload = () => {
                const textContainer = document.createElement('div');
                textContainer.classList.add('subscene__text');
                subsceneContainer.appendChild(img);
                subsceneContainer.appendChild(textContainer);
                this.appElement.innerHTML = '';
                this.appElement.appendChild(subsceneContainer);
                
                this.typeWriter(subscene.text, textContainer);
    
                const subsceneDuration = this.mode === 'fast' ? 500 : subscene.duration * 1000;
    
                setTimeout(() => {
                    resolve();
                }, subsceneDuration);
            };
            img.onerror = () => {
                console.error('Failed to load image:', subscene.image);
                resolve(); 
            };
        });
    }
    
    displayChallenge(challenge) {
        return new Promise(resolve => {
            this.appElement.innerHTML = challenge.display();
            this.addChallengeEventListeners(challenge, resolve);
        });
    }

    typeWriter(text, element, speed = 40) {
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
            const img = new Image();
            img.classList.add('challenge__img');
            img.src = challenge.image;
            img.onload = () => {
                this.appElement.innerHTML = challenge.display();
                this.addChallengeEventListeners(challenge, resolve);
            };
            img.onerror = () => {
                console.error('Failed to load image:', challenge.image);
                resolve();
            };
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
                    this.score++;
                    this.updateScoreDisplay();
                    resolve();
                } else {
                    this.life--;
                    this.updateLifeDisplay();
                    if (this.life <= 0) {
                        this.gameOver();
                        // resolve();
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

    updateScoreDisplay() {
        this.scoreElement.innerHTML = `Pontos: ${this.score}`;
    }

    gameOver() {
        const img = new Image();
        img.classList.add('game_over__image');
        img.src = `assets/images/cenas/derrota/2.jpeg`;
        img.onload = () => {
            const gameOverConteiner = document.createElement('div');
            gameOverConteiner.classList.add('game_over');
            gameOverConteiner.innerHTML = `<h1>Game Over</h1>`;
            gameOverConteiner.innerHTML += `<p class="game_over__score">Pontuação: ${this.score}</p>`;    
            gameOverConteiner.appendChild(img);
            gameOverConteiner.innerHTML += `<a href="" class="game_over__button">Reiniciar</a>`;
            this.appElement.innerHTML = '';
            this.appElement.appendChild(gameOverConteiner);
        };
        img.onerror = () => {
            console.error('Failed to load game over image');
        };

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
                <h2 class="challenge__title">Desafio</h2>
                <p class="challenge__question">${this.question}</p>
                <img class="challenge__img" src="${this.image}" />
                <ul class="challenge__list">
                    ${this.alternatives.map((alternative, index) => {
                        return `
                        <li class="challenge__item">
                            <input type="radio" id="alternative${index}" name="alternative" value="${index}" class="challenge__input">
                            <label for="alternative${index}" class="challenge__label">${alternative}</label>
                        </li>
                        `;
                    }).join('')}
                </ul>
                <button onclick="${this.callback}()" class="challenge__button">Responder</button>
            </div>
        `;
    }
    
}

const appEl = document.getElementById("app");
const lifeEl = document.getElementById("life");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start");
const startScreen = document.getElementById("start-screen");

const challengeCallback = (sceneTitle, answer) => {
    console.log(`Scene: ${sceneTitle}`);
    console.log(`Answer: ${answer}`);
};


const chapters = [
    new Chapter([
        new Scene("O Chamado do Guardião", 
            [
                new SubScene(
                    "Hiroshi, um jovem samurai, acorda com um estranho som vindo do jardim do seu dojo.", 
                    "assets/images/cenas/1/1_1.jpeg", 
                    7
                ),
                new SubScene(
                    "Ao investigar, ele encontra um espírito guardião chamado Yukimura.", 
                    "assets/images/cenas/1/1_3.jpeg", 
                    6
                ),
                new SubScene(
                    "Yukimura está desesperado e pede a ajuda de Hiroshi para salvar a Princesa Akemi, que foi sequestrada pelo sombrio Senhor das Sombras, Daichi.", 
                    "assets/images/cenas/1/1_8.jpeg", 
                    8
                ),
                new SubScene(
                    "Hiroshi, inicialmente hesitante, se lembra das histórias dos antigos heróis samurais que salvaram o reino e decide que agora é sua vez de ser o herói.", 
                    "assets/images/cenas/1/1_8.jpeg", 
                    9
                ),
            ],
            new Challenge(
                "Encontrar a chave da porta do quarto de Hiroshi",
                "assets/images/cenas/1/1_3.jpeg", 
                [
                    "Hiroshi precisa encontrar a chave da porta do quarto para poder sair de casa e ir ao encontro de Yukimura.",
                    "A chave está escondida em um dos vasos de plantas do jardim.",
                    "Hiroshi deve procurar a chave em cada um dos vasos de plantas até encontrá-la."
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("A Jornada Começa", 
            [
                new SubScene(
                    "Hiroshi e Yukimura partem em busca da Princesa.", 
                    "assets/images/cenas/2/2_1.jpeg", 
                    4
                ),
                new SubScene(
                    "No caminho, eles enfrentam guerreiros das sombras e encontram Hana, uma ágil kunoichi presa em uma armadilha. Eles a libertam e ganham uma nova aliada.", 
                    "assets/images/cenas/2/2_2.jpeg", 
                    9
                ),
                new SubScene(
                    "Em seguida, encontram Kenji, um sábio monge, que traz informações valiosas sobre a localização de Akemi.", 
                    "assets/images/cenas/2/2_6.jpeg", 
                    7
                ),
            ],
            new Challenge(
                "Encontrar a saída da floresta",
                "assets/images/cenas/2/2_6.jpeg",
                [
                    "Hiroshi, Yukimura, Hana e Kenji estão perdidos na floresta.",
                    "Eles precisam encontrar a saída para continuar a jornada.",
                    "A saída está escondida atrás de uma cachoeira."
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("O Bosque das Sombras", 
            [
                new SubScene(
                    "Hiroshi e seus amigos entram em um bosque sombrio cheio de armadilhas e desafios.", 
                    "assets/images/cenas/3/3_1.jpeg", 
                    6
                ),
                new SubScene(
                    "O ambiente é escuro, com caminhos que parecem mudar de lugar. Eles enfrentam obstáculos como caminhos que desaparecem e árvores que se movem.", 
                    "assets/images/cenas/3/3_4.jpeg", 
                    9
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/3/3_4.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("O Encontro com Daichi", 
            [
                new SubScene(
                    "No coração do bosque, Hiroshi encontra Daichi, o vilão, sentado em um trono feito de ossos e pedras.", 
                    "assets/images/cenas/4/4_2.jpeg", 
                    7
                ),
                new SubScene(
                    "Daichi revela que capturou Akemi para atrair o verdadeiro herói, mas está surpreso ao ver Hiroshi. Ele subestima Hiroshi e o desafia a resolver um enigma de lógica.", 
                    "assets/images/cenas/4/4_2.jpeg", 
                    11
                ),
                new SubScene(
                    "Hiroshi e seus amigos escapam do bosque após resolver o enigma de Daichi. No entanto, Daichi, furioso, os persegue. Eles encontram um torii mágico que pode levá-los para fora do bosque, mas precisam ativá-lo.", 
                    "assets/images/cenas/4/4_5.jpeg", 
                    13
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/4/4_5.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("A Fuga", 
            [
                new SubScene(
                    "Hiroshi e seus amigos escapam do bosque após resolver o enigma de Daichi. No entanto, Daichi, furioso, os persegue. Eles encontram um torii mágico que pode levá-los para fora do bosque, mas precisam ativá-lo.", 
                    "assets/images/cenas/5/5_2.jpeg", 
                    13
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/5/5_2.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
    ]),
    new Chapter([
        new Scene("O Vilarejo Sem Vida", 
            [
                new SubScene(
                    "Hiroshi e companhia emergem do torii mágico e chegam ao Reino das Sombras, onde as coisas não possuem vida nem cor.", 
                    "assets/images/cenas/6/6_1.jpeg", 
                    10
                ),
                new SubScene(
                    "Eles são recebidos por Ayame, uma sacerdotisa e mestra da caligrafia e da pintura mágica, que traz vida às coisas com sua arte.", 
                    "assets/images/cenas/6/6_5.jpeg", 
                    10
                ),
                new SubScene(
                    "Ayame explica que para avançar, eles precisam restaurar a vida de várias áreas que foram desbotadas pelos capangas de Daichi.", 
                    "assets/images/cenas/6/6_8.jpeg", 
                    10
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/6/6_8.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("A Dança dos Guerreiros das Sombras", 
            [
                new SubScene(
                    "Com a primeira área restaurada, Hiroshi e seus amigos continuam sua jornada em busca da princesa e se deparam com um grupo de guerreiros das sombras em um pátio sombrio.", 
                    "assets/images/cenas/7/7_1.jpeg", 
                    13
                ),
                new SubScene(
                    "Ao adentrar a área, Hiroshi descobre que a dança ritualística dos guerreiros das sombras pode desbloquear passagens secretas que Daichi trancou.", 
                    "assets/images/cenas/7/7_3.jpeg", 
                    12
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/7/7_3.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("O Festival dos Pássaros de Papel", 
            [
                new SubScene(
                    "Ao passar por uma passagem secreta desbloqueada pelos guerreiros das sombras, Hiroshi e seus amigos chegam a uma cidade onde está acontecendo um festival de pássaros de papel (origami).", 
                    "assets/images/cenas/8/8_1.jpeg", 
                    13
                ),
                new SubScene(
                    "Eles descobrem que Daichi escondeu chaves nos pássaros de papel para trancar outras áreas do seu Reino.", 
                    "assets/images/cenas/8/8_7.jpeg", 
                    10
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/8/8_7.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("O Resgate da Princesa", 
            [
                new SubScene(
                    "Com todas as áreas restauradas e chaves encontradas, Hiroshi e seus amigos chegam ao castelo de Daichi.", 
                    "assets/images/cenas/9/9_2.jpeg", 
                    10
                ),
                new SubScene(
                    "Akemi está presa em uma cela gigante dentro do castelo, cercado por fogo.", 
                    "assets/images/cenas/9/9_6.jpeg", 
                    8
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/9/9_6.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
        new Scene("A Celebração", 
            [
                new SubScene(
                    "Após salvar a Princesa Akemi e derrotar Daichi, Hiroshi e seus amigos retornam ao Reino da Luz para uma grande celebração.", 
                    "assets/images/cenas/10/10_1.jpeg", 
                    10
                ),
                new SubScene(
                    "Ayame organiza uma festa para os heróis comemorarem a vitória.", 
                    "assets/images/cenas/10/10_4.jpeg", 
                    6
                ),
            ],
            new Challenge(
                "Texto do desafio",
                "assets/images/cenas/10/10_4.jpeg", 
                [
                    "A) alternativa",
                    "B) alternativa",
                    "C) alternativa",
                    "correta C"
                ],
                0,
                challengeCallback
            )
        ),
    ]),
];


startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    appEl.style.display = "block";
    lifeEl.style.display = "block";
    scoreEl.style.display = "block";

    const story = new Story("A Aventura de Hiroshi no Reino das Sombras", chapters);
    const game = new GamePlay(story, appEl, scoreEl, lifeEl, "fast");
    game.gameLoop();
});

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlRWxlbWVudCwgbGlmZUVsZW1lbnQsIG1vZGUgPSAnbm9ybWFsJykge1xuICAgICAgICB0aGlzLnN0b3J5ID0gc3Rvcnk7XG4gICAgICAgIHRoaXMuYXBwRWxlbWVudCA9IGFwcEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwbGF5U3Vic2NlbmUoc2NlbmUsIHN1YnNjZW5lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBzdWJzY2VuZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZScpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInN1YnNjZW5lX190aXRsZVwiPiR7c2NlbmUudGl0bGV9PC9oMT5gO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9faW1nJyk7XG4gICAgICAgICAgICBpbWcuc3JjID0gc3Vic2NlbmUuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0ZXh0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3N1YnNjZW5lX190ZXh0Jyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgICAgICAgICBzdWJzY2VuZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0Q29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHN1YnNjZW5lQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVXcml0ZXIoc3Vic2NlbmUudGV4dCwgdGV4dENvbnRhaW5lcik7XG4gICAgXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NlbmVEdXJhdGlvbiA9IHRoaXMubW9kZSA9PT0gJ2Zhc3QnID8gNTAwIDogc3Vic2NlbmUuZHVyYXRpb24gKiAxMDAwO1xuICAgIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgc3Vic2NlbmVEdXJhdGlvbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1nLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2U6Jywgc3Vic2NlbmUuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTsgXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IGNoYWxsZW5nZS5kaXNwbGF5KCk7XG4gICAgICAgICAgICB0aGlzLmFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHR5cGVXcml0ZXIodGV4dCwgZWxlbWVudCwgc3BlZWQgPSA0MCkge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZ1bmN0aW9uIHR5cGUoKSB7XG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCArPSB0ZXh0LmNoYXJBdChpKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHNldFRpbWVvdXQodHlwZSwgc3BlZWQpO1xuICAgICAgICB9XG4gICAgICAgIHR5cGUoKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5Q2hhbGxlbmdlKGNoYWxsZW5nZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdjaGFsbGVuZ2VfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGNoYWxsZW5nZS5pbWFnZTtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IGNoYWxsZW5nZS5kaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIGNoYWxsZW5nZS5pbWFnZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2hhbGxlbmdlIGJ1dHRvbicpO1xuICAgICAgICBidXR0b24ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJhbHRlcm5hdGl2ZVwiXTpjaGVja2VkJyk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbnN3ZXIgPSBzZWxlY3RlZE9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoYW5zd2VyID09IGNoYWxsZW5nZS5jb3JyZWN0QW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYWxsZW5nZS5jYWxsYmFjayhjaGFsbGVuZ2UucXVlc3Rpb24sIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTY29yZURpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlmZS0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUxpZmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50LmlubmVySFRNTCA9IGBWaWRhczogJHt0aGlzLmxpZmV9YDtcbiAgICB9XG5cbiAgICB1cGRhdGVTY29yZURpc3BsYXkoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50LmlubmVySFRNTCA9IGBQb250b3M6ICR7dGhpcy5zY29yZX1gO1xuICAgIH1cblxuICAgIGdhbWVPdmVyKCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNsYXNzTGlzdC5hZGQoJ2dhbWVfb3Zlcl9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL2RlcnJvdGEvMi5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVPdmVyQ29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXInKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+R2FtZSBPdmVyPC9oMT5gO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cImdhbWVfb3Zlcl9fc2NvcmVcIj5Qb250dWHDp8OjbzogJHt0aGlzLnNjb3JlfTwvcD5gOyAgICBcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cImdhbWVfb3Zlcl9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2FtZU92ZXJDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGdhbWUgb3ZlciBpbWFnZScpO1xuICAgICAgICB9O1xuXG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY2hhcHRlcnMpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLmNoYXB0ZXJzID0gY2hhcHRlcnM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDaGFwdGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZXMpIHtcbiAgICAgICAgdGhpcy5zY2VuZXMgPSBzY2VuZXM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIHN1YnNjZW5lcywgY2hhbGxlbmdlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5zdWJzY2VuZXMgPSBzdWJzY2VuZXM7XG4gICAgICAgIHRoaXMuY2hhbGxlbmdlID0gY2hhbGxlbmdlO1xuICAgIH1cbn1cblxuXG5cblxuIiwiZXhwb3J0IGNsYXNzIFN1YlNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBpbWFnZSwgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuIH0iLCJleHBvcnQgY2xhc3MgQ2hhbGxlbmdlIHtcbiAgICBjb25zdHJ1Y3RvcihxdWVzdGlvbiwgaW1hZ2UsIGFsdGVybmF0aXZlcywgY29ycmVjdEFuc3dlciwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5xdWVzdGlvbiA9IHF1ZXN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuYWx0ZXJuYXRpdmVzID0gYWx0ZXJuYXRpdmVzO1xuICAgICAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBjb3JyZWN0QW5zd2VyO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXkoKSB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhbGxlbmdlXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwiY2hhbGxlbmdlX190aXRsZVwiPkRlc2FmaW88L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiY2hhbGxlbmdlX19xdWVzdGlvblwiPiR7dGhpcy5xdWVzdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImNoYWxsZW5nZV9faW1nXCIgc3JjPVwiJHt0aGlzLmltYWdlfVwiIC8+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiY2hhbGxlbmdlX19saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5hbHRlcm5hdGl2ZXMubWFwKChhbHRlcm5hdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjaGFsbGVuZ2VfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCIgbmFtZT1cImFsdGVybmF0aXZlXCIgdmFsdWU9XCIke2luZGV4fVwiIGNsYXNzPVwiY2hhbGxlbmdlX19pbnB1dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2xhYmVsXCI+JHthbHRlcm5hdGl2ZX08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiJHt0aGlzLmNhbGxiYWNrfSgpXCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2J1dHRvblwiPlJlc3BvbmRlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgfVxuICAgIFxufSIsImltcG9ydCB7IEdhbWVQbGF5IH0gZnJvbSBcIi4vR2FtZVwiO1xuaW1wb3J0IHsgU3RvcnkgfSBmcm9tIFwiLi9TdG9yeVwiO1xuaW1wb3J0IHsgQ2hhcHRlciB9IGZyb20gXCIuL0NoYXB0ZXJcIjtcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4vU2NlbmVcIjtcbmltcG9ydCB7IFN1YlNjZW5lIH0gZnJvbSBcIi4vU3ViU2NlbmVcIjtcbmltcG9ydCB7IENoYWxsZW5nZSB9IGZyb20gXCIuL0NoYWxsZW5nZVwiO1xuXG5cbmNvbnN0IGFwcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5jb25zdCBzY29yZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZVwiKTtcbmNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbmNvbnN0IHN0YXJ0U2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1zY3JlZW5cIik7XG5cbmNvbnN0IGNoYWxsZW5nZUNhbGxiYWNrID0gKHNjZW5lVGl0bGUsIGFuc3dlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTY2VuZTogJHtzY2VuZVRpdGxlfWApO1xuICAgIGNvbnNvbGUubG9nKGBBbnN3ZXI6ICR7YW5zd2VyfWApO1xufVxuXG5cbmNvbnN0IGNoYXB0ZXJzID0gW1xuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBDaGFtYWRvIGRvIEd1YXJkacOjb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgdW0gam92ZW0gc2FtdXJhaSwgYWNvcmRhIGNvbSB1bSBlc3RyYW5obyBzb20gdmluZG8gZG8gamFyZGltIGRvIHNldSBkb2pvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBpbnZlc3RpZ2FyLCBlbGUgZW5jb250cmEgdW0gZXNww61yaXRvIGd1YXJkacOjbyBjaGFtYWRvIFl1a2ltdXJhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJZdWtpbXVyYSBlc3TDoSBkZXNlc3BlcmFkbyBlIHBlZGUgYSBhanVkYSBkZSBIaXJvc2hpIHBhcmEgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWksIHF1ZSBmb2kgc2VxdWVzdHJhZGEgcGVsbyBzb21icmlvIFNlbmhvciBkYXMgU29tYnJhcywgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBpbmljaWFsbWVudGUgaGVzaXRhbnRlLCBzZSBsZW1icmEgZGFzIGhpc3TDs3JpYXMgZG9zIGFudGlnb3MgaGVyw7NpcyBzYW11cmFpcyBxdWUgc2FsdmFyYW0gbyByZWlubyBlIGRlY2lkZSBxdWUgYWdvcmEgw6kgc3VhIHZleiBkZSBzZXIgbyBoZXLDs2kuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkVuY29udHJhciBhIGNoYXZlIGRhIHBvcnRhIGRvIHF1YXJ0byBkZSBIaXJvc2hpXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgcHJlY2lzYSBlbmNvbnRyYXIgYSBjaGF2ZSBkYSBwb3J0YSBkbyBxdWFydG8gcGFyYSBwb2RlciBzYWlyIGRlIGNhc2EgZSBpciBhbyBlbmNvbnRybyBkZSBZdWtpbXVyYS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBIGNoYXZlIGVzdMOhIGVzY29uZGlkYSBlbSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBkbyBqYXJkaW0uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBkZXZlIHByb2N1cmFyIGEgY2hhdmUgZW0gY2FkYSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBhdMOpIGVuY29udHLDoS1sYS5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEpvcm5hZGEgQ29tZcOnYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIFl1a2ltdXJhIHBhcnRlbSBlbSBidXNjYSBkYSBQcmluY2VzYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA0XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY2FtaW5obywgZWxlcyBlbmZyZW50YW0gZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlIGVuY29udHJhbSBIYW5hLCB1bWEgw6FnaWwga3Vub2ljaGkgcHJlc2EgZW0gdW1hIGFybWFkaWxoYS4gRWxlcyBhIGxpYmVydGFtIGUgZ2FuaGFtIHVtYSBub3ZhIGFsaWFkYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRW0gc2VndWlkYSwgZW5jb250cmFtIEtlbmppLCB1bSBzw6FiaW8gbW9uZ2UsIHF1ZSB0cmF6IGluZm9ybWHDp8O1ZXMgdmFsaW9zYXMgc29icmUgYSBsb2NhbGl6YcOnw6NvIGRlIEFrZW1pLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJFbmNvbnRyYXIgYSBzYcOtZGEgZGEgZmxvcmVzdGFcIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzYuanBlZ1wiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBZdWtpbXVyYSwgSGFuYSBlIEtlbmppIGVzdMOjbyBwZXJkaWRvcyBuYSBmbG9yZXN0YS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHByZWNpc2FtIGVuY29udHJhciBhIHNhw61kYSBwYXJhIGNvbnRpbnVhciBhIGpvcm5hZGEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQSBzYcOtZGEgZXN0w6EgZXNjb25kaWRhIGF0csOhcyBkZSB1bWEgY2FjaG9laXJhLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gQm9zcXVlIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZW50cmFtIGVtIHVtIGJvc3F1ZSBzb21icmlvIGNoZWlvIGRlIGFybWFkaWxoYXMgZSBkZXNhZmlvcy5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTyBhbWJpZW50ZSDDqSBlc2N1cm8sIGNvbSBjYW1pbmhvcyBxdWUgcGFyZWNlbSBtdWRhciBkZSBsdWdhci4gRWxlcyBlbmZyZW50YW0gb2JzdMOhY3Vsb3MgY29tbyBjYW1pbmhvcyBxdWUgZGVzYXBhcmVjZW0gZSDDoXJ2b3JlcyBxdWUgc2UgbW92ZW0uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBFbmNvbnRybyBjb20gRGFpY2hpXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjb3Jhw6fDo28gZG8gYm9zcXVlLCBIaXJvc2hpIGVuY29udHJhIERhaWNoaSwgbyB2aWzDo28sIHNlbnRhZG8gZW0gdW0gdHJvbm8gZmVpdG8gZGUgb3Nzb3MgZSBwZWRyYXMuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkRhaWNoaSByZXZlbGEgcXVlIGNhcHR1cm91IEFrZW1pIHBhcmEgYXRyYWlyIG8gdmVyZGFkZWlybyBoZXLDs2ksIG1hcyBlc3TDoSBzdXJwcmVzbyBhbyB2ZXIgSGlyb3NoaS4gRWxlIHN1YmVzdGltYSBIaXJvc2hpIGUgbyBkZXNhZmlhIGEgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTFcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEZ1Z2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS81XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIFZpbGFyZWpvIFNlbSBWaWRhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgY29tcGFuaGlhIGVtZXJnZW0gZG8gdG9yaWkgbcOhZ2ljbyBlIGNoZWdhbSBhbyBSZWlubyBkYXMgU29tYnJhcywgb25kZSBhcyBjb2lzYXMgbsOjbyBwb3NzdWVtIHZpZGEgbmVtIGNvci5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgc8OjbyByZWNlYmlkb3MgcG9yIEF5YW1lLCB1bWEgc2FjZXJkb3Rpc2EgZSBtZXN0cmEgZGEgY2FsaWdyYWZpYSBlIGRhIHBpbnR1cmEgbcOhZ2ljYSwgcXVlIHRyYXogdmlkYSDDoHMgY29pc2FzIGNvbSBzdWEgYXJ0ZS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkF5YW1lIGV4cGxpY2EgcXVlIHBhcmEgYXZhbsOnYXIsIGVsZXMgcHJlY2lzYW0gcmVzdGF1cmFyIGEgdmlkYSBkZSB2w6FyaWFzIMOhcmVhcyBxdWUgZm9yYW0gZGVzYm90YWRhcyBwZWxvcyBjYXBhbmdhcyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgRGFuw6dhIGRvcyBHdWVycmVpcm9zIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gYSBwcmltZWlyYSDDoXJlYSByZXN0YXVyYWRhLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY29udGludWFtIHN1YSBqb3JuYWRhIGVtIGJ1c2NhIGRhIHByaW5jZXNhIGUgc2UgZGVwYXJhbSBjb20gdW0gZ3J1cG8gZGUgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlbSB1bSBww6F0aW8gc29tYnJpby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGFkZW50cmFyIGEgw6FyZWEsIEhpcm9zaGkgZGVzY29icmUgcXVlIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2EgZG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgcG9kZSBkZXNibG9xdWVhciBwYXNzYWdlbnMgc2VjcmV0YXMgcXVlIERhaWNoaSB0cmFuY291LlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEZlc3RpdmFsIGRvcyBQw6Fzc2Fyb3MgZGUgUGFwZWxcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIHBhc3NhciBwb3IgdW1hIHBhc3NhZ2VtIHNlY3JldGEgZGVzYmxvcXVlYWRhIHBlbG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYSB1bWEgY2lkYWRlIG9uZGUgZXN0w6EgYWNvbnRlY2VuZG8gdW0gZmVzdGl2YWwgZGUgcMOhc3Nhcm9zIGRlIHBhcGVsIChvcmlnYW1pKS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgZGVzY29icmVtIHF1ZSBEYWljaGkgZXNjb25kZXUgY2hhdmVzIG5vcyBww6Fzc2Fyb3MgZGUgcGFwZWwgcGFyYSB0cmFuY2FyIG91dHJhcyDDoXJlYXMgZG8gc2V1IFJlaW5vLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF83LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfNy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIFJlc2dhdGUgZGEgUHJpbmNlc2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbSB0b2RhcyBhcyDDoXJlYXMgcmVzdGF1cmFkYXMgZSBjaGF2ZXMgZW5jb250cmFkYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYW8gY2FzdGVsbyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBa2VtaSBlc3TDoSBwcmVzYSBlbSB1bWEgY2VsYSBnaWdhbnRlIGRlbnRybyBkbyBjYXN0ZWxvLCBjZXJjYWRvIHBvciBmb2dvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgQ2VsZWJyYcOnw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBcMOzcyBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSBlIGRlcnJvdGFyIERhaWNoaSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIHJldG9ybmFtIGFvIFJlaW5vIGRhIEx1eiBwYXJhIHVtYSBncmFuZGUgY2VsZWJyYcOnw6NvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBvcmdhbml6YSB1bWEgZmVzdGEgcGFyYSBvcyBoZXLDs2lzIGNvbWVtb3JhcmVtIGEgdml0w7NyaWEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG5dO1xuXG5cbnN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgc3RhcnRTY3JlZW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGFwcEVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgbGlmZUVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc2NvcmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgY29uc3Qgc3RvcnkgPSBuZXcgU3RvcnkoXCJBIEF2ZW50dXJhIGRlIEhpcm9zaGkgbm8gUmVpbm8gZGFzIFNvbWJyYXNcIiwgY2hhcHRlcnMpO1xuICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZVBsYXkoc3RvcnksIGFwcEVsLCBzY29yZUVsLCBsaWZlRWwsIFwiZmFzdFwiKTtcbiAgICBnYW1l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
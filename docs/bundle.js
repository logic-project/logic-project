(function () {
'use strict';

class GamePlay {
    constructor(story, appElement, scorePanelEl, scoreElement, lifeElement, mode = 'normal') {
        this.story = story;
        this.appElement = appElement;
        this.scorePanelEl = scorePanelEl;
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
        if (this.life > 0) {
            this.showVictoryScreen();
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
            this.scorePanelEl.classList.add('hidden');
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

    showVictoryScreen() {
        const img = new Image();
        img.classList.add('victory__image');
        img.src = `assets/images/cenas/vitoria/1.jpeg`;
        img.onload = () => {
            this.scorePanelEl.classList.add('hidden');
            const victoryConteiner = document.createElement('div');
            victoryConteiner.classList.add('victory');
            victoryConteiner.innerHTML = `<h1>Vitória</h1>`;
            victoryConteiner.innerHTML += `<p class="victory__score">Pontuação: ${this.score}</p>`;    
            victoryConteiner.appendChild(img);
            victoryConteiner.innerHTML += `<a href="" class="victory__button">Reiniciar</a>`;
            this.appElement.innerHTML = '';
            this.appElement.appendChild(victoryConteiner);
        };
        img.onerror = () => {
            console.error('Failed to load victory image');
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
const scorePanelEl = document.getElementById("score_panel");
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
    const game = new GamePlay(story, appEl, scorePanelEl, scoreEl, lifeEl, "normal");
    game.gameLoop();
});

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbGVtZW50LCBsaWZlRWxlbWVudCwgbW9kZSA9ICdub3JtYWwnKSB7XG4gICAgICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50ID0gYXBwRWxlbWVudDtcbiAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwgPSBzY29yZVBhbmVsRWw7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlmZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpY3RvcnlTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDUwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnY2hhbGxlbmdlX19pbWcnKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBjaGFsbGVuZ2UuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBjaGFsbGVuZ2UuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNoYWxsZW5nZSBidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWx0ZXJuYXRpdmVcIl06Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyID0gc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuc3dlciA9PSBjaGFsbGVuZ2UuY29ycmVjdEFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgICBjaGFsbGVuZ2UuY2FsbGJhY2soY2hhbGxlbmdlLnF1ZXN0aW9uLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3JlKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaWZlRGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5saWZlRWxlbWVudC5pbm5lckhUTUwgPSBgVmlkYXM6ICR7dGhpcy5saWZlfWA7XG4gICAgfVxuXG4gICAgdXBkYXRlU2NvcmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC5pbm5lckhUTUwgPSBgUG9udG9zOiAke3RoaXMuc2NvcmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXJfX2ltYWdlJyk7XG4gICAgICAgIGltZy5zcmMgPSBgYXNzZXRzL2ltYWdlcy9jZW5hcy9kZXJyb3RhLzIuanBlZ2A7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjb3JlUGFuZWxFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVPdmVyQ29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXInKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+R2FtZSBPdmVyPC9oMT5gO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cImdhbWVfb3Zlcl9fc2NvcmVcIj5Qb250dWHDp8OjbzogJHt0aGlzLnNjb3JlfTwvcD5gOyAgICBcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cImdhbWVfb3Zlcl9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2FtZU92ZXJDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGdhbWUgb3ZlciBpbWFnZScpO1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgc2hvd1ZpY3RvcnlTY3JlZW4oKSB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgndmljdG9yeV9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL3ZpdG9yaWEvMS5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVQYW5lbEVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc3QgdmljdG9yeUNvbnRlaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCd2aWN0b3J5Jyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+Vml0w7NyaWE8L2gxPmA7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCArPSBgPHAgY2xhc3M9XCJ2aWN0b3J5X19zY29yZVwiPlBvbnR1YcOnw6NvOiAke3RoaXMuc2NvcmV9PC9wPmA7ICAgIFxuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cInZpY3RvcnlfX2J1dHRvblwiPlJlaW5pY2lhcjwvYT5gO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHZpY3RvcnlDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHZpY3RvcnkgaW1hZ2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjaGFwdGVycykge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuY2hhcHRlcnMgPSBjaGFwdGVycztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIENoYXB0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lcykge1xuICAgICAgICB0aGlzLnNjZW5lcyA9IHNjZW5lcztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgc3Vic2NlbmVzLCBjaGFsbGVuZ2UpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLnN1YnNjZW5lcyA9IHN1YnNjZW5lcztcbiAgICAgICAgdGhpcy5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2U7XG4gICAgfVxufVxuXG5cblxuXG4iLCJleHBvcnQgY2xhc3MgU3ViU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRleHQsIGltYWdlLCBkdXJhdGlvbikge1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9XG4gfSIsImV4cG9ydCBjbGFzcyBDaGFsbGVuZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHF1ZXN0aW9uLCBpbWFnZSwgYWx0ZXJuYXRpdmVzLCBjb3JyZWN0QW5zd2VyLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnF1ZXN0aW9uID0gcXVlc3Rpb247XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5hbHRlcm5hdGl2ZXMgPSBhbHRlcm5hdGl2ZXM7XG4gICAgICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGNvcnJlY3RBbnN3ZXI7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgXG4gICAgZGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJjaGFsbGVuZ2VfX3RpdGxlXCI+RGVzYWZpbzwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjaGFsbGVuZ2VfX3F1ZXN0aW9uXCI+JHt0aGlzLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiY2hhbGxlbmdlX19pbWdcIiBzcmM9XCIke3RoaXMuaW1hZ2V9XCIgLz5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJjaGFsbGVuZ2VfX2xpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmFsdGVybmF0aXZlcy5tYXAoKGFsdGVybmF0aXZlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImNoYWxsZW5nZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBuYW1lPVwiYWx0ZXJuYXRpdmVcIiB2YWx1ZT1cIiR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9fbGFiZWxcIj4ke2FsdGVybmF0aXZlfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCIke3RoaXMuY2FsbGJhY2t9KClcIiBjbGFzcz1cImNoYWxsZW5nZV9fYnV0dG9uXCI+UmVzcG9uZGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9XG4gICAgXG59IiwiaW1wb3J0IHsgR2FtZVBsYXkgfSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBTdG9yeSB9IGZyb20gXCIuL1N0b3J5XCI7XG5pbXBvcnQgeyBDaGFwdGVyIH0gZnJvbSBcIi4vQ2hhcHRlclwiO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZVwiO1xuaW1wb3J0IHsgU3ViU2NlbmUgfSBmcm9tIFwiLi9TdWJTY2VuZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4vQ2hhbGxlbmdlXCI7XG5cblxuY29uc3QgYXBwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IHNjb3JlUGFuZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NvcmVfcGFuZWxcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5jb25zdCBzY29yZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZVwiKTtcbmNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbmNvbnN0IHN0YXJ0U2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1zY3JlZW5cIik7XG5cbmNvbnN0IGNoYWxsZW5nZUNhbGxiYWNrID0gKHNjZW5lVGl0bGUsIGFuc3dlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTY2VuZTogJHtzY2VuZVRpdGxlfWApO1xuICAgIGNvbnNvbGUubG9nKGBBbnN3ZXI6ICR7YW5zd2VyfWApO1xufVxuXG5cbmNvbnN0IGNoYXB0ZXJzID0gW1xuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBDaGFtYWRvIGRvIEd1YXJkacOjb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgdW0gam92ZW0gc2FtdXJhaSwgYWNvcmRhIGNvbSB1bSBlc3RyYW5obyBzb20gdmluZG8gZG8gamFyZGltIGRvIHNldSBkb2pvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBpbnZlc3RpZ2FyLCBlbGUgZW5jb250cmEgdW0gZXNww61yaXRvIGd1YXJkacOjbyBjaGFtYWRvIFl1a2ltdXJhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJZdWtpbXVyYSBlc3TDoSBkZXNlc3BlcmFkbyBlIHBlZGUgYSBhanVkYSBkZSBIaXJvc2hpIHBhcmEgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWksIHF1ZSBmb2kgc2VxdWVzdHJhZGEgcGVsbyBzb21icmlvIFNlbmhvciBkYXMgU29tYnJhcywgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBpbmljaWFsbWVudGUgaGVzaXRhbnRlLCBzZSBsZW1icmEgZGFzIGhpc3TDs3JpYXMgZG9zIGFudGlnb3MgaGVyw7NpcyBzYW11cmFpcyBxdWUgc2FsdmFyYW0gbyByZWlubyBlIGRlY2lkZSBxdWUgYWdvcmEgw6kgc3VhIHZleiBkZSBzZXIgbyBoZXLDs2kuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkVuY29udHJhciBhIGNoYXZlIGRhIHBvcnRhIGRvIHF1YXJ0byBkZSBIaXJvc2hpXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgcHJlY2lzYSBlbmNvbnRyYXIgYSBjaGF2ZSBkYSBwb3J0YSBkbyBxdWFydG8gcGFyYSBwb2RlciBzYWlyIGRlIGNhc2EgZSBpciBhbyBlbmNvbnRybyBkZSBZdWtpbXVyYS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBIGNoYXZlIGVzdMOhIGVzY29uZGlkYSBlbSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBkbyBqYXJkaW0uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBkZXZlIHByb2N1cmFyIGEgY2hhdmUgZW0gY2FkYSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBhdMOpIGVuY29udHLDoS1sYS5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEpvcm5hZGEgQ29tZcOnYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIFl1a2ltdXJhIHBhcnRlbSBlbSBidXNjYSBkYSBQcmluY2VzYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA0XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY2FtaW5obywgZWxlcyBlbmZyZW50YW0gZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlIGVuY29udHJhbSBIYW5hLCB1bWEgw6FnaWwga3Vub2ljaGkgcHJlc2EgZW0gdW1hIGFybWFkaWxoYS4gRWxlcyBhIGxpYmVydGFtIGUgZ2FuaGFtIHVtYSBub3ZhIGFsaWFkYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRW0gc2VndWlkYSwgZW5jb250cmFtIEtlbmppLCB1bSBzw6FiaW8gbW9uZ2UsIHF1ZSB0cmF6IGluZm9ybWHDp8O1ZXMgdmFsaW9zYXMgc29icmUgYSBsb2NhbGl6YcOnw6NvIGRlIEFrZW1pLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJFbmNvbnRyYXIgYSBzYcOtZGEgZGEgZmxvcmVzdGFcIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzYuanBlZ1wiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBZdWtpbXVyYSwgSGFuYSBlIEtlbmppIGVzdMOjbyBwZXJkaWRvcyBuYSBmbG9yZXN0YS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHByZWNpc2FtIGVuY29udHJhciBhIHNhw61kYSBwYXJhIGNvbnRpbnVhciBhIGpvcm5hZGEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQSBzYcOtZGEgZXN0w6EgZXNjb25kaWRhIGF0csOhcyBkZSB1bWEgY2FjaG9laXJhLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gQm9zcXVlIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZW50cmFtIGVtIHVtIGJvc3F1ZSBzb21icmlvIGNoZWlvIGRlIGFybWFkaWxoYXMgZSBkZXNhZmlvcy5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTyBhbWJpZW50ZSDDqSBlc2N1cm8sIGNvbSBjYW1pbmhvcyBxdWUgcGFyZWNlbSBtdWRhciBkZSBsdWdhci4gRWxlcyBlbmZyZW50YW0gb2JzdMOhY3Vsb3MgY29tbyBjYW1pbmhvcyBxdWUgZGVzYXBhcmVjZW0gZSDDoXJ2b3JlcyBxdWUgc2UgbW92ZW0uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBFbmNvbnRybyBjb20gRGFpY2hpXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjb3Jhw6fDo28gZG8gYm9zcXVlLCBIaXJvc2hpIGVuY29udHJhIERhaWNoaSwgbyB2aWzDo28sIHNlbnRhZG8gZW0gdW0gdHJvbm8gZmVpdG8gZGUgb3Nzb3MgZSBwZWRyYXMuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkRhaWNoaSByZXZlbGEgcXVlIGNhcHR1cm91IEFrZW1pIHBhcmEgYXRyYWlyIG8gdmVyZGFkZWlybyBoZXLDs2ksIG1hcyBlc3TDoSBzdXJwcmVzbyBhbyB2ZXIgSGlyb3NoaS4gRWxlIHN1YmVzdGltYSBIaXJvc2hpIGUgbyBkZXNhZmlhIGEgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTFcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEZ1Z2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS81XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIFZpbGFyZWpvIFNlbSBWaWRhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgY29tcGFuaGlhIGVtZXJnZW0gZG8gdG9yaWkgbcOhZ2ljbyBlIGNoZWdhbSBhbyBSZWlubyBkYXMgU29tYnJhcywgb25kZSBhcyBjb2lzYXMgbsOjbyBwb3NzdWVtIHZpZGEgbmVtIGNvci5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgc8OjbyByZWNlYmlkb3MgcG9yIEF5YW1lLCB1bWEgc2FjZXJkb3Rpc2EgZSBtZXN0cmEgZGEgY2FsaWdyYWZpYSBlIGRhIHBpbnR1cmEgbcOhZ2ljYSwgcXVlIHRyYXogdmlkYSDDoHMgY29pc2FzIGNvbSBzdWEgYXJ0ZS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkF5YW1lIGV4cGxpY2EgcXVlIHBhcmEgYXZhbsOnYXIsIGVsZXMgcHJlY2lzYW0gcmVzdGF1cmFyIGEgdmlkYSBkZSB2w6FyaWFzIMOhcmVhcyBxdWUgZm9yYW0gZGVzYm90YWRhcyBwZWxvcyBjYXBhbmdhcyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgRGFuw6dhIGRvcyBHdWVycmVpcm9zIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gYSBwcmltZWlyYSDDoXJlYSByZXN0YXVyYWRhLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY29udGludWFtIHN1YSBqb3JuYWRhIGVtIGJ1c2NhIGRhIHByaW5jZXNhIGUgc2UgZGVwYXJhbSBjb20gdW0gZ3J1cG8gZGUgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlbSB1bSBww6F0aW8gc29tYnJpby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGFkZW50cmFyIGEgw6FyZWEsIEhpcm9zaGkgZGVzY29icmUgcXVlIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2EgZG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgcG9kZSBkZXNibG9xdWVhciBwYXNzYWdlbnMgc2VjcmV0YXMgcXVlIERhaWNoaSB0cmFuY291LlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEZlc3RpdmFsIGRvcyBQw6Fzc2Fyb3MgZGUgUGFwZWxcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIHBhc3NhciBwb3IgdW1hIHBhc3NhZ2VtIHNlY3JldGEgZGVzYmxvcXVlYWRhIHBlbG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYSB1bWEgY2lkYWRlIG9uZGUgZXN0w6EgYWNvbnRlY2VuZG8gdW0gZmVzdGl2YWwgZGUgcMOhc3Nhcm9zIGRlIHBhcGVsIChvcmlnYW1pKS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgZGVzY29icmVtIHF1ZSBEYWljaGkgZXNjb25kZXUgY2hhdmVzIG5vcyBww6Fzc2Fyb3MgZGUgcGFwZWwgcGFyYSB0cmFuY2FyIG91dHJhcyDDoXJlYXMgZG8gc2V1IFJlaW5vLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF83LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfNy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIFJlc2dhdGUgZGEgUHJpbmNlc2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbSB0b2RhcyBhcyDDoXJlYXMgcmVzdGF1cmFkYXMgZSBjaGF2ZXMgZW5jb250cmFkYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYW8gY2FzdGVsbyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBa2VtaSBlc3TDoSBwcmVzYSBlbSB1bWEgY2VsYSBnaWdhbnRlIGRlbnRybyBkbyBjYXN0ZWxvLCBjZXJjYWRvIHBvciBmb2dvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgQ2VsZWJyYcOnw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBcMOzcyBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSBlIGRlcnJvdGFyIERhaWNoaSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIHJldG9ybmFtIGFvIFJlaW5vIGRhIEx1eiBwYXJhIHVtYSBncmFuZGUgY2VsZWJyYcOnw6NvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBvcmdhbml6YSB1bWEgZmVzdGEgcGFyYSBvcyBoZXLDs2lzIGNvbWVtb3JhcmVtIGEgdml0w7NyaWEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG5dO1xuXG5cbnN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgc3RhcnRTY3JlZW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGFwcEVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgbGlmZUVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc2NvcmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgY29uc3Qgc3RvcnkgPSBuZXcgU3RvcnkoXCJBIEF2ZW50dXJhIGRlIEhpcm9zaGkgbm8gUmVpbm8gZGFzIFNvbWJyYXNcIiwgY2hhcHRlcnMpO1xuICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZVBsYXkoc3RvcnksIGFwcEVsLCBzY29yZVBhbmVsRWwsIHNjb3JlRWwsIGxpZmVFbCwgXCJub3JtYWxcIik7XG4gICAgZ2FtZS5nYW1lTG9vcCgpO1xufSk7XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFFBQVEsQ0FBQztJQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsUUFBUSxFQUFFO1FBQ3JGLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsZUFBZSxDQUFDO0tBQ3pFOztJQUVELE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFD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
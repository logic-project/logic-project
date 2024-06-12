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
                "Antes de partir para sua jornada, Yukimura apresenta a Hiroshi um desafio de lógica para testar sua astúcia. Yukimura apresenta a seguinte expressão lógica para Hiroshi e pede que ele a parentize completamente, seguindo a ordem dos predicados:<br><br> H = P → Q ∧ Q → R v ¬P",
                "assets/images/cenas/1/desafio1.webp", 
                [
                    "H = (P → (Q ∧ (Q → (R ∨ ¬P))))",
                    "H = ((P → (Q ∧ Q)) → (R ∨ ¬P))",
                    "H = (((P → Q) ∧ (Q → R)) ∨ (¬P))",
                    "H = ((P → Q) ∧ ((Q→R) ∨ ¬P))"
                ],
                2,
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
                "Hiroshi precisa atravessar uma ponte guardada por dois guerreiros das sombras. O guerreiro à esquerda, Ryota, sempre mente. O guerreiro à direita, Taro, sempre diz a verdade. Eles só podem fazer uma pergunta a um dos guerreiros para descobrir o caminho correto. <br><br>Qual pergunta Hiroshi deve fazer para descobrir o caminho correto?",
                "assets/images/cenas/2/desafio2.webp",
                [
                    "Qual é o caminho seguro?",
                    "Se eu perguntasse ao outro guerreiro qual é o caminho seguro, que caminho ele indicaria?",
                    "O caminho à esquerda é seguro?",
                    "O caminho à direita é seguro?"
                ],
                1,
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
                "Considere as seguintes proposições: <br><br>P: Hiroshi encontra um caminho estável. <br>Q: Hiroshi e seus amigos avançam no bosque. <br>R: Uma árvore se move e bloqueia o caminho. <br><br>Com base nas proposições fornecidas, analise a fórmula lógica: <br><br>H = (P → Q) ∧ (¬ P → R) <br><br>E determine qual das alternativas representa corretamente a fórmula fornecida.",
                "assets/images/cenas/3/desafio3.webp", 
                [
                    "Se Hiroshi e seus amigos avançam no bosque, então uma árvore se move e bloqueia o caminho, e se Hiroshi encontra um caminho estável, então a árvore não se move.",
                    "Se Hiroshi e seus amigos avançam no bosque, então eles encontram um caminho estável, e se uma árvore bloqueia o caminho, então Hiroshi não encontrou um caminho estável.",
                    "Se Hiroshi não encontra um caminho estável, então ele e seus amigos não avançam no bosque, mas uma árvore sempre se move independentemente.",
                    "Se Hiroshi encontra um caminho estável, então ele e seus amigos avançam no bosque, mas se Hiroshi não encontra um caminho estável, então uma árvore se move e bloqueia o caminho."
                ],
                3,
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
                "Daichi propõe o seguinte desafio lógico para Hiroshi:<br><br>Se você é realmente o herói, então você conseguirá resolver este enigma. Se você resolver o enigma, então você e seus amigos poderão escapar. Se você não resolver o enigma, vocês se tornarão meus servos. <br><br>Com base nas proposições fornecidas: <br><br>P = É herói<br>Q = Resolver enigma<br>R = Amigos escapar<br>S = Tornarão meus servos <br><br>Determine qual das alternativas representa corretamente a fórmula lógica proposta por Daichi.",
                "assets/images/cenas/4/4_3.jpeg", 
                [
                    "((P→Q)∧(Q→R)∧(¬Q→S))",
                    "((P→Q)∧(Q→R)∧(¬Q→¬S))",
                    "((P→Q)∧(Q→S)∧(¬Q→R))"
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
                "Para ativar o torii mágico, Hiroshi precisa resolver a seguinte desafio:<br><br>Se ativarmos o torii mágico, então escaparemos do bosque. Se Daichi nos alcançar, então seremos capturados. Se não formos capturados, então escaparemos. Se não ativarmos o torii mágico, então seremos capturados ou Daichi nos alcançará. <br><br>Com base nas proposições fornecidas: <br><br>P: Ativamos o torii mágico. <br>Q: Escapamos do bosque. <br>R: Daichi nos alcança. <br>S: Seremos capturados. <br><br> Determine qual das alternativas representa corretamente a fórmula lógica proposta por Daichi.",
                "assets/images/cenas/5/desafio5.webp", 
                [
                    "(P→Q)∧(R→S)∧(¬S→Q)∧(¬P→(S∨R)",
                    "(P→Q)∧(R→¬S)∧(¬S→¬Q)∧(¬P→(S∨R))",
                    "(P→Q)∧(R→¬S)∧(S→Q)∧(¬P→¬S)"
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
                    "Alternativa A",
                    "Alternativa B",
                    "Alternativa C",
                    "Alternativa D"
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
                    "Alternativa A",
                    "Alternativa B",
                    "Alternativa C",
                    "Alternativa D"
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
                    "Alternativa A",
                    "Alternativa B",
                    "Alternativa C",
                    "Alternativa D"
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
                    "Alternativa A",
                    "Alternativa B",
                    "Alternativa C",
                    "Alternativa D"
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
                    "Alternativa A",
                    "Alternativa B",
                    "Alternativa C",
                    "Alternativa D"
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbGVtZW50LCBsaWZlRWxlbWVudCwgbW9kZSA9ICdub3JtYWwnKSB7XG4gICAgICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50ID0gYXBwRWxlbWVudDtcbiAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwgPSBzY29yZVBhbmVsRWw7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlmZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpY3RvcnlTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDUwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnY2hhbGxlbmdlX19pbWcnKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBjaGFsbGVuZ2UuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBjaGFsbGVuZ2UuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNoYWxsZW5nZSBidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWx0ZXJuYXRpdmVcIl06Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyID0gc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuc3dlciA9PSBjaGFsbGVuZ2UuY29ycmVjdEFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgICBjaGFsbGVuZ2UuY2FsbGJhY2soY2hhbGxlbmdlLnF1ZXN0aW9uLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3JlKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaWZlRGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5saWZlRWxlbWVudC5pbm5lckhUTUwgPSBgVmlkYXM6ICR7dGhpcy5saWZlfWA7XG4gICAgfVxuXG4gICAgdXBkYXRlU2NvcmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC5pbm5lckhUTUwgPSBgUG9udG9zOiAke3RoaXMuc2NvcmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXJfX2ltYWdlJyk7XG4gICAgICAgIGltZy5zcmMgPSBgYXNzZXRzL2ltYWdlcy9jZW5hcy9kZXJyb3RhLzIuanBlZ2A7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjb3JlUGFuZWxFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVPdmVyQ29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXInKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+R2FtZSBPdmVyPC9oMT5gO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cImdhbWVfb3Zlcl9fc2NvcmVcIj5Qb250dWHDp8OjbzogJHt0aGlzLnNjb3JlfTwvcD5gOyAgICBcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cImdhbWVfb3Zlcl9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2FtZU92ZXJDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGdhbWUgb3ZlciBpbWFnZScpO1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgc2hvd1ZpY3RvcnlTY3JlZW4oKSB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgndmljdG9yeV9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL3ZpdG9yaWEvMS5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVQYW5lbEVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc3QgdmljdG9yeUNvbnRlaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCd2aWN0b3J5Jyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+Vml0w7NyaWE8L2gxPmA7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCArPSBgPHAgY2xhc3M9XCJ2aWN0b3J5X19zY29yZVwiPlBvbnR1YcOnw6NvOiAke3RoaXMuc2NvcmV9PC9wPmA7ICAgIFxuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cInZpY3RvcnlfX2J1dHRvblwiPlJlaW5pY2lhcjwvYT5gO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHZpY3RvcnlDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHZpY3RvcnkgaW1hZ2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjaGFwdGVycykge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuY2hhcHRlcnMgPSBjaGFwdGVycztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIENoYXB0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lcykge1xuICAgICAgICB0aGlzLnNjZW5lcyA9IHNjZW5lcztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgc3Vic2NlbmVzLCBjaGFsbGVuZ2UpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLnN1YnNjZW5lcyA9IHN1YnNjZW5lcztcbiAgICAgICAgdGhpcy5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2U7XG4gICAgfVxufVxuXG5cblxuXG4iLCJleHBvcnQgY2xhc3MgU3ViU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRleHQsIGltYWdlLCBkdXJhdGlvbikge1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9XG4gfSIsImV4cG9ydCBjbGFzcyBDaGFsbGVuZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHF1ZXN0aW9uLCBpbWFnZSwgYWx0ZXJuYXRpdmVzLCBjb3JyZWN0QW5zd2VyLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnF1ZXN0aW9uID0gcXVlc3Rpb247XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5hbHRlcm5hdGl2ZXMgPSBhbHRlcm5hdGl2ZXM7XG4gICAgICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGNvcnJlY3RBbnN3ZXI7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgXG4gICAgZGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJjaGFsbGVuZ2VfX3RpdGxlXCI+RGVzYWZpbzwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjaGFsbGVuZ2VfX3F1ZXN0aW9uXCI+JHt0aGlzLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiY2hhbGxlbmdlX19pbWdcIiBzcmM9XCIke3RoaXMuaW1hZ2V9XCIgLz5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJjaGFsbGVuZ2VfX2xpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmFsdGVybmF0aXZlcy5tYXAoKGFsdGVybmF0aXZlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImNoYWxsZW5nZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBuYW1lPVwiYWx0ZXJuYXRpdmVcIiB2YWx1ZT1cIiR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9fbGFiZWxcIj4ke2FsdGVybmF0aXZlfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCIke3RoaXMuY2FsbGJhY2t9KClcIiBjbGFzcz1cImNoYWxsZW5nZV9fYnV0dG9uXCI+UmVzcG9uZGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9XG4gICAgXG59IiwiaW1wb3J0IHsgR2FtZVBsYXkgfSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBTdG9yeSB9IGZyb20gXCIuL1N0b3J5XCI7XG5pbXBvcnQgeyBDaGFwdGVyIH0gZnJvbSBcIi4vQ2hhcHRlclwiO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZVwiO1xuaW1wb3J0IHsgU3ViU2NlbmUgfSBmcm9tIFwiLi9TdWJTY2VuZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4vQ2hhbGxlbmdlXCI7XG5cblxuY29uc3QgYXBwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IHNjb3JlUGFuZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NvcmVfcGFuZWxcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5jb25zdCBzY29yZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZVwiKTtcbmNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbmNvbnN0IHN0YXJ0U2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1zY3JlZW5cIik7XG5cbmNvbnN0IGNoYWxsZW5nZUNhbGxiYWNrID0gKHNjZW5lVGl0bGUsIGFuc3dlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTY2VuZTogJHtzY2VuZVRpdGxlfWApO1xuICAgIGNvbnNvbGUubG9nKGBBbnN3ZXI6ICR7YW5zd2VyfWApO1xufVxuXG5cbmNvbnN0IGNoYXB0ZXJzID0gW1xuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBDaGFtYWRvIGRvIEd1YXJkacOjb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgdW0gam92ZW0gc2FtdXJhaSwgYWNvcmRhIGNvbSB1bSBlc3RyYW5obyBzb20gdmluZG8gZG8gamFyZGltIGRvIHNldSBkb2pvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBpbnZlc3RpZ2FyLCBlbGUgZW5jb250cmEgdW0gZXNww61yaXRvIGd1YXJkacOjbyBjaGFtYWRvIFl1a2ltdXJhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJZdWtpbXVyYSBlc3TDoSBkZXNlc3BlcmFkbyBlIHBlZGUgYSBhanVkYSBkZSBIaXJvc2hpIHBhcmEgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWksIHF1ZSBmb2kgc2VxdWVzdHJhZGEgcGVsbyBzb21icmlvIFNlbmhvciBkYXMgU29tYnJhcywgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBpbmljaWFsbWVudGUgaGVzaXRhbnRlLCBzZSBsZW1icmEgZGFzIGhpc3TDs3JpYXMgZG9zIGFudGlnb3MgaGVyw7NpcyBzYW11cmFpcyBxdWUgc2FsdmFyYW0gbyByZWlubyBlIGRlY2lkZSBxdWUgYWdvcmEgw6kgc3VhIHZleiBkZSBzZXIgbyBoZXLDs2kuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkFudGVzIGRlIHBhcnRpciBwYXJhIHN1YSBqb3JuYWRhLCBZdWtpbXVyYSBhcHJlc2VudGEgYSBIaXJvc2hpIHVtIGRlc2FmaW8gZGUgbMOzZ2ljYSBwYXJhIHRlc3RhciBzdWEgYXN0w7pjaWEuIFl1a2ltdXJhIGFwcmVzZW50YSBhIHNlZ3VpbnRlIGV4cHJlc3PDo28gbMOzZ2ljYSBwYXJhIEhpcm9zaGkgZSBwZWRlIHF1ZSBlbGUgYSBwYXJlbnRpemUgY29tcGxldGFtZW50ZSwgc2VndWluZG8gYSBvcmRlbSBkb3MgcHJlZGljYWRvczo8YnI+PGJyPiBIID0gUCDihpIgUSDiiKcgUSDihpIgUiB2IMKsUFwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xL2Rlc2FmaW8xLndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkggPSAoUCDihpIgKFEg4oinIChRIOKGkiAoUiDiiKggwqxQKSkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkggPSAoKFAg4oaSIChRIOKIpyBRKSkg4oaSIChSIOKIqCDCrFApKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkggPSAoKChQIOKGkiBRKSDiiKcgKFEg4oaSIFIpKSDiiKggKMKsUCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoUCDihpIgUSkg4oinICgoUeKGklIpIOKIqCDCrFApKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgSm9ybmFkYSBDb21lw6dhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgWXVraW11cmEgcGFydGVtIGVtIGJ1c2NhIGRhIFByaW5jZXNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjYW1pbmhvLCBlbGVzIGVuZnJlbnRhbSBndWVycmVpcm9zIGRhcyBzb21icmFzIGUgZW5jb250cmFtIEhhbmEsIHVtYSDDoWdpbCBrdW5vaWNoaSBwcmVzYSBlbSB1bWEgYXJtYWRpbGhhLiBFbGVzIGEgbGliZXJ0YW0gZSBnYW5oYW0gdW1hIG5vdmEgYWxpYWRhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbSBzZWd1aWRhLCBlbmNvbnRyYW0gS2VuamksIHVtIHPDoWJpbyBtb25nZSwgcXVlIHRyYXogaW5mb3JtYcOnw7VlcyB2YWxpb3NhcyBzb2JyZSBhIGxvY2FsaXphw6fDo28gZGUgQWtlbWkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkhpcm9zaGkgcHJlY2lzYSBhdHJhdmVzc2FyIHVtYSBwb250ZSBndWFyZGFkYSBwb3IgZG9pcyBndWVycmVpcm9zIGRhcyBzb21icmFzLiBPIGd1ZXJyZWlybyDDoCBlc3F1ZXJkYSwgUnlvdGEsIHNlbXByZSBtZW50ZS4gTyBndWVycmVpcm8gw6AgZGlyZWl0YSwgVGFybywgc2VtcHJlIGRpeiBhIHZlcmRhZGUuIEVsZXMgc8OzIHBvZGVtIGZhemVyIHVtYSBwZXJndW50YSBhIHVtIGRvcyBndWVycmVpcm9zIHBhcmEgZGVzY29icmlyIG8gY2FtaW5obyBjb3JyZXRvLiA8YnI+PGJyPlF1YWwgcGVyZ3VudGEgSGlyb3NoaSBkZXZlIGZhemVyIHBhcmEgZGVzY29icmlyIG8gY2FtaW5obyBjb3JyZXRvP1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yL2Rlc2FmaW8yLndlYnBcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiUXVhbCDDqSBvIGNhbWluaG8gc2VndXJvP1wiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIGV1IHBlcmd1bnRhc3NlIGFvIG91dHJvIGd1ZXJyZWlybyBxdWFsIMOpIG8gY2FtaW5obyBzZWd1cm8sIHF1ZSBjYW1pbmhvIGVsZSBpbmRpY2FyaWE/XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiTyBjYW1pbmhvIMOgIGVzcXVlcmRhIMOpIHNlZ3Vybz9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPIGNhbWluaG8gw6AgZGlyZWl0YSDDqSBzZWd1cm8/XCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBCb3NxdWUgZGFzIFNvbWJyYXNcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlbnRyYW0gZW0gdW0gYm9zcXVlIHNvbWJyaW8gY2hlaW8gZGUgYXJtYWRpbGhhcyBlIGRlc2FmaW9zLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM18xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJPIGFtYmllbnRlIMOpIGVzY3VybywgY29tIGNhbWluaG9zIHF1ZSBwYXJlY2VtIG11ZGFyIGRlIGx1Z2FyLiBFbGVzIGVuZnJlbnRhbSBvYnN0w6FjdWxvcyBjb21vIGNhbWluaG9zIHF1ZSBkZXNhcGFyZWNlbSBlIMOhcnZvcmVzIHF1ZSBzZSBtb3ZlbS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiQ29uc2lkZXJlIGFzIHNlZ3VpbnRlcyBwcm9wb3Npw6fDtWVzOiA8YnI+PGJyPlA6IEhpcm9zaGkgZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbC4gPGJyPlE6IEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUuIDxicj5SOiBVbWEgw6Fydm9yZSBzZSBtb3ZlIGUgYmxvcXVlaWEgbyBjYW1pbmhvLiA8YnI+PGJyPkNvbSBiYXNlIG5hcyBwcm9wb3Npw6fDtWVzIGZvcm5lY2lkYXMsIGFuYWxpc2UgYSBmw7NybXVsYSBsw7NnaWNhOiA8YnI+PGJyPkggPSAoUCDihpIgUSkg4oinICjCrCBQIOKGkiBSKSA8YnI+PGJyPkUgZGV0ZXJtaW5lIHF1YWwgZGFzIGFsdGVybmF0aXZhcyByZXByZXNlbnRhIGNvcnJldGFtZW50ZSBhIGbDs3JtdWxhIGZvcm5lY2lkYS5cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy9kZXNhZmlvMy53ZWJwXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJTZSBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgYXZhbsOnYW0gbm8gYm9zcXVlLCBlbnTDo28gdW1hIMOhcnZvcmUgc2UgbW92ZSBlIGJsb3F1ZWlhIG8gY2FtaW5obywgZSBzZSBIaXJvc2hpIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGVudMOjbyBhIMOhcnZvcmUgbsOjbyBzZSBtb3ZlLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUsIGVudMOjbyBlbGVzIGVuY29udHJhbSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlIHNlIHVtYSDDoXJ2b3JlIGJsb3F1ZWlhIG8gY2FtaW5obywgZW50w6NvIEhpcm9zaGkgbsOjbyBlbmNvbnRyb3UgdW0gY2FtaW5obyBlc3TDoXZlbC5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJTZSBIaXJvc2hpIG7Do28gZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIGVsZSBlIHNldXMgYW1pZ29zIG7Do28gYXZhbsOnYW0gbm8gYm9zcXVlLCBtYXMgdW1hIMOhcnZvcmUgc2VtcHJlIHNlIG1vdmUgaW5kZXBlbmRlbnRlbWVudGUuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgSGlyb3NoaSBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlbnTDo28gZWxlIGUgc2V1cyBhbWlnb3MgYXZhbsOnYW0gbm8gYm9zcXVlLCBtYXMgc2UgSGlyb3NoaSBuw6NvIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGVudMOjbyB1bWEgw6Fydm9yZSBzZSBtb3ZlIGUgYmxvcXVlaWEgbyBjYW1pbmhvLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAzLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRW5jb250cm8gY29tIERhaWNoaVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY29yYcOnw6NvIGRvIGJvc3F1ZSwgSGlyb3NoaSBlbmNvbnRyYSBEYWljaGksIG8gdmlsw6NvLCBzZW50YWRvIGVtIHVtIHRyb25vIGZlaXRvIGRlIG9zc29zIGUgcGVkcmFzLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJEYWljaGkgcmV2ZWxhIHF1ZSBjYXB0dXJvdSBBa2VtaSBwYXJhIGF0cmFpciBvIHZlcmRhZGVpcm8gaGVyw7NpLCBtYXMgZXN0w6Egc3VycHJlc28gYW8gdmVyIEhpcm9zaGkuIEVsZSBzdWJlc3RpbWEgSGlyb3NoaSBlIG8gZGVzYWZpYSBhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDExXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVzY2FwYW0gZG8gYm9zcXVlIGFww7NzIHJlc29sdmVyIG8gZW5pZ21hIGRlIERhaWNoaS4gTm8gZW50YW50bywgRGFpY2hpLCBmdXJpb3NvLCBvcyBwZXJzZWd1ZS4gRWxlcyBlbmNvbnRyYW0gdW0gdG9yaWkgbcOhZ2ljbyBxdWUgcG9kZSBsZXbDoS1sb3MgcGFyYSBmb3JhIGRvIGJvc3F1ZSwgbWFzIHByZWNpc2FtIGF0aXbDoS1sby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkRhaWNoaSBwcm9ww7VlIG8gc2VndWludGUgZGVzYWZpbyBsw7NnaWNvIHBhcmEgSGlyb3NoaTo8YnI+PGJyPlNlIHZvY8OqIMOpIHJlYWxtZW50ZSBvIGhlcsOzaSwgZW50w6NvIHZvY8OqIGNvbnNlZ3VpcsOhIHJlc29sdmVyIGVzdGUgZW5pZ21hLiBTZSB2b2PDqiByZXNvbHZlciBvIGVuaWdtYSwgZW50w6NvIHZvY8OqIGUgc2V1cyBhbWlnb3MgcG9kZXLDo28gZXNjYXBhci4gU2Ugdm9jw6ogbsOjbyByZXNvbHZlciBvIGVuaWdtYSwgdm9jw6pzIHNlIHRvcm5hcsOjbyBtZXVzIHNlcnZvcy4gPGJyPjxicj5Db20gYmFzZSBuYXMgcHJvcG9zacOnw7VlcyBmb3JuZWNpZGFzOiA8YnI+PGJyPlAgPSDDiSBoZXLDs2k8YnI+USA9IFJlc29sdmVyIGVuaWdtYTxicj5SID0gQW1pZ29zIGVzY2FwYXI8YnI+UyA9IFRvcm5hcsOjbyBtZXVzIHNlcnZvcyA8YnI+PGJyPkRldGVybWluZSBxdWFsIGRhcyBhbHRlcm5hdGl2YXMgcmVwcmVzZW50YSBjb3JyZXRhbWVudGUgYSBmw7NybXVsYSBsw7NnaWNhIHByb3Bvc3RhIHBvciBEYWljaGkuXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIigoUOKGklEp4oinKFHihpJSKeKIpyjCrFHihpJTKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoKFDihpJRKeKIpyhR4oaSUiniiKcowqxR4oaSwqxTKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoKFDihpJRKeKIpyhR4oaSUyniiKcowqxR4oaSUikpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBGdWdhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiUGFyYSBhdGl2YXIgbyB0b3JpaSBtw6FnaWNvLCBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgYSBzZWd1aW50ZSBkZXNhZmlvOjxicj48YnI+U2UgYXRpdmFybW9zIG8gdG9yaWkgbcOhZ2ljbywgZW50w6NvIGVzY2FwYXJlbW9zIGRvIGJvc3F1ZS4gU2UgRGFpY2hpIG5vcyBhbGNhbsOnYXIsIGVudMOjbyBzZXJlbW9zIGNhcHR1cmFkb3MuIFNlIG7Do28gZm9ybW9zIGNhcHR1cmFkb3MsIGVudMOjbyBlc2NhcGFyZW1vcy4gU2UgbsOjbyBhdGl2YXJtb3MgbyB0b3JpaSBtw6FnaWNvLCBlbnTDo28gc2VyZW1vcyBjYXB0dXJhZG9zIG91IERhaWNoaSBub3MgYWxjYW7Dp2Fyw6EuIDxicj48YnI+Q29tIGJhc2UgbmFzIHByb3Bvc2nDp8O1ZXMgZm9ybmVjaWRhczogPGJyPjxicj5QOiBBdGl2YW1vcyBvIHRvcmlpIG3DoWdpY28uIDxicj5ROiBFc2NhcGFtb3MgZG8gYm9zcXVlLiA8YnI+UjogRGFpY2hpIG5vcyBhbGNhbsOnYS4gPGJyPlM6IFNlcmVtb3MgY2FwdHVyYWRvcy4gPGJyPjxicj4gRGV0ZXJtaW5lIHF1YWwgZGFzIGFsdGVybmF0aXZhcyByZXByZXNlbnRhIGNvcnJldGFtZW50ZSBhIGbDs3JtdWxhIGzDs2dpY2EgcHJvcG9zdGEgcG9yIERhaWNoaS5cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS9kZXNhZmlvNS53ZWJwXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpJTKeKIpyjCrFPihpJRKeKIpyjCrFDihpIoU+KIqFIpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKFDihpJRKeKIpyhS4oaSwqxTKeKIpyjCrFPihpLCrFEp4oinKMKsUOKGkihT4oioUikpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKFDihpJRKeKIpyhS4oaSwqxTKeKIpyhT4oaSUSniiKcowqxQ4oaSwqxTKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIFZpbGFyZWpvIFNlbSBWaWRhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgY29tcGFuaGlhIGVtZXJnZW0gZG8gdG9yaWkgbcOhZ2ljbyBlIGNoZWdhbSBhbyBSZWlubyBkYXMgU29tYnJhcywgb25kZSBhcyBjb2lzYXMgbsOjbyBwb3NzdWVtIHZpZGEgbmVtIGNvci5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgc8OjbyByZWNlYmlkb3MgcG9yIEF5YW1lLCB1bWEgc2FjZXJkb3Rpc2EgZSBtZXN0cmEgZGEgY2FsaWdyYWZpYSBlIGRhIHBpbnR1cmEgbcOhZ2ljYSwgcXVlIHRyYXogdmlkYSDDoHMgY29pc2FzIGNvbSBzdWEgYXJ0ZS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkF5YW1lIGV4cGxpY2EgcXVlIHBhcmEgYXZhbsOnYXIsIGVsZXMgcHJlY2lzYW0gcmVzdGF1cmFyIGEgdmlkYSBkZSB2w6FyaWFzIMOhcmVhcyBxdWUgZm9yYW0gZGVzYm90YWRhcyBwZWxvcyBjYXBhbmdhcyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBCXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQ1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIERcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIERhbsOnYSBkb3MgR3VlcnJlaXJvcyBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIGEgcHJpbWVpcmEgw6FyZWEgcmVzdGF1cmFkYSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNvbnRpbnVhbSBzdWEgam9ybmFkYSBlbSBidXNjYSBkYSBwcmluY2VzYSBlIHNlIGRlcGFyYW0gY29tIHVtIGdydXBvIGRlIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZW0gdW0gcMOhdGlvIHNvbWJyaW8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBhZGVudHJhciBhIMOhcmVhLCBIaXJvc2hpIGRlc2NvYnJlIHF1ZSBhIGRhbsOnYSByaXR1YWzDrXN0aWNhIGRvcyBndWVycmVpcm9zIGRhcyBzb21icmFzIHBvZGUgZGVzYmxvcXVlYXIgcGFzc2FnZW5zIHNlY3JldGFzIHF1ZSBEYWljaGkgdHJhbmNvdS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBDXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgRFwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRmVzdGl2YWwgZG9zIFDDoXNzYXJvcyBkZSBQYXBlbFwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gcGFzc2FyIHBvciB1bWEgcGFzc2FnZW0gc2VjcmV0YSBkZXNibG9xdWVhZGEgcGVsb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhIHVtYSBjaWRhZGUgb25kZSBlc3TDoSBhY29udGVjZW5kbyB1bSBmZXN0aXZhbCBkZSBww6Fzc2Fyb3MgZGUgcGFwZWwgKG9yaWdhbWkpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBkZXNjb2JyZW0gcXVlIERhaWNoaSBlc2NvbmRldSBjaGF2ZXMgbm9zIHDDoXNzYXJvcyBkZSBwYXBlbCBwYXJhIHRyYW5jYXIgb3V0cmFzIMOhcmVhcyBkbyBzZXUgUmVpbm8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF83LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBCXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQ1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIERcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIFJlc2dhdGUgZGEgUHJpbmNlc2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbSB0b2RhcyBhcyDDoXJlYXMgcmVzdGF1cmFkYXMgZSBjaGF2ZXMgZW5jb250cmFkYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYW8gY2FzdGVsbyBkZSBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBa2VtaSBlc3TDoSBwcmVzYSBlbSB1bWEgY2VsYSBnaWdhbnRlIGRlbnRybyBkbyBjYXN0ZWxvLCBjZXJjYWRvIHBvciBmb2dvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBCXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQ1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIERcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIENlbGVicmHDp8Ojb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXDDs3Mgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWkgZSBkZXJyb3RhciBEYWljaGksIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyByZXRvcm5hbSBhbyBSZWlubyBkYSBMdXogcGFyYSB1bWEgZ3JhbmRlIGNlbGVicmHDp8Ojby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgb3JnYW5pemEgdW1hIGZlc3RhIHBhcmEgb3MgaGVyw7NpcyBjb21lbW9yYXJlbSBhIHZpdMOzcmlhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBBXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIENcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBEXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICBdKSxcbl07XG5cblxuc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBzdGFydFNjcmVlbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgYXBwRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBsaWZlRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBzY29yZUVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cbiAgICBjb25zdCBzdG9yeSA9IG5ldyBTdG9yeShcIkEgQXZlbnR1cmEgZGUgSGlyb3NoaSBubyBSZWlubyBkYXMgU29tYnJhc1wiLCBjaGFwdGVycyk7XG4gICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lUGxheShzdG9yeSwgYXBwRWwsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbCwgbGlmZUVsLCBcIm5vcm1hbFwiKTtcbiAgICBnYW1lLmdhbWVMb29wKCk7XG59KTtcblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sUUFBUSxDQUFDO0lBQ2xCLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUU7UUFDckYsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxlQUFlLENBQUM7S0FDekU7O0lBRUQsTUFBTSxRQUFRLEdBQUc7UUFDYixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixJ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
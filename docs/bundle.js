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
                const feedbackElement = document.createElement('div');
                feedbackElement.classList.add('feedback');

                if (answer == challenge.correctAnswer) {
                    challenge.callback(challenge.question, answer);
                    this.score++;
                    this.updateScoreDisplay();
                    feedbackElement.innerHTML = '<p>Resposta correta!<br>Você ganhou 1 ponto</p>';
                } else {
                    this.life--;
                    this.updateLifeDisplay();
                    feedbackElement.innerHTML = '<p>Resposta errada!<br>Você perdeu 1 vida</p>';
                    if (this.life <= 0) {
                        this.gameOver();
                        return;
                    }
                }

                this.appElement.appendChild(feedbackElement);
                setTimeout(() => {
                    this.appElement.removeChild(feedbackElement);
                    resolve();
                }, 2000); 
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbGVtZW50LCBsaWZlRWxlbWVudCwgbW9kZSA9ICdub3JtYWwnKSB7XG4gICAgICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50ID0gYXBwRWxlbWVudDtcbiAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwgPSBzY29yZVBhbmVsRWw7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlmZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpY3RvcnlTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDUwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnY2hhbGxlbmdlX19pbWcnKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBjaGFsbGVuZ2UuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBjaGFsbGVuZ2UuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNoYWxsZW5nZSBidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWx0ZXJuYXRpdmVcIl06Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyID0gc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZmVlZGJhY2tFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZmVlZGJhY2tFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZlZWRiYWNrJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5zd2VyID09IGNoYWxsZW5nZS5jb3JyZWN0QW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYWxsZW5nZS5jYWxsYmFjayhjaGFsbGVuZ2UucXVlc3Rpb24sIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTY29yZURpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tFbGVtZW50LmlubmVySFRNTCA9ICc8cD5SZXNwb3N0YSBjb3JyZXRhITxicj5Wb2PDqiBnYW5ob3UgMSBwb250bzwvcD4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlmZS0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrRWxlbWVudC5pbm5lckhUTUwgPSAnPHA+UmVzcG9zdGEgZXJyYWRhITxicj5Wb2PDqiBwZXJkZXUgMSB2aWRhPC9wPic7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKGZlZWRiYWNrRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5yZW1vdmVDaGlsZChmZWVkYmFja0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgMjAwMCk7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUxpZmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50LmlubmVySFRNTCA9IGBWaWRhczogJHt0aGlzLmxpZmV9YDtcbiAgICB9XG5cbiAgICB1cGRhdGVTY29yZURpc3BsYXkoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50LmlubmVySFRNTCA9IGBQb250b3M6ICR7dGhpcy5zY29yZX1gO1xuICAgIH1cblxuICAgIGdhbWVPdmVyKCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNsYXNzTGlzdC5hZGQoJ2dhbWVfb3Zlcl9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL2RlcnJvdGEvMi5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVQYW5lbEVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc3QgZ2FtZU92ZXJDb250ZWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmNsYXNzTGlzdC5hZGQoJ2dhbWVfb3ZlcicpO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MID0gYDxoMT5HYW1lIE92ZXI8L2gxPmA7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxwIGNsYXNzPVwiZ2FtZV9vdmVyX19zY29yZVwiPlBvbnR1YcOnw6NvOiAke3RoaXMuc2NvcmV9PC9wPmA7ICAgIFxuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCArPSBgPGEgaHJlZj1cIlwiIGNsYXNzPVwiZ2FtZV9vdmVyX19idXR0b25cIj5SZWluaWNpYXI8L2E+YDtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChnYW1lT3ZlckNvbnRlaW5lcik7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgZ2FtZSBvdmVyIGltYWdlJyk7XG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICBzaG93VmljdG9yeVNjcmVlbigpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCd2aWN0b3J5X19pbWFnZScpO1xuICAgICAgICBpbWcuc3JjID0gYGFzc2V0cy9pbWFnZXMvY2VuYXMvdml0b3JpYS8xLmpwZWdgO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICAgICBjb25zdCB2aWN0b3J5Q29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmNsYXNzTGlzdC5hZGQoJ3ZpY3RvcnknKTtcbiAgICAgICAgICAgIHZpY3RvcnlDb250ZWluZXIuaW5uZXJIVE1MID0gYDxoMT5WaXTDs3JpYTwvaDE+YDtcbiAgICAgICAgICAgIHZpY3RvcnlDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cInZpY3RvcnlfX3Njb3JlXCI+UG9udHVhw6fDo286ICR7dGhpcy5zY29yZX08L3A+YDsgICAgXG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCArPSBgPGEgaHJlZj1cIlwiIGNsYXNzPVwidmljdG9yeV9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQodmljdG9yeUNvbnRlaW5lcik7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdmljdG9yeSBpbWFnZScpO1xuICAgICAgICB9O1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTdG9yeSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIGNoYXB0ZXJzKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5jaGFwdGVycyA9IGNoYXB0ZXJzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgQ2hhcHRlciB7XG4gICAgY29uc3RydWN0b3Ioc2NlbmVzKSB7XG4gICAgICAgIHRoaXMuc2NlbmVzID0gc2NlbmVzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBzdWJzY2VuZXMsIGNoYWxsZW5nZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuc3Vic2NlbmVzID0gc3Vic2NlbmVzO1xuICAgICAgICB0aGlzLmNoYWxsZW5nZSA9IGNoYWxsZW5nZTtcbiAgICB9XG59XG5cblxuXG5cbiIsImV4cG9ydCBjbGFzcyBTdWJTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGV4dCwgaW1hZ2UsIGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIH1cbiB9IiwiZXhwb3J0IGNsYXNzIENoYWxsZW5nZSB7XG4gICAgY29uc3RydWN0b3IocXVlc3Rpb24sIGltYWdlLCBhbHRlcm5hdGl2ZXMsIGNvcnJlY3RBbnN3ZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmFsdGVybmF0aXZlcyA9IGFsdGVybmF0aXZlcztcbiAgICAgICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gY29ycmVjdEFuc3dlcjtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBcbiAgICBkaXNwbGF5KCkge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYWxsZW5nZVwiPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cImNoYWxsZW5nZV9fdGl0bGVcIj5EZXNhZmlvPC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImNoYWxsZW5nZV9fcXVlc3Rpb25cIj4ke3RoaXMucXVlc3Rpb259PC9wPlxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJjaGFsbGVuZ2VfX2ltZ1wiIHNyYz1cIiR7dGhpcy5pbWFnZX1cIiAvPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImNoYWxsZW5nZV9fbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICAke3RoaXMuYWx0ZXJuYXRpdmVzLm1hcCgoYWx0ZXJuYXRpdmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiY2hhbGxlbmdlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIG5hbWU9XCJhbHRlcm5hdGl2ZVwiIHZhbHVlPVwiJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9faW5wdXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIGNsYXNzPVwiY2hhbGxlbmdlX19sYWJlbFwiPiR7YWx0ZXJuYXRpdmV9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz1cIiR7dGhpcy5jYWxsYmFja30oKVwiIGNsYXNzPVwiY2hhbGxlbmdlX19idXR0b25cIj5SZXNwb25kZXI8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH1cbiAgICBcbn0iLCJpbXBvcnQgeyBHYW1lUGxheSB9IGZyb20gXCIuL0dhbWVcIjtcbmltcG9ydCB7IFN0b3J5IH0gZnJvbSBcIi4vU3RvcnlcIjtcbmltcG9ydCB7IENoYXB0ZXIgfSBmcm9tIFwiLi9DaGFwdGVyXCI7XG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gXCIuL1NjZW5lXCI7XG5pbXBvcnQgeyBTdWJTY2VuZSB9IGZyb20gXCIuL1N1YlNjZW5lXCI7XG5pbXBvcnQgeyBDaGFsbGVuZ2UgfSBmcm9tIFwiLi9DaGFsbGVuZ2VcIjtcblxuXG5jb25zdCBhcHBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwXCIpO1xuY29uc3Qgc2NvcmVQYW5lbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZV9wYW5lbFwiKTtcbmNvbnN0IGxpZmVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlmZVwiKTtcbmNvbnN0IHNjb3JlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjb3JlXCIpO1xuY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuY29uc3Qgc3RhcnRTY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LXNjcmVlblwiKTtcblxuY29uc3QgY2hhbGxlbmdlQ2FsbGJhY2sgPSAoc2NlbmVUaXRsZSwgYW5zd2VyKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNjZW5lOiAke3NjZW5lVGl0bGV9YCk7XG4gICAgY29uc29sZS5sb2coYEFuc3dlcjogJHthbnN3ZXJ9YCk7XG59XG5cblxuY29uc3QgY2hhcHRlcnMgPSBbXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIENoYW1hZG8gZG8gR3VhcmRpw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCB1bSBqb3ZlbSBzYW11cmFpLCBhY29yZGEgY29tIHVtIGVzdHJhbmhvIHNvbSB2aW5kbyBkbyBqYXJkaW0gZG8gc2V1IGRvam8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGludmVzdGlnYXIsIGVsZSBlbmNvbnRyYSB1bSBlc3DDrXJpdG8gZ3VhcmRpw6NvIGNoYW1hZG8gWXVraW11cmEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIll1a2ltdXJhIGVzdMOhIGRlc2VzcGVyYWRvIGUgcGVkZSBhIGFqdWRhIGRlIEhpcm9zaGkgcGFyYSBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSwgcXVlIGZvaSBzZXF1ZXN0cmFkYSBwZWxvIHNvbWJyaW8gU2VuaG9yIGRhcyBTb21icmFzLCBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIGluaWNpYWxtZW50ZSBoZXNpdGFudGUsIHNlIGxlbWJyYSBkYXMgaGlzdMOzcmlhcyBkb3MgYW50aWdvcyBoZXLDs2lzIHNhbXVyYWlzIHF1ZSBzYWx2YXJhbSBvIHJlaW5vIGUgZGVjaWRlIHF1ZSBhZ29yYSDDqSBzdWEgdmV6IGRlIHNlciBvIGhlcsOzaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiQW50ZXMgZGUgcGFydGlyIHBhcmEgc3VhIGpvcm5hZGEsIFl1a2ltdXJhIGFwcmVzZW50YSBhIEhpcm9zaGkgdW0gZGVzYWZpbyBkZSBsw7NnaWNhIHBhcmEgdGVzdGFyIHN1YSBhc3TDumNpYS4gWXVraW11cmEgYXByZXNlbnRhIGEgc2VndWludGUgZXhwcmVzc8OjbyBsw7NnaWNhIHBhcmEgSGlyb3NoaSBlIHBlZGUgcXVlIGVsZSBhIHBhcmVudGl6ZSBjb21wbGV0YW1lbnRlLCBzZWd1aW5kbyBhIG9yZGVtIGRvcyBwcmVkaWNhZG9zOjxicj48YnI+IEggPSBQIOKGkiBRIOKIpyBRIOKGkiBSIHYgwqxQXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvZGVzYWZpbzEud2VicFwiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9IChQIOKGkiAoUSDiiKcgKFEg4oaSIChSIOKIqCDCrFApKSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoUCDihpIgKFEg4oinIFEpKSDihpIgKFIg4oioIMKsUCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoKFAg4oaSIFEpIOKIpyAoUSDihpIgUikpIOKIqCAowqxQKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCJIID0gKChQIOKGkiBRKSDiiKcgKChR4oaSUikg4oioIMKsUCkpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBKb3JuYWRhIENvbWXDp2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBZdWtpbXVyYSBwYXJ0ZW0gZW0gYnVzY2EgZGEgUHJpbmNlc2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIGNhbWluaG8sIGVsZXMgZW5mcmVudGFtIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZSBlbmNvbnRyYW0gSGFuYSwgdW1hIMOhZ2lsIGt1bm9pY2hpIHByZXNhIGVtIHVtYSBhcm1hZGlsaGEuIEVsZXMgYSBsaWJlcnRhbSBlIGdhbmhhbSB1bWEgbm92YSBhbGlhZGEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVtIHNlZ3VpZGEsIGVuY29udHJhbSBLZW5qaSwgdW0gc8OhYmlvIG1vbmdlLCBxdWUgdHJheiBpbmZvcm1hw6fDtWVzIHZhbGlvc2FzIHNvYnJlIGEgbG9jYWxpemHDp8OjbyBkZSBBa2VtaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBwcmVjaXNhIGF0cmF2ZXNzYXIgdW1hIHBvbnRlIGd1YXJkYWRhIHBvciBkb2lzIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMuIE8gZ3VlcnJlaXJvIMOgIGVzcXVlcmRhLCBSeW90YSwgc2VtcHJlIG1lbnRlLiBPIGd1ZXJyZWlybyDDoCBkaXJlaXRhLCBUYXJvLCBzZW1wcmUgZGl6IGEgdmVyZGFkZS4gRWxlcyBzw7MgcG9kZW0gZmF6ZXIgdW1hIHBlcmd1bnRhIGEgdW0gZG9zIGd1ZXJyZWlyb3MgcGFyYSBkZXNjb2JyaXIgbyBjYW1pbmhvIGNvcnJldG8uIDxicj48YnI+UXVhbCBwZXJndW50YSBIaXJvc2hpIGRldmUgZmF6ZXIgcGFyYSBkZXNjb2JyaXIgbyBjYW1pbmhvIGNvcnJldG8/XCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvZGVzYWZpbzIud2VicFwiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJRdWFsIMOpIG8gY2FtaW5obyBzZWd1cm8/XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgZXUgcGVyZ3VudGFzc2UgYW8gb3V0cm8gZ3VlcnJlaXJvIHF1YWwgw6kgbyBjYW1pbmhvIHNlZ3VybywgcXVlIGNhbWluaG8gZWxlIGluZGljYXJpYT9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPIGNhbWluaG8gw6AgZXNxdWVyZGEgw6kgc2VndXJvP1wiLFxuICAgICAgICAgICAgICAgICAgICBcIk8gY2FtaW5obyDDoCBkaXJlaXRhIMOpIHNlZ3Vybz9cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEJvc3F1ZSBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVudHJhbSBlbSB1bSBib3NxdWUgc29tYnJpbyBjaGVpbyBkZSBhcm1hZGlsaGFzIGUgZGVzYWZpb3MuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk8gYW1iaWVudGUgw6kgZXNjdXJvLCBjb20gY2FtaW5ob3MgcXVlIHBhcmVjZW0gbXVkYXIgZGUgbHVnYXIuIEVsZXMgZW5mcmVudGFtIG9ic3TDoWN1bG9zIGNvbW8gY2FtaW5ob3MgcXVlIGRlc2FwYXJlY2VtIGUgw6Fydm9yZXMgcXVlIHNlIG1vdmVtLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJDb25zaWRlcmUgYXMgc2VndWludGVzIHByb3Bvc2nDp8O1ZXM6IDxicj48YnI+UDogSGlyb3NoaSBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLiA8YnI+UTogSGlyb3NoaSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZS4gPGJyPlI6IFVtYSDDoXJ2b3JlIHNlIG1vdmUgZSBibG9xdWVpYSBvIGNhbWluaG8uIDxicj48YnI+Q29tIGJhc2UgbmFzIHByb3Bvc2nDp8O1ZXMgZm9ybmVjaWRhcywgYW5hbGlzZSBhIGbDs3JtdWxhIGzDs2dpY2E6IDxicj48YnI+SCA9IChQIOKGkiBRKSDiiKcgKMKsIFAg4oaSIFIpIDxicj48YnI+RSBkZXRlcm1pbmUgcXVhbCBkYXMgYWx0ZXJuYXRpdmFzIHJlcHJlc2VudGEgY29ycmV0YW1lbnRlIGEgZsOzcm11bGEgZm9ybmVjaWRhLlwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zL2Rlc2FmaW8zLndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUsIGVudMOjbyB1bWEgw6Fydm9yZSBzZSBtb3ZlIGUgYmxvcXVlaWEgbyBjYW1pbmhvLCBlIHNlIEhpcm9zaGkgZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIGEgw6Fydm9yZSBuw6NvIHNlIG1vdmUuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZSwgZW50w6NvIGVsZXMgZW5jb250cmFtIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGUgc2UgdW1hIMOhcnZvcmUgYmxvcXVlaWEgbyBjYW1pbmhvLCBlbnTDo28gSGlyb3NoaSBuw6NvIGVuY29udHJvdSB1bSBjYW1pbmhvIGVzdMOhdmVsLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgbsOjbyBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlbnTDo28gZWxlIGUgc2V1cyBhbWlnb3MgbsOjbyBhdmFuw6dhbSBubyBib3NxdWUsIG1hcyB1bWEgw6Fydm9yZSBzZW1wcmUgc2UgbW92ZSBpbmRlcGVuZGVudGVtZW50ZS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJTZSBIaXJvc2hpIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGVudMOjbyBlbGUgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUsIG1hcyBzZSBIaXJvc2hpIG7Do28gZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIHVtYSDDoXJ2b3JlIHNlIG1vdmUgZSBibG9xdWVpYSBvIGNhbWluaG8uXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBFbmNvbnRybyBjb20gRGFpY2hpXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjb3Jhw6fDo28gZG8gYm9zcXVlLCBIaXJvc2hpIGVuY29udHJhIERhaWNoaSwgbyB2aWzDo28sIHNlbnRhZG8gZW0gdW0gdHJvbm8gZmVpdG8gZGUgb3Nzb3MgZSBwZWRyYXMuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkRhaWNoaSByZXZlbGEgcXVlIGNhcHR1cm91IEFrZW1pIHBhcmEgYXRyYWlyIG8gdmVyZGFkZWlybyBoZXLDs2ksIG1hcyBlc3TDoSBzdXJwcmVzbyBhbyB2ZXIgSGlyb3NoaS4gRWxlIHN1YmVzdGltYSBIaXJvc2hpIGUgbyBkZXNhZmlhIGEgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTFcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiRGFpY2hpIHByb3DDtWUgbyBzZWd1aW50ZSBkZXNhZmlvIGzDs2dpY28gcGFyYSBIaXJvc2hpOjxicj48YnI+U2Ugdm9jw6ogw6kgcmVhbG1lbnRlIG8gaGVyw7NpLCBlbnTDo28gdm9jw6ogY29uc2VndWlyw6EgcmVzb2x2ZXIgZXN0ZSBlbmlnbWEuIFNlIHZvY8OqIHJlc29sdmVyIG8gZW5pZ21hLCBlbnTDo28gdm9jw6ogZSBzZXVzIGFtaWdvcyBwb2RlcsOjbyBlc2NhcGFyLiBTZSB2b2PDqiBuw6NvIHJlc29sdmVyIG8gZW5pZ21hLCB2b2PDqnMgc2UgdG9ybmFyw6NvIG1ldXMgc2Vydm9zLiA8YnI+PGJyPkNvbSBiYXNlIG5hcyBwcm9wb3Npw6fDtWVzIGZvcm5lY2lkYXM6IDxicj48YnI+UCA9IMOJIGhlcsOzaTxicj5RID0gUmVzb2x2ZXIgZW5pZ21hPGJyPlIgPSBBbWlnb3MgZXNjYXBhcjxicj5TID0gVG9ybmFyw6NvIG1ldXMgc2Vydm9zIDxicj48YnI+RGV0ZXJtaW5lIHF1YWwgZGFzIGFsdGVybmF0aXZhcyByZXByZXNlbnRhIGNvcnJldGFtZW50ZSBhIGbDs3JtdWxhIGzDs2dpY2EgcHJvcG9zdGEgcG9yIERhaWNoaS5cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiKChQ4oaSUSniiKcoUeKGklIp4oinKMKsUeKGklMpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIigoUOKGklEp4oinKFHihpJSKeKIpyjCrFHihpLCrFMpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIigoUOKGklEp4oinKFHihpJTKeKIpyjCrFHihpJSKSlcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEZ1Z2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS81XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJQYXJhIGF0aXZhciBvIHRvcmlpIG3DoWdpY28sIEhpcm9zaGkgcHJlY2lzYSByZXNvbHZlciBhIHNlZ3VpbnRlIGRlc2FmaW86PGJyPjxicj5TZSBhdGl2YXJtb3MgbyB0b3JpaSBtw6FnaWNvLCBlbnTDo28gZXNjYXBhcmVtb3MgZG8gYm9zcXVlLiBTZSBEYWljaGkgbm9zIGFsY2Fuw6dhciwgZW50w6NvIHNlcmVtb3MgY2FwdHVyYWRvcy4gU2UgbsOjbyBmb3Jtb3MgY2FwdHVyYWRvcywgZW50w6NvIGVzY2FwYXJlbW9zLiBTZSBuw6NvIGF0aXZhcm1vcyBvIHRvcmlpIG3DoWdpY28sIGVudMOjbyBzZXJlbW9zIGNhcHR1cmFkb3Mgb3UgRGFpY2hpIG5vcyBhbGNhbsOnYXLDoS4gPGJyPjxicj5Db20gYmFzZSBuYXMgcHJvcG9zacOnw7VlcyBmb3JuZWNpZGFzOiA8YnI+PGJyPlA6IEF0aXZhbW9zIG8gdG9yaWkgbcOhZ2ljby4gPGJyPlE6IEVzY2FwYW1vcyBkbyBib3NxdWUuIDxicj5SOiBEYWljaGkgbm9zIGFsY2Fuw6dhLiA8YnI+UzogU2VyZW1vcyBjYXB0dXJhZG9zLiA8YnI+PGJyPiBEZXRlcm1pbmUgcXVhbCBkYXMgYWx0ZXJuYXRpdmFzIHJlcHJlc2VudGEgY29ycmV0YW1lbnRlIGEgZsOzcm11bGEgbMOzZ2ljYSBwcm9wb3N0YSBwb3IgRGFpY2hpLlwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy81L2Rlc2FmaW81LndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIihQ4oaSUSniiKcoUuKGklMp4oinKMKsU+KGklEp4oinKMKsUOKGkihT4oioUilcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpLCrFMp4oinKMKsU+KGksKsUSniiKcowqxQ4oaSKFPiiKhSKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpLCrFMp4oinKFPihpJRKeKIpyjCrFDihpLCrFMpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICBdKSxcbiAgICBuZXcgQ2hhcHRlcihbXG4gICAgICAgIG5ldyBTY2VuZShcIk8gVmlsYXJlam8gU2VtIFZpZGFcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBjb21wYW5oaWEgZW1lcmdlbSBkbyB0b3JpaSBtw6FnaWNvIGUgY2hlZ2FtIGFvIFJlaW5vIGRhcyBTb21icmFzLCBvbmRlIGFzIGNvaXNhcyBuw6NvIHBvc3N1ZW0gdmlkYSBuZW0gY29yLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBzw6NvIHJlY2ViaWRvcyBwb3IgQXlhbWUsIHVtYSBzYWNlcmRvdGlzYSBlIG1lc3RyYSBkYSBjYWxpZ3JhZmlhIGUgZGEgcGludHVyYSBtw6FnaWNhLCBxdWUgdHJheiB2aWRhIMOgcyBjb2lzYXMgY29tIHN1YSBhcnRlLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgZXhwbGljYSBxdWUgcGFyYSBhdmFuw6dhciwgZWxlcyBwcmVjaXNhbSByZXN0YXVyYXIgYSB2aWRhIGRlIHbDoXJpYXMgw6FyZWFzIHF1ZSBmb3JhbSBkZXNib3RhZGFzIHBlbG9zIGNhcGFuZ2FzIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBDXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgRFwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgRGFuw6dhIGRvcyBHdWVycmVpcm9zIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gYSBwcmltZWlyYSDDoXJlYSByZXN0YXVyYWRhLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY29udGludWFtIHN1YSBqb3JuYWRhIGVtIGJ1c2NhIGRhIHByaW5jZXNhIGUgc2UgZGVwYXJhbSBjb20gdW0gZ3J1cG8gZGUgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlbSB1bSBww6F0aW8gc29tYnJpby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGFkZW50cmFyIGEgw6FyZWEsIEhpcm9zaGkgZGVzY29icmUgcXVlIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2EgZG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgcG9kZSBkZXNibG9xdWVhciBwYXNzYWdlbnMgc2VjcmV0YXMgcXVlIERhaWNoaSB0cmFuY291LlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBBXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIENcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBEXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBGZXN0aXZhbCBkb3MgUMOhc3Nhcm9zIGRlIFBhcGVsXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBwYXNzYXIgcG9yIHVtYSBwYXNzYWdlbSBzZWNyZXRhIGRlc2Jsb3F1ZWFkYSBwZWxvcyBndWVycmVpcm9zIGRhcyBzb21icmFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGEgdW1hIGNpZGFkZSBvbmRlIGVzdMOhIGFjb250ZWNlbmRvIHVtIGZlc3RpdmFsIGRlIHDDoXNzYXJvcyBkZSBwYXBlbCAob3JpZ2FtaSkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIGRlc2NvYnJlbSBxdWUgRGFpY2hpIGVzY29uZGV1IGNoYXZlcyBub3MgcMOhc3Nhcm9zIGRlIHBhcGVsIHBhcmEgdHJhbmNhciBvdXRyYXMgw6FyZWFzIGRvIHNldSBSZWluby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfNy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBDXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgRFwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gUmVzZ2F0ZSBkYSBQcmluY2VzYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIHRvZGFzIGFzIMOhcmVhcyByZXN0YXVyYWRhcyBlIGNoYXZlcyBlbmNvbnRyYWRhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhbyBjYXN0ZWxvIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFrZW1pIGVzdMOhIHByZXNhIGVtIHVtYSBjZWxhIGdpZ2FudGUgZGVudHJvIGRvIGNhc3RlbG8sIGNlcmNhZG8gcG9yIGZvZ28uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBDXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgRFwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgQ2VsZWJyYcOnw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBcMOzcyBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSBlIGRlcnJvdGFyIERhaWNoaSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIHJldG9ybmFtIGFvIFJlaW5vIGRhIEx1eiBwYXJhIHVtYSBncmFuZGUgY2VsZWJyYcOnw6NvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBvcmdhbml6YSB1bWEgZmVzdGEgcGFyYSBvcyBoZXLDs2lzIGNvbWVtb3JhcmVtIGEgdml0w7NyaWEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIEFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2YSBCXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQWx0ZXJuYXRpdmEgQ1wiLFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZhIERcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuXTtcblxuXG5zdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHN0YXJ0U2NyZWVuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBhcHBFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxpZmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHNjb3JlRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblxuICAgIGNvbnN0IHN0b3J5ID0gbmV3IFN0b3J5KFwiQSBBdmVudHVyYSBkZSBIaXJvc2hpIG5vIFJlaW5vIGRhcyBTb21icmFzXCIsIGNoYXB0ZXJzKTtcbiAgICBjb25zdCBnYW1lID0gbmV3IEdhbWVQbGF5KHN0b3J5LCBhcHBFbCwgc2NvcmVQYW5lbEVsLCBzY29yZUVsLCBsaWZlRWwsIFwibm9ybWFsXCIpO1xuICAgIGdhbWUuZ2FtZUxvb3AoKTtcbn0pO1xuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUs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
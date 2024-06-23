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
        // const revealHintButton = this.appElement.querySelector("#reveal-hints-btn");
        // const hintElement = this.appElement.querySelector('#reveal-hints');
        // revealHintButton.onclick = () => {
        //     hintElement.style.display = 'block';
        //     console.log('fasdsad');
        // };

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
    constructor(question, image, alternatives, correctAnswer, hints, callback) {
        this.question = question;
        this.image = image;
        this.alternatives = alternatives;
        this.correctAnswer = correctAnswer;
        this.hints = hints;
        this.callback = callback;
    }
    
    display() {
        return `
            <div class="challenge">
                <h2 class="challenge__title">Desafio</h2>
                <div class="challenge__question">${this.question}</div>
                <img class="challenge__img" src="${this.image}" />
                <input type="checkbox" id="reveal-hints-checkbox" class="challenge__checkbox" />
                <label for="reveal-hints-checkbox" class="challenge__reveal-hint">Dica</label>
                <p class="challenge__hints">${this.hints}</p>
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
                "Identifique os operadores lógicos e sua precedência.<br>Resolva as operações de dentro para fora.<br>Use a precedência dos operadores.",
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
                "Pergunte a um guerreiro o que o outro diria. Depois, escolha o caminho oposto.",
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
                "Para resolver esta questão, verifique se cada parte da fórmula lógica H=(P→Q)∧(¬P→R) está corretamente representada nas alternativas.",
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
                "Identifique cada proposição condicional na fala do personagem.<br>Traduza cada parte da sentença para uma expressão lógica.<br>Verifique se a expressão lógica selecionada corresponde exatamente às condições fornecidas na questão.",
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
                "Identifique cada proposição condicional nas instruções dadas.<br>Certifique-se de que a expressão lógica selecionada representa corretamente cada uma das condições descritas.<br>Compare cada alternativa com as condições obtidas para determinar a correta.",
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
                `<p>Considere a cena em que Hiroshi precisa resolver um enigma de lógica de predicados para avançar no Vilarejo Sem Vida.</p> 
                <p>"Se uma área está desbotada pelos capangas de Daichi e restauramos a vida dessa área, então avançaremos."</p>                  
                <ul class="item-list">
                   <li>p(x): "Área x está desbotada pelos capangas de Daichi"</li>
                   <li>q(x): "Restauramos a vida da área x"</li>
                   <li>r: "Podemos avançar"</li>
                </ul>
                <p>Qual das seguintes opções corretamente representa a proposição que descreve a necessidade de restaurar a vida das áreas para avançar?<p>`,
                "assets/images/cenas/6/6_8.jpeg", 
                [
                    "∀x (p(x) → q(x) →r)",
                    "∃x (p(x) → q(x)) →r",
                    "∃x ((p(x) ∧ q(x)) →r)",
                    "∃x (p(x) → q(x) →r)"
                ],
                2,
                "Preste atenção à estrutura da implicação lógica: identifique a relação entre as áreas desbotadas e a necessidade de restaurá-las para poder avançar. A formulação correta deve refletir que, para todas as áreas, a restauração é necessária para avançar.",
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
                `<p>Considere a cena em que Hiroshi precisa resolver um enigma de lógica de predicados para desbloquear passagens secretas no Reino das Sombras</p> 
                <p>"Se os guerreiros das sombras fazem a dança ritualística e existe uma passagem trancada por Daichi, então essa passagem será desbloqueada."</p>                  
                <ul class="item-list">
                   <li>p: "Os guerreiros das sombras fazem a dança ritualística"</li>
                   <li>q(x): "Passagem x está trancada por Daichi"</li>
                   <li>r(x): "Passagem x está desbloqueada"</li>
                </ul>
                <p>Qual das seguintes opções corretamente representa a proposição que descreve a relação entre a dança dos guerreiros das sombras e as passagens secretas?<p>`,
                "assets/images/cenas/7/7_3.jpeg", 
                [
                    "(p ∧ ((∃x) q(x)) → (∃x) r(x))",
                    "∀x (p → q(x) → r(x))",
                    "∃x (p →q (x) → r(x)) → (∀x) r(x))",
                    "p → ∃x( q(x) → r(x))"
                ],
                0,
                "Foque na relação de causa e efeito: a dança ritualística deve ser a causa que leva ao desbloqueio das passagens trancadas por Daichi. A formulação correta deve refletir que a dança resulta no desbloqueio de todas as passagens trancadas.2",
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
                `<p>Considere a cena em que Hiroshi precisa resolver um enigma de lógica de predicados para encontrar chaves no Festival dos Pássaros de Papel</p> 
                <p>"Para todo pássaro de papel que contém uma chave. Essa chave tranca ou não tranca uma área do Reino, então será possível abrir a área."</p>                  
                <ul class="item-list">
                   <li>p(x): "Pássaro de papel x contém uma chave"</li>
                   <li>q(x)): "Chave x tranca uma área do Reino"</li>
                   <li>¬q(x)): "Chave x não tranca uma área do Reino"</li>
                   <li>r(x): "Área x será aberta"</li>
                </ul>
                <p>Qual das seguintes opções corretamente representa a proposição que descreve a relação entre os pássaros de papel e as áreas trancadas?<p>`,
                "assets/images/cenas/7/8_4.jpeg", 
                [
                    "∃x (p(x) → (q(x) ∨ ¬q(x)) → r(x))",
                    "∃x (p(x) → ∀y (q(y )→ r(y)))",
                    "∀x (p(x) → ((q(x) ∨ ¬q(x)) → r(x))) ",
                    "∀x (p(x) → (q(x) ∨ q(x)) → r(x))"
                ],
                2,
                "Observe a relação direta entre as chaves nos pássaros de papel e as áreas trancadas. A formulação correta deve refletir que, para todos os pássaros de papel que contém uma chave, essa chave é responsável por trancar ou destrancar uma área específica do Reino.",
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
                `<p>Considere a cena em que Hiroshi precisa resolver um enigma de lógica de predicados para salvar a Princesa Akemi. A seguir, está uma tentativa de formalizar a situação usando lógica de predicados. </p> 
                <p>"Se Akemi está no castelo e o castelo está cercado por fogo, então precisamos ativar uma ponte invisível, que só aparece quando todas as áreas do reino estão restauradas."</p>                  
                <ul class="item-list">
                   <li>p(x): "Akemi está no castelo"</li>
                   <li>q(x): "O castelo está cercado por fogo"</li>
                   <li>r(x): "Precisamos atravessar o fogo"</li>
                   <li>s(x): "Ativamos a ponte invisível"</li>
                   <li>t(x): "Todas as áreas do reino estão restauradas"</li>
                </ul>
                <p>Qual das seguintes opções corretamente representa a proposição que descreve a necessidade de ativar uma ponte invisível para atravessar o fogo e salvar Akemi?<p>`,
                "assets/images/cenas/9/9_6.jpeg", 
                [
                    "∀x(p(x)→(q(x)∧r(x)→s(x)))",
                    "∀x(q(x)∧r(x)→(t(x)→s(x)))",
                    "∃x(p(x)∧(q(x)∧r(x)→s(x)))",
                    "∀x(p(x)∧q(x)∧r(x)→s(x))"
                ],
                1,
                "Foque na estrutura da implicação lógica: identifique as condições necessárias (o castelo cercado por fogo e a necessidade de atravessar o fogo) e a condição adicional (todas as áreas do reino restauradas) que leva à conclusão (ativação da ponte invisível). A opção correta deve refletir que a ativação da ponte depende da restauração do reino após satisfazer as condições iniciais.",
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
                `<p>Considere a cena em que Hiroshi precisa resolver um último desafio de lógica de predicados durante a celebração para abrir o baú do tesouro. A seguir, está uma tentativa de formalizar a situação usando lógica de predicados.</p> 
                <p>"Se a chave está na caixa vermelha ou na caixa azul, e a caixa vermelha está trancada, então a chave está na caixa azul."</p>                  
                <ul class="item-list">
                   <li>p(x)p(x)p(x): "A chave está na caixa vermelha"</li>
                   <li>q(x)q(x)q(x): "A chave está na caixa azul"</li>
                   <li>r(x)r(x)r(x): "A caixa vermelha está trancada"</li>
                </ul>
                <p>Qual das seguintes opções corretamente representa a proposição que descreve a necessidade de ativar uma ponte invisível para atravessar o fogo e salvar Akemi?<p>`,
                "assets/images/cenas/10/10_4.jpeg", 
                [
                    "∀x(r(x) → (p(x) ∨ q(x) → q(x)))",
                    "∃x(r(x) ∧ (p(x) ∨ q(x)) → q(x))",
                    "∀x((p(x) ∨ q(x)) ∧ r(x) → q(x))",
                    "∃x((p(x) ∨ q(x)) ∧ r(x) → ¬p(x)∧q(x))"
                ],
                2,
                "Preste atenção aos quantificadores: ∀x indica que a proposição é válida para todas as situações possíveis, enquanto ∃x indica que a proposição é válida para pelo menos uma situação específica. A formulação correta deve usar o quantificador universal para refletir que a dedução é válida em todos os casos onde as condições são satisfeitas.",
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbGVtZW50LCBsaWZlRWxlbWVudCwgbW9kZSA9ICdub3JtYWwnKSB7XG4gICAgICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50ID0gYXBwRWxlbWVudDtcbiAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwgPSBzY29yZVBhbmVsRWw7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlmZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpY3RvcnlTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDUwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnY2hhbGxlbmdlX19pbWcnKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBjaGFsbGVuZ2UuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBjaGFsbGVuZ2UuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICAvLyBjb25zdCByZXZlYWxIaW50QnV0dG9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmV2ZWFsLWhpbnRzLWJ0blwiKTtcbiAgICAgICAgLy8gY29uc3QgaGludEVsZW1lbnQgPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignI3JldmVhbC1oaW50cycpO1xuICAgICAgICAvLyByZXZlYWxIaW50QnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vICAgICBoaW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdmYXNkc2FkJyk7XG4gICAgICAgIC8vIH07XG5cbiAgICAgICAgY29uc3QgYnV0dG9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGFsbGVuZ2UgYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsdGVybmF0aXZlXCJdOmNoZWNrZWQnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuc3dlciA9IHNlbGVjdGVkT3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZlZWRiYWNrRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGZlZWRiYWNrRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmZWVkYmFjaycpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFuc3dlciA9PSBjaGFsbGVuZ2UuY29ycmVjdEFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgICBjaGFsbGVuZ2UuY2FsbGJhY2soY2hhbGxlbmdlLnF1ZXN0aW9uLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3JlKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrRWxlbWVudC5pbm5lckhUTUwgPSAnPHA+UmVzcG9zdGEgY29ycmV0YSE8YnI+Vm9jw6ogZ2FuaG91IDEgcG9udG88L3A+JztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBmZWVkYmFja0VsZW1lbnQuaW5uZXJIVE1MID0gJzxwPlJlc3Bvc3RhIGVycmFkYSE8YnI+Vm9jw6ogcGVyZGV1IDEgdmlkYTwvcD4nO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChmZWVkYmFja0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQucmVtb3ZlQ2hpbGQoZmVlZGJhY2tFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIDIwMDApOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaWZlRGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5saWZlRWxlbWVudC5pbm5lckhUTUwgPSBgVmlkYXM6ICR7dGhpcy5saWZlfWA7XG4gICAgfVxuXG4gICAgdXBkYXRlU2NvcmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC5pbm5lckhUTUwgPSBgUG9udG9zOiAke3RoaXMuc2NvcmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXJfX2ltYWdlJyk7XG4gICAgICAgIGltZy5zcmMgPSBgYXNzZXRzL2ltYWdlcy9jZW5hcy9kZXJyb3RhLzIuanBlZ2A7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjb3JlUGFuZWxFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVPdmVyQ29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCdnYW1lX292ZXInKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+R2FtZSBPdmVyPC9oMT5gO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cImdhbWVfb3Zlcl9fc2NvcmVcIj5Qb250dWHDp8OjbzogJHt0aGlzLnNjb3JlfTwvcD5gOyAgICBcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cImdhbWVfb3Zlcl9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2FtZU92ZXJDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGdhbWUgb3ZlciBpbWFnZScpO1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgc2hvd1ZpY3RvcnlTY3JlZW4oKSB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgndmljdG9yeV9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL3ZpdG9yaWEvMS5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVQYW5lbEVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc3QgdmljdG9yeUNvbnRlaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5jbGFzc0xpc3QuYWRkKCd2aWN0b3J5Jyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCA9IGA8aDE+Vml0w7NyaWE8L2gxPmA7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCArPSBgPHAgY2xhc3M9XCJ2aWN0b3J5X19zY29yZVwiPlBvbnR1YcOnw6NvOiAke3RoaXMuc2NvcmV9PC9wPmA7ICAgIFxuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgICAgICAgdmljdG9yeUNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxhIGhyZWY9XCJcIiBjbGFzcz1cInZpY3RvcnlfX2J1dHRvblwiPlJlaW5pY2lhcjwvYT5gO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHZpY3RvcnlDb250ZWluZXIpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHZpY3RvcnkgaW1hZ2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBjaGFwdGVycykge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuY2hhcHRlcnMgPSBjaGFwdGVycztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIENoYXB0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHNjZW5lcykge1xuICAgICAgICB0aGlzLnNjZW5lcyA9IHNjZW5lcztcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIFNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgc3Vic2NlbmVzLCBjaGFsbGVuZ2UpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLnN1YnNjZW5lcyA9IHN1YnNjZW5lcztcbiAgICAgICAgdGhpcy5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2U7XG4gICAgfVxufVxuXG5cblxuXG4iLCJleHBvcnQgY2xhc3MgU3ViU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRleHQsIGltYWdlLCBkdXJhdGlvbikge1xuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9XG4gfSIsImV4cG9ydCBjbGFzcyBDaGFsbGVuZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHF1ZXN0aW9uLCBpbWFnZSwgYWx0ZXJuYXRpdmVzLCBjb3JyZWN0QW5zd2VyLCBoaW50cywgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5xdWVzdGlvbiA9IHF1ZXN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuYWx0ZXJuYXRpdmVzID0gYWx0ZXJuYXRpdmVzO1xuICAgICAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBjb3JyZWN0QW5zd2VyO1xuICAgICAgICB0aGlzLmhpbnRzID0gaGludHM7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgXG4gICAgZGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJjaGFsbGVuZ2VfX3RpdGxlXCI+RGVzYWZpbzwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYWxsZW5nZV9fcXVlc3Rpb25cIj4ke3RoaXMucXVlc3Rpb259PC9kaXY+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImNoYWxsZW5nZV9faW1nXCIgc3JjPVwiJHt0aGlzLmltYWdlfVwiIC8+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwicmV2ZWFsLWhpbnRzLWNoZWNrYm94XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2NoZWNrYm94XCIgLz5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwicmV2ZWFsLWhpbnRzLWNoZWNrYm94XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX3JldmVhbC1oaW50XCI+RGljYTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjaGFsbGVuZ2VfX2hpbnRzXCI+JHt0aGlzLmhpbnRzfTwvcD5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJjaGFsbGVuZ2VfX2xpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmFsdGVybmF0aXZlcy5tYXAoKGFsdGVybmF0aXZlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImNoYWxsZW5nZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBuYW1lPVwiYWx0ZXJuYXRpdmVcIiB2YWx1ZT1cIiR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9fbGFiZWxcIj4ke2FsdGVybmF0aXZlfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCIke3RoaXMuY2FsbGJhY2t9KClcIiBjbGFzcz1cImNoYWxsZW5nZV9fYnV0dG9uXCI+UmVzcG9uZGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9XG4gICAgXG59IiwiaW1wb3J0IHsgR2FtZVBsYXkgfSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBTdG9yeSB9IGZyb20gXCIuL1N0b3J5XCI7XG5pbXBvcnQgeyBDaGFwdGVyIH0gZnJvbSBcIi4vQ2hhcHRlclwiO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZVwiO1xuaW1wb3J0IHsgU3ViU2NlbmUgfSBmcm9tIFwiLi9TdWJTY2VuZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4vQ2hhbGxlbmdlXCI7XG5cblxuY29uc3QgYXBwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IHNjb3JlUGFuZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NvcmVfcGFuZWxcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5jb25zdCBzY29yZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZVwiKTtcbmNvbnN0IHN0YXJ0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFwiKTtcbmNvbnN0IHN0YXJ0U2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydC1zY3JlZW5cIik7XG5cbmNvbnN0IGNoYWxsZW5nZUNhbGxiYWNrID0gKHNjZW5lVGl0bGUsIGFuc3dlcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTY2VuZTogJHtzY2VuZVRpdGxlfWApO1xuICAgIGNvbnNvbGUubG9nKGBBbnN3ZXI6ICR7YW5zd2VyfWApO1xufVxuXG5cbmNvbnN0IGNoYXB0ZXJzID0gW1xuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBDaGFtYWRvIGRvIEd1YXJkacOjb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgdW0gam92ZW0gc2FtdXJhaSwgYWNvcmRhIGNvbSB1bSBlc3RyYW5obyBzb20gdmluZG8gZG8gamFyZGltIGRvIHNldSBkb2pvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBpbnZlc3RpZ2FyLCBlbGUgZW5jb250cmEgdW0gZXNww61yaXRvIGd1YXJkacOjbyBjaGFtYWRvIFl1a2ltdXJhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJZdWtpbXVyYSBlc3TDoSBkZXNlc3BlcmFkbyBlIHBlZGUgYSBhanVkYSBkZSBIaXJvc2hpIHBhcmEgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWksIHF1ZSBmb2kgc2VxdWVzdHJhZGEgcGVsbyBzb21icmlvIFNlbmhvciBkYXMgU29tYnJhcywgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCBpbmljaWFsbWVudGUgaGVzaXRhbnRlLCBzZSBsZW1icmEgZGFzIGhpc3TDs3JpYXMgZG9zIGFudGlnb3MgaGVyw7NpcyBzYW11cmFpcyBxdWUgc2FsdmFyYW0gbyByZWlubyBlIGRlY2lkZSBxdWUgYWdvcmEgw6kgc3VhIHZleiBkZSBzZXIgbyBoZXLDs2kuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkFudGVzIGRlIHBhcnRpciBwYXJhIHN1YSBqb3JuYWRhLCBZdWtpbXVyYSBhcHJlc2VudGEgYSBIaXJvc2hpIHVtIGRlc2FmaW8gZGUgbMOzZ2ljYSBwYXJhIHRlc3RhciBzdWEgYXN0w7pjaWEuIFl1a2ltdXJhIGFwcmVzZW50YSBhIHNlZ3VpbnRlIGV4cHJlc3PDo28gbMOzZ2ljYSBwYXJhIEhpcm9zaGkgZSBwZWRlIHF1ZSBlbGUgYSBwYXJlbnRpemUgY29tcGxldGFtZW50ZSwgc2VndWluZG8gYSBvcmRlbSBkb3MgcHJlZGljYWRvczo8YnI+PGJyPiBIID0gUCDihpIgUSDiiKcgUSDihpIgUiB2IMKsUFwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xL2Rlc2FmaW8xLndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkggPSAoUCDihpIgKFEg4oinIChRIOKGkiAoUiDiiKggwqxQKSkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkggPSAoKFAg4oaSIChRIOKIpyBRKSkg4oaSIChSIOKIqCDCrFApKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkggPSAoKChQIOKGkiBRKSDiiKcgKFEg4oaSIFIpKSDiiKggKMKsUCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoUCDihpIgUSkg4oinICgoUeKGklIpIOKIqCDCrFApKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIFwiSWRlbnRpZmlxdWUgb3Mgb3BlcmFkb3JlcyBsw7NnaWNvcyBlIHN1YSBwcmVjZWTDqm5jaWEuPGJyPlJlc29sdmEgYXMgb3BlcmHDp8O1ZXMgZGUgZGVudHJvIHBhcmEgZm9yYS48YnI+VXNlIGEgcHJlY2Vkw6puY2lhIGRvcyBvcGVyYWRvcmVzLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgSm9ybmFkYSBDb21lw6dhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgWXVraW11cmEgcGFydGVtIGVtIGJ1c2NhIGRhIFByaW5jZXNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjYW1pbmhvLCBlbGVzIGVuZnJlbnRhbSBndWVycmVpcm9zIGRhcyBzb21icmFzIGUgZW5jb250cmFtIEhhbmEsIHVtYSDDoWdpbCBrdW5vaWNoaSBwcmVzYSBlbSB1bWEgYXJtYWRpbGhhLiBFbGVzIGEgbGliZXJ0YW0gZSBnYW5oYW0gdW1hIG5vdmEgYWxpYWRhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbSBzZWd1aWRhLCBlbmNvbnRyYW0gS2VuamksIHVtIHPDoWJpbyBtb25nZSwgcXVlIHRyYXogaW5mb3JtYcOnw7VlcyB2YWxpb3NhcyBzb2JyZSBhIGxvY2FsaXphw6fDo28gZGUgQWtlbWkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkhpcm9zaGkgcHJlY2lzYSBhdHJhdmVzc2FyIHVtYSBwb250ZSBndWFyZGFkYSBwb3IgZG9pcyBndWVycmVpcm9zIGRhcyBzb21icmFzLiBPIGd1ZXJyZWlybyDDoCBlc3F1ZXJkYSwgUnlvdGEsIHNlbXByZSBtZW50ZS4gTyBndWVycmVpcm8gw6AgZGlyZWl0YSwgVGFybywgc2VtcHJlIGRpeiBhIHZlcmRhZGUuIEVsZXMgc8OzIHBvZGVtIGZhemVyIHVtYSBwZXJndW50YSBhIHVtIGRvcyBndWVycmVpcm9zIHBhcmEgZGVzY29icmlyIG8gY2FtaW5obyBjb3JyZXRvLiA8YnI+PGJyPlF1YWwgcGVyZ3VudGEgSGlyb3NoaSBkZXZlIGZhemVyIHBhcmEgZGVzY29icmlyIG8gY2FtaW5obyBjb3JyZXRvP1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yL2Rlc2FmaW8yLndlYnBcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiUXVhbCDDqSBvIGNhbWluaG8gc2VndXJvP1wiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIGV1IHBlcmd1bnRhc3NlIGFvIG91dHJvIGd1ZXJyZWlybyBxdWFsIMOpIG8gY2FtaW5obyBzZWd1cm8sIHF1ZSBjYW1pbmhvIGVsZSBpbmRpY2FyaWE/XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiTyBjYW1pbmhvIMOgIGVzcXVlcmRhIMOpIHNlZ3Vybz9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPIGNhbWluaG8gw6AgZGlyZWl0YSDDqSBzZWd1cm8/XCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgXCJQZXJndW50ZSBhIHVtIGd1ZXJyZWlybyBvIHF1ZSBvIG91dHJvIGRpcmlhLiBEZXBvaXMsIGVzY29saGEgbyBjYW1pbmhvIG9wb3N0by5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEJvc3F1ZSBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVudHJhbSBlbSB1bSBib3NxdWUgc29tYnJpbyBjaGVpbyBkZSBhcm1hZGlsaGFzIGUgZGVzYWZpb3MuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk8gYW1iaWVudGUgw6kgZXNjdXJvLCBjb20gY2FtaW5ob3MgcXVlIHBhcmVjZW0gbXVkYXIgZGUgbHVnYXIuIEVsZXMgZW5mcmVudGFtIG9ic3TDoWN1bG9zIGNvbW8gY2FtaW5ob3MgcXVlIGRlc2FwYXJlY2VtIGUgw6Fydm9yZXMgcXVlIHNlIG1vdmVtLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJDb25zaWRlcmUgYXMgc2VndWludGVzIHByb3Bvc2nDp8O1ZXM6IDxicj48YnI+UDogSGlyb3NoaSBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLiA8YnI+UTogSGlyb3NoaSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZS4gPGJyPlI6IFVtYSDDoXJ2b3JlIHNlIG1vdmUgZSBibG9xdWVpYSBvIGNhbWluaG8uIDxicj48YnI+Q29tIGJhc2UgbmFzIHByb3Bvc2nDp8O1ZXMgZm9ybmVjaWRhcywgYW5hbGlzZSBhIGbDs3JtdWxhIGzDs2dpY2E6IDxicj48YnI+SCA9IChQIOKGkiBRKSDiiKcgKMKsIFAg4oaSIFIpIDxicj48YnI+RSBkZXRlcm1pbmUgcXVhbCBkYXMgYWx0ZXJuYXRpdmFzIHJlcHJlc2VudGEgY29ycmV0YW1lbnRlIGEgZsOzcm11bGEgZm9ybmVjaWRhLlwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zL2Rlc2FmaW8zLndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUsIGVudMOjbyB1bWEgw6Fydm9yZSBzZSBtb3ZlIGUgYmxvcXVlaWEgbyBjYW1pbmhvLCBlIHNlIEhpcm9zaGkgZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIGEgw6Fydm9yZSBuw6NvIHNlIG1vdmUuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZSwgZW50w6NvIGVsZXMgZW5jb250cmFtIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGUgc2UgdW1hIMOhcnZvcmUgYmxvcXVlaWEgbyBjYW1pbmhvLCBlbnTDo28gSGlyb3NoaSBuw6NvIGVuY29udHJvdSB1bSBjYW1pbmhvIGVzdMOhdmVsLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgbsOjbyBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlbnTDo28gZWxlIGUgc2V1cyBhbWlnb3MgbsOjbyBhdmFuw6dhbSBubyBib3NxdWUsIG1hcyB1bWEgw6Fydm9yZSBzZW1wcmUgc2UgbW92ZSBpbmRlcGVuZGVudGVtZW50ZS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJTZSBIaXJvc2hpIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGVudMOjbyBlbGUgZSBzZXVzIGFtaWdvcyBhdmFuw6dhbSBubyBib3NxdWUsIG1hcyBzZSBIaXJvc2hpIG7Do28gZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIHVtYSDDoXJ2b3JlIHNlIG1vdmUgZSBibG9xdWVpYSBvIGNhbWluaG8uXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgICAgXCJQYXJhIHJlc29sdmVyIGVzdGEgcXVlc3TDo28sIHZlcmlmaXF1ZSBzZSBjYWRhIHBhcnRlIGRhIGbDs3JtdWxhIGzDs2dpY2EgSD0oUOKGklEp4oinKMKsUOKGklIpIGVzdMOhIGNvcnJldGFtZW50ZSByZXByZXNlbnRhZGEgbmFzIGFsdGVybmF0aXZhcy5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEVuY29udHJvIGNvbSBEYWljaGlcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIGNvcmHDp8OjbyBkbyBib3NxdWUsIEhpcm9zaGkgZW5jb250cmEgRGFpY2hpLCBvIHZpbMOjbywgc2VudGFkbyBlbSB1bSB0cm9ubyBmZWl0byBkZSBvc3NvcyBlIHBlZHJhcy5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRGFpY2hpIHJldmVsYSBxdWUgY2FwdHVyb3UgQWtlbWkgcGFyYSBhdHJhaXIgbyB2ZXJkYWRlaXJvIGhlcsOzaSwgbWFzIGVzdMOhIHN1cnByZXNvIGFvIHZlciBIaXJvc2hpLiBFbGUgc3ViZXN0aW1hIEhpcm9zaGkgZSBvIGRlc2FmaWEgYSByZXNvbHZlciB1bSBlbmlnbWEgZGUgbMOzZ2ljYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJEYWljaGkgcHJvcMO1ZSBvIHNlZ3VpbnRlIGRlc2FmaW8gbMOzZ2ljbyBwYXJhIEhpcm9zaGk6PGJyPjxicj5TZSB2b2PDqiDDqSByZWFsbWVudGUgbyBoZXLDs2ksIGVudMOjbyB2b2PDqiBjb25zZWd1aXLDoSByZXNvbHZlciBlc3RlIGVuaWdtYS4gU2Ugdm9jw6ogcmVzb2x2ZXIgbyBlbmlnbWEsIGVudMOjbyB2b2PDqiBlIHNldXMgYW1pZ29zIHBvZGVyw6NvIGVzY2FwYXIuIFNlIHZvY8OqIG7Do28gcmVzb2x2ZXIgbyBlbmlnbWEsIHZvY8OqcyBzZSB0b3JuYXLDo28gbWV1cyBzZXJ2b3MuIDxicj48YnI+Q29tIGJhc2UgbmFzIHByb3Bvc2nDp8O1ZXMgZm9ybmVjaWRhczogPGJyPjxicj5QID0gw4kgaGVyw7NpPGJyPlEgPSBSZXNvbHZlciBlbmlnbWE8YnI+UiA9IEFtaWdvcyBlc2NhcGFyPGJyPlMgPSBUb3JuYXLDo28gbWV1cyBzZXJ2b3MgPGJyPjxicj5EZXRlcm1pbmUgcXVhbCBkYXMgYWx0ZXJuYXRpdmFzIHJlcHJlc2VudGEgY29ycmV0YW1lbnRlIGEgZsOzcm11bGEgbMOzZ2ljYSBwcm9wb3N0YSBwb3IgRGFpY2hpLlwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCIoKFDihpJRKeKIpyhR4oaSUiniiKcowqxR4oaSUykpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKChQ4oaSUSniiKcoUeKGklIp4oinKMKsUeKGksKsUykpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKChQ4oaSUSniiKcoUeKGklMp4oinKMKsUeKGklIpKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIFwiSWRlbnRpZmlxdWUgY2FkYSBwcm9wb3Npw6fDo28gY29uZGljaW9uYWwgbmEgZmFsYSBkbyBwZXJzb25hZ2VtLjxicj5UcmFkdXphIGNhZGEgcGFydGUgZGEgc2VudGVuw6dhIHBhcmEgdW1hIGV4cHJlc3PDo28gbMOzZ2ljYS48YnI+VmVyaWZpcXVlIHNlIGEgZXhwcmVzc8OjbyBsw7NnaWNhIHNlbGVjaW9uYWRhIGNvcnJlc3BvbmRlIGV4YXRhbWVudGUgw6BzIGNvbmRpw6fDtWVzIGZvcm5lY2lkYXMgbmEgcXVlc3TDo28uXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBGdWdhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiUGFyYSBhdGl2YXIgbyB0b3JpaSBtw6FnaWNvLCBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgYSBzZWd1aW50ZSBkZXNhZmlvOjxicj48YnI+U2UgYXRpdmFybW9zIG8gdG9yaWkgbcOhZ2ljbywgZW50w6NvIGVzY2FwYXJlbW9zIGRvIGJvc3F1ZS4gU2UgRGFpY2hpIG5vcyBhbGNhbsOnYXIsIGVudMOjbyBzZXJlbW9zIGNhcHR1cmFkb3MuIFNlIG7Do28gZm9ybW9zIGNhcHR1cmFkb3MsIGVudMOjbyBlc2NhcGFyZW1vcy4gU2UgbsOjbyBhdGl2YXJtb3MgbyB0b3JpaSBtw6FnaWNvLCBlbnTDo28gc2VyZW1vcyBjYXB0dXJhZG9zIG91IERhaWNoaSBub3MgYWxjYW7Dp2Fyw6EuIDxicj48YnI+Q29tIGJhc2UgbmFzIHByb3Bvc2nDp8O1ZXMgZm9ybmVjaWRhczogPGJyPjxicj5QOiBBdGl2YW1vcyBvIHRvcmlpIG3DoWdpY28uIDxicj5ROiBFc2NhcGFtb3MgZG8gYm9zcXVlLiA8YnI+UjogRGFpY2hpIG5vcyBhbGNhbsOnYS4gPGJyPlM6IFNlcmVtb3MgY2FwdHVyYWRvcy4gPGJyPjxicj4gRGV0ZXJtaW5lIHF1YWwgZGFzIGFsdGVybmF0aXZhcyByZXByZXNlbnRhIGNvcnJldGFtZW50ZSBhIGbDs3JtdWxhIGzDs2dpY2EgcHJvcG9zdGEgcG9yIERhaWNoaS5cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS9kZXNhZmlvNS53ZWJwXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpJTKeKIpyjCrFPihpJRKeKIpyjCrFDihpIoU+KIqFIpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKFDihpJRKeKIpyhS4oaSwqxTKeKIpyjCrFPihpLCrFEp4oinKMKsUOKGkihT4oioUikpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiKFDihpJRKeKIpyhS4oaSwqxTKeKIpyhT4oaSUSniiKcowqxQ4oaSwqxTKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIFwiSWRlbnRpZmlxdWUgY2FkYSBwcm9wb3Npw6fDo28gY29uZGljaW9uYWwgbmFzIGluc3RydcOnw7VlcyBkYWRhcy48YnI+Q2VydGlmaXF1ZS1zZSBkZSBxdWUgYSBleHByZXNzw6NvIGzDs2dpY2Egc2VsZWNpb25hZGEgcmVwcmVzZW50YSBjb3JyZXRhbWVudGUgY2FkYSB1bWEgZGFzIGNvbmRpw6fDtWVzIGRlc2NyaXRhcy48YnI+Q29tcGFyZSBjYWRhIGFsdGVybmF0aXZhIGNvbSBhcyBjb25kacOnw7VlcyBvYnRpZGFzIHBhcmEgZGV0ZXJtaW5hciBhIGNvcnJldGEuXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICBdKSxcbiAgICBuZXcgQ2hhcHRlcihbXG4gICAgICAgIG5ldyBTY2VuZShcIk8gVmlsYXJlam8gU2VtIFZpZGFcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBjb21wYW5oaWEgZW1lcmdlbSBkbyB0b3JpaSBtw6FnaWNvIGUgY2hlZ2FtIGFvIFJlaW5vIGRhcyBTb21icmFzLCBvbmRlIGFzIGNvaXNhcyBuw6NvIHBvc3N1ZW0gdmlkYSBuZW0gY29yLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBzw6NvIHJlY2ViaWRvcyBwb3IgQXlhbWUsIHVtYSBzYWNlcmRvdGlzYSBlIG1lc3RyYSBkYSBjYWxpZ3JhZmlhIGUgZGEgcGludHVyYSBtw6FnaWNhLCBxdWUgdHJheiB2aWRhIMOgcyBjb2lzYXMgY29tIHN1YSBhcnRlLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgZXhwbGljYSBxdWUgcGFyYSBhdmFuw6dhciwgZWxlcyBwcmVjaXNhbSByZXN0YXVyYXIgYSB2aWRhIGRlIHbDoXJpYXMgw6FyZWFzIHF1ZSBmb3JhbSBkZXNib3RhZGFzIHBlbG9zIGNhcGFuZ2FzIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBgPHA+Q29uc2lkZXJlIGEgY2VuYSBlbSBxdWUgSGlyb3NoaSBwcmVjaXNhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhIGRlIHByZWRpY2Fkb3MgcGFyYSBhdmFuw6dhciBubyBWaWxhcmVqbyBTZW0gVmlkYS48L3A+IFxuICAgICAgICAgICAgICAgIDxwPlwiU2UgdW1hIMOhcmVhIGVzdMOhIGRlc2JvdGFkYSBwZWxvcyBjYXBhbmdhcyBkZSBEYWljaGkgZSByZXN0YXVyYW1vcyBhIHZpZGEgZGVzc2Egw6FyZWEsIGVudMOjbyBhdmFuw6dhcmVtb3MuXCI8L3A+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiaXRlbS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgPGxpPnAoeCk6IFwiw4FyZWEgeCBlc3TDoSBkZXNib3RhZGEgcGVsb3MgY2FwYW5nYXMgZGUgRGFpY2hpXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5xKHgpOiBcIlJlc3RhdXJhbW9zIGEgdmlkYSBkYSDDoXJlYSB4XCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5yOiBcIlBvZGVtb3MgYXZhbsOnYXJcIjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cD5RdWFsIGRhcyBzZWd1aW50ZXMgb3DDp8O1ZXMgY29ycmV0YW1lbnRlIHJlcHJlc2VudGEgYSBwcm9wb3Npw6fDo28gcXVlIGRlc2NyZXZlIGEgbmVjZXNzaWRhZGUgZGUgcmVzdGF1cmFyIGEgdmlkYSBkYXMgw6FyZWFzIHBhcmEgYXZhbsOnYXI/PHA+YCxcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeCAocCh4KSDihpIgcSh4KSDihpJyKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3ggKHAoeCkg4oaSIHEoeCkpIOKGknJcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIN4ICgocCh4KSDiiKcgcSh4KSkg4oaScilcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIN4IChwKHgpIOKGkiBxKHgpIOKGknIpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgXCJQcmVzdGUgYXRlbsOnw6NvIMOgIGVzdHJ1dHVyYSBkYSBpbXBsaWNhw6fDo28gbMOzZ2ljYTogaWRlbnRpZmlxdWUgYSByZWxhw6fDo28gZW50cmUgYXMgw6FyZWFzIGRlc2JvdGFkYXMgZSBhIG5lY2Vzc2lkYWRlIGRlIHJlc3RhdXLDoS1sYXMgcGFyYSBwb2RlciBhdmFuw6dhci4gQSBmb3JtdWxhw6fDo28gY29ycmV0YSBkZXZlIHJlZmxldGlyIHF1ZSwgcGFyYSB0b2RhcyBhcyDDoXJlYXMsIGEgcmVzdGF1cmHDp8OjbyDDqSBuZWNlc3PDoXJpYSBwYXJhIGF2YW7Dp2FyLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgRGFuw6dhIGRvcyBHdWVycmVpcm9zIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gYSBwcmltZWlyYSDDoXJlYSByZXN0YXVyYWRhLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY29udGludWFtIHN1YSBqb3JuYWRhIGVtIGJ1c2NhIGRhIHByaW5jZXNhIGUgc2UgZGVwYXJhbSBjb20gdW0gZ3J1cG8gZGUgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlbSB1bSBww6F0aW8gc29tYnJpby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGFkZW50cmFyIGEgw6FyZWEsIEhpcm9zaGkgZGVzY29icmUgcXVlIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2EgZG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgcG9kZSBkZXNibG9xdWVhciBwYXNzYWdlbnMgc2VjcmV0YXMgcXVlIERhaWNoaSB0cmFuY291LlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEyXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIGA8cD5Db25zaWRlcmUgYSBjZW5hIGVtIHF1ZSBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EgZGUgcHJlZGljYWRvcyBwYXJhIGRlc2Jsb3F1ZWFyIHBhc3NhZ2VucyBzZWNyZXRhcyBubyBSZWlubyBkYXMgU29tYnJhczwvcD4gXG4gICAgICAgICAgICAgICAgPHA+XCJTZSBvcyBndWVycmVpcm9zIGRhcyBzb21icmFzIGZhemVtIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2EgZSBleGlzdGUgdW1hIHBhc3NhZ2VtIHRyYW5jYWRhIHBvciBEYWljaGksIGVudMOjbyBlc3NhIHBhc3NhZ2VtIHNlcsOhIGRlc2Jsb3F1ZWFkYS5cIjwvcD4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJpdGVtLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICA8bGk+cDogXCJPcyBndWVycmVpcm9zIGRhcyBzb21icmFzIGZhemVtIGEgZGFuw6dhIHJpdHVhbMOtc3RpY2FcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnEoeCk6IFwiUGFzc2FnZW0geCBlc3TDoSB0cmFuY2FkYSBwb3IgRGFpY2hpXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5yKHgpOiBcIlBhc3NhZ2VtIHggZXN0w6EgZGVzYmxvcXVlYWRhXCI8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPHA+UXVhbCBkYXMgc2VndWludGVzIG9ww6fDtWVzIGNvcnJldGFtZW50ZSByZXByZXNlbnRhIGEgcHJvcG9zacOnw6NvIHF1ZSBkZXNjcmV2ZSBhIHJlbGHDp8OjbyBlbnRyZSBhIGRhbsOnYSBkb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlIGFzIHBhc3NhZ2VucyBzZWNyZXRhcz88cD5gLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCIocCDiiKcgKCjiiIN4KSBxKHgpKSDihpIgKOKIg3gpIHIoeCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeCAocCDihpIgcSh4KSDihpIgcih4KSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIN4IChwIOKGknEgKHgpIOKGkiByKHgpKSDihpIgKOKIgHgpIHIoeCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicCDihpIg4oiDeCggcSh4KSDihpIgcih4KSlcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBcIkZvcXVlIG5hIHJlbGHDp8OjbyBkZSBjYXVzYSBlIGVmZWl0bzogYSBkYW7Dp2Egcml0dWFsw61zdGljYSBkZXZlIHNlciBhIGNhdXNhIHF1ZSBsZXZhIGFvIGRlc2Jsb3F1ZWlvIGRhcyBwYXNzYWdlbnMgdHJhbmNhZGFzIHBvciBEYWljaGkuIEEgZm9ybXVsYcOnw6NvIGNvcnJldGEgZGV2ZSByZWZsZXRpciBxdWUgYSBkYW7Dp2EgcmVzdWx0YSBubyBkZXNibG9xdWVpbyBkZSB0b2RhcyBhcyBwYXNzYWdlbnMgdHJhbmNhZGFzLjJcIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEZlc3RpdmFsIGRvcyBQw6Fzc2Fyb3MgZGUgUGFwZWxcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIHBhc3NhciBwb3IgdW1hIHBhc3NhZ2VtIHNlY3JldGEgZGVzYmxvcXVlYWRhIHBlbG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjaGVnYW0gYSB1bWEgY2lkYWRlIG9uZGUgZXN0w6EgYWNvbnRlY2VuZG8gdW0gZmVzdGl2YWwgZGUgcMOhc3Nhcm9zIGRlIHBhcGVsIChvcmlnYW1pKS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgZGVzY29icmVtIHF1ZSBEYWljaGkgZXNjb25kZXUgY2hhdmVzIG5vcyBww6Fzc2Fyb3MgZGUgcGFwZWwgcGFyYSB0cmFuY2FyIG91dHJhcyDDoXJlYXMgZG8gc2V1IFJlaW5vLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF83LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIGA8cD5Db25zaWRlcmUgYSBjZW5hIGVtIHF1ZSBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EgZGUgcHJlZGljYWRvcyBwYXJhIGVuY29udHJhciBjaGF2ZXMgbm8gRmVzdGl2YWwgZG9zIFDDoXNzYXJvcyBkZSBQYXBlbDwvcD4gXG4gICAgICAgICAgICAgICAgPHA+XCJQYXJhIHRvZG8gcMOhc3Nhcm8gZGUgcGFwZWwgcXVlIGNvbnTDqW0gdW1hIGNoYXZlLiBFc3NhIGNoYXZlIHRyYW5jYSBvdSBuw6NvIHRyYW5jYSB1bWEgw6FyZWEgZG8gUmVpbm8sIGVudMOjbyBzZXLDoSBwb3Nzw612ZWwgYWJyaXIgYSDDoXJlYS5cIjwvcD4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJpdGVtLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICA8bGk+cCh4KTogXCJQw6Fzc2FybyBkZSBwYXBlbCB4IGNvbnTDqW0gdW1hIGNoYXZlXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5xKHgpKTogXCJDaGF2ZSB4IHRyYW5jYSB1bWEgw6FyZWEgZG8gUmVpbm9cIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPsKscSh4KSk6IFwiQ2hhdmUgeCBuw6NvIHRyYW5jYSB1bWEgw6FyZWEgZG8gUmVpbm9cIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnIoeCk6IFwiw4FyZWEgeCBzZXLDoSBhYmVydGFcIjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cD5RdWFsIGRhcyBzZWd1aW50ZXMgb3DDp8O1ZXMgY29ycmV0YW1lbnRlIHJlcHJlc2VudGEgYSBwcm9wb3Npw6fDo28gcXVlIGRlc2NyZXZlIGEgcmVsYcOnw6NvIGVudHJlIG9zIHDDoXNzYXJvcyBkZSBwYXBlbCBlIGFzIMOhcmVhcyB0cmFuY2FkYXM/PHA+YCxcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy84XzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeCAocCh4KSDihpIgKHEoeCkg4oioIMKscSh4KSkg4oaSIHIoeCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeCAocCh4KSDihpIg4oiAeSAocSh5ICnihpIgcih5KSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeCAocCh4KSDihpIgKChxKHgpIOKIqCDCrHEoeCkpIOKGkiByKHgpKSkgXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeCAocCh4KSDihpIgKHEoeCkg4oioIHEoeCkpIOKGkiByKHgpKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIFwiT2JzZXJ2ZSBhIHJlbGHDp8OjbyBkaXJldGEgZW50cmUgYXMgY2hhdmVzIG5vcyBww6Fzc2Fyb3MgZGUgcGFwZWwgZSBhcyDDoXJlYXMgdHJhbmNhZGFzLiBBIGZvcm11bGHDp8OjbyBjb3JyZXRhIGRldmUgcmVmbGV0aXIgcXVlLCBwYXJhIHRvZG9zIG9zIHDDoXNzYXJvcyBkZSBwYXBlbCBxdWUgY29udMOpbSB1bWEgY2hhdmUsIGVzc2EgY2hhdmUgw6kgcmVzcG9uc8OhdmVsIHBvciB0cmFuY2FyIG91IGRlc3RyYW5jYXIgdW1hIMOhcmVhIGVzcGVjw61maWNhIGRvIFJlaW5vLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gUmVzZ2F0ZSBkYSBQcmluY2VzYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIHRvZGFzIGFzIMOhcmVhcyByZXN0YXVyYWRhcyBlIGNoYXZlcyBlbmNvbnRyYWRhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhbyBjYXN0ZWxvIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFrZW1pIGVzdMOhIHByZXNhIGVtIHVtYSBjZWxhIGdpZ2FudGUgZGVudHJvIGRvIGNhc3RlbG8sIGNlcmNhZG8gcG9yIGZvZ28uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBgPHA+Q29uc2lkZXJlIGEgY2VuYSBlbSBxdWUgSGlyb3NoaSBwcmVjaXNhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhIGRlIHByZWRpY2Fkb3MgcGFyYSBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaS4gQSBzZWd1aXIsIGVzdMOhIHVtYSB0ZW50YXRpdmEgZGUgZm9ybWFsaXphciBhIHNpdHVhw6fDo28gdXNhbmRvIGzDs2dpY2EgZGUgcHJlZGljYWRvcy4gPC9wPiBcbiAgICAgICAgICAgICAgICA8cD5cIlNlIEFrZW1pIGVzdMOhIG5vIGNhc3RlbG8gZSBvIGNhc3RlbG8gZXN0w6EgY2VyY2FkbyBwb3IgZm9nbywgZW50w6NvIHByZWNpc2Ftb3MgYXRpdmFyIHVtYSBwb250ZSBpbnZpc8OtdmVsLCBxdWUgc8OzIGFwYXJlY2UgcXVhbmRvIHRvZGFzIGFzIMOhcmVhcyBkbyByZWlubyBlc3TDo28gcmVzdGF1cmFkYXMuXCI8L3A+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiaXRlbS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgPGxpPnAoeCk6IFwiQWtlbWkgZXN0w6Egbm8gY2FzdGVsb1wiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+cSh4KTogXCJPIGNhc3RlbG8gZXN0w6EgY2VyY2FkbyBwb3IgZm9nb1wiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+cih4KTogXCJQcmVjaXNhbW9zIGF0cmF2ZXNzYXIgbyBmb2dvXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5zKHgpOiBcIkF0aXZhbW9zIGEgcG9udGUgaW52aXPDrXZlbFwiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+dCh4KTogXCJUb2RhcyBhcyDDoXJlYXMgZG8gcmVpbm8gZXN0w6NvIHJlc3RhdXJhZGFzXCI8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPHA+UXVhbCBkYXMgc2VndWludGVzIG9ww6fDtWVzIGNvcnJldGFtZW50ZSByZXByZXNlbnRhIGEgcHJvcG9zacOnw6NvIHF1ZSBkZXNjcmV2ZSBhIG5lY2Vzc2lkYWRlIGRlIGF0aXZhciB1bWEgcG9udGUgaW52aXPDrXZlbCBwYXJhIGF0cmF2ZXNzYXIgbyBmb2dvIGUgc2FsdmFyIEFrZW1pPzxwPmAsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIuKIgHgocCh4KeKGkihxKHgp4oincih4KeKGknMoeCkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIgHgocSh4KeKIp3IoeCnihpIodCh4KeKGknMoeCkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3gocCh4KeKIpyhxKHgp4oincih4KeKGknMoeCkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIgHgocCh4KeKIp3EoeCniiKdyKHgp4oaScyh4KSlcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICBcIkZvcXVlIG5hIGVzdHJ1dHVyYSBkYSBpbXBsaWNhw6fDo28gbMOzZ2ljYTogaWRlbnRpZmlxdWUgYXMgY29uZGnDp8O1ZXMgbmVjZXNzw6FyaWFzIChvIGNhc3RlbG8gY2VyY2FkbyBwb3IgZm9nbyBlIGEgbmVjZXNzaWRhZGUgZGUgYXRyYXZlc3NhciBvIGZvZ28pIGUgYSBjb25kacOnw6NvIGFkaWNpb25hbCAodG9kYXMgYXMgw6FyZWFzIGRvIHJlaW5vIHJlc3RhdXJhZGFzKSBxdWUgbGV2YSDDoCBjb25jbHVzw6NvIChhdGl2YcOnw6NvIGRhIHBvbnRlIGludmlzw612ZWwpLiBBIG9ww6fDo28gY29ycmV0YSBkZXZlIHJlZmxldGlyIHF1ZSBhIGF0aXZhw6fDo28gZGEgcG9udGUgZGVwZW5kZSBkYSByZXN0YXVyYcOnw6NvIGRvIHJlaW5vIGFww7NzIHNhdGlzZmF6ZXIgYXMgY29uZGnDp8O1ZXMgaW5pY2lhaXMuXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBDZWxlYnJhw6fDo29cIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFww7NzIHNhbHZhciBhIFByaW5jZXNhIEFrZW1pIGUgZGVycm90YXIgRGFpY2hpLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgcmV0b3JuYW0gYW8gUmVpbm8gZGEgTHV6IHBhcmEgdW1hIGdyYW5kZSBjZWxlYnJhw6fDo28uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkF5YW1lIG9yZ2FuaXphIHVtYSBmZXN0YSBwYXJhIG9zIGhlcsOzaXMgY29tZW1vcmFyZW0gYSB2aXTDs3JpYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgYDxwPkNvbnNpZGVyZSBhIGNlbmEgZW0gcXVlIEhpcm9zaGkgcHJlY2lzYSByZXNvbHZlciB1bSDDumx0aW1vIGRlc2FmaW8gZGUgbMOzZ2ljYSBkZSBwcmVkaWNhZG9zIGR1cmFudGUgYSBjZWxlYnJhw6fDo28gcGFyYSBhYnJpciBvIGJhw7ogZG8gdGVzb3Vyby4gQSBzZWd1aXIsIGVzdMOhIHVtYSB0ZW50YXRpdmEgZGUgZm9ybWFsaXphciBhIHNpdHVhw6fDo28gdXNhbmRvIGzDs2dpY2EgZGUgcHJlZGljYWRvcy48L3A+IFxuICAgICAgICAgICAgICAgIDxwPlwiU2UgYSBjaGF2ZSBlc3TDoSBuYSBjYWl4YSB2ZXJtZWxoYSBvdSBuYSBjYWl4YSBhenVsLCBlIGEgY2FpeGEgdmVybWVsaGEgZXN0w6EgdHJhbmNhZGEsIGVudMOjbyBhIGNoYXZlIGVzdMOhIG5hIGNhaXhhIGF6dWwuXCI8L3A+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiaXRlbS1saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgPGxpPnAoeClwKHgpcCh4KTogXCJBIGNoYXZlIGVzdMOhIG5hIGNhaXhhIHZlcm1lbGhhXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5xKHgpcSh4KXEoeCk6IFwiQSBjaGF2ZSBlc3TDoSBuYSBjYWl4YSBhenVsXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5yKHgpcih4KXIoeCk6IFwiQSBjYWl4YSB2ZXJtZWxoYSBlc3TDoSB0cmFuY2FkYVwiPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxwPlF1YWwgZGFzIHNlZ3VpbnRlcyBvcMOnw7VlcyBjb3JyZXRhbWVudGUgcmVwcmVzZW50YSBhIHByb3Bvc2nDp8OjbyBxdWUgZGVzY3JldmUgYSBuZWNlc3NpZGFkZSBkZSBhdGl2YXIgdW1hIHBvbnRlIGludmlzw612ZWwgcGFyYSBhdHJhdmVzc2FyIG8gZm9nbyBlIHNhbHZhciBBa2VtaT88cD5gLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIuKIgHgocih4KSDihpIgKHAoeCkg4oioIHEoeCkg4oaSIHEoeCkpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3gocih4KSDiiKcgKHAoeCkg4oioIHEoeCkpIOKGkiBxKHgpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIgHgoKHAoeCkg4oioIHEoeCkpIOKIpyByKHgpIOKGkiBxKHgpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3goKHAoeCkg4oioIHEoeCkpIOKIpyByKHgpIOKGkiDCrHAoeCniiKdxKHgpKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgICAgIFwiUHJlc3RlIGF0ZW7Dp8OjbyBhb3MgcXVhbnRpZmljYWRvcmVzOiDiiIB4IGluZGljYSBxdWUgYSBwcm9wb3Npw6fDo28gw6kgdsOhbGlkYSBwYXJhIHRvZGFzIGFzIHNpdHVhw6fDtWVzIHBvc3PDrXZlaXMsIGVucXVhbnRvIOKIg3ggaW5kaWNhIHF1ZSBhIHByb3Bvc2nDp8OjbyDDqSB2w6FsaWRhIHBhcmEgcGVsbyBtZW5vcyB1bWEgc2l0dWHDp8OjbyBlc3BlY8OtZmljYS4gQSBmb3JtdWxhw6fDo28gY29ycmV0YSBkZXZlIHVzYXIgbyBxdWFudGlmaWNhZG9yIHVuaXZlcnNhbCBwYXJhIHJlZmxldGlyIHF1ZSBhIGRlZHXDp8OjbyDDqSB2w6FsaWRhIGVtIHRvZG9zIG9zIGNhc29zIG9uZGUgYXMgY29uZGnDp8O1ZXMgc8OjbyBzYXRpc2ZlaXRhcy5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuXTtcblxuXG5zdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHN0YXJ0U2NyZWVuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBhcHBFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxpZmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHNjb3JlRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblxuICAgIGNvbnN0IHN0b3J5ID0gbmV3IFN0b3J5KFwiQSBBdmVudHVyYSBkZSBIaXJvc2hpIG5vIFJlaW5vIGRhcyBTb21icmFzXCIsIGNoYXB0ZXJzKTtcbiAgICBjb25zdCBnYW1lID0gbmV3IEdhbWVQbGF5KHN0b3J5LCBhcHBFbCwgc2NvcmVQYW5lbEVsLCBzY29yZUVsLCBsaWZlRWwsIFwibm9ybWFsXCIpO1xuICAgIGdhbWUuZ2FtZUxvb3AoKTtcbn0pO1xuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLFFBQVEsRUFBRTtRQUNyRixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJ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
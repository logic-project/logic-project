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
                <p class="challenge__hints">Dica: ${this.hints}</p>
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlUGFuZWxFbCwgc2NvcmVFbGVtZW50LCBsaWZlRWxlbWVudCwgbW9kZSA9ICdub3JtYWwnKSB7XG4gICAgICAgIHRoaXMuc3RvcnkgPSBzdG9yeTtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50ID0gYXBwRWxlbWVudDtcbiAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwgPSBzY29yZVBhbmVsRWw7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwiXCIgPyAnJyA6ICdsb2dpYy1wcm9qZWN0JztcbiAgICB9XG5cbiAgICBhc3luYyBnYW1lTG9vcCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlRGlzcGxheSgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoYXB0ZXIgb2YgdGhpcy5zdG9yeS5jaGFwdGVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY2VuZSBvZiBjaGFwdGVyLnNjZW5lcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NlbmUgb2Ygc2NlbmUuc3Vic2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGF3YWl0IHRoaXMuZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5Q2hhbGxlbmdlKHNjZW5lLmNoYWxsZW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlmZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1ZpY3RvcnlTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDUwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnY2hhbGxlbmdlX19pbWcnKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBjaGFsbGVuZ2UuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBjaGFsbGVuZ2UuaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNoYWxsZW5nZSBidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWx0ZXJuYXRpdmVcIl06Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyID0gc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZmVlZGJhY2tFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZmVlZGJhY2tFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZlZWRiYWNrJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYW5zd2VyID09IGNoYWxsZW5nZS5jb3JyZWN0QW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYWxsZW5nZS5jYWxsYmFjayhjaGFsbGVuZ2UucXVlc3Rpb24sIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUrKztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTY29yZURpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tFbGVtZW50LmlubmVySFRNTCA9ICc8cD5SZXNwb3N0YSBjb3JyZXRhITxicj5Wb2PDqiBnYW5ob3UgMSBwb250bzwvcD4nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlmZS0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrRWxlbWVudC5pbm5lckhUTUwgPSAnPHA+UmVzcG9zdGEgZXJyYWRhITxicj5Wb2PDqiBwZXJkZXUgMSB2aWRhPC9wPic7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKGZlZWRiYWNrRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5yZW1vdmVDaGlsZChmZWVkYmFja0VsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgMjAwMCk7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUxpZmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50LmlubmVySFRNTCA9IGBWaWRhczogJHt0aGlzLmxpZmV9YDtcbiAgICB9XG5cbiAgICB1cGRhdGVTY29yZURpc3BsYXkoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50LmlubmVySFRNTCA9IGBQb250b3M6ICR7dGhpcy5zY29yZX1gO1xuICAgIH1cblxuICAgIGdhbWVPdmVyKCkge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLmNsYXNzTGlzdC5hZGQoJ2dhbWVfb3Zlcl9faW1hZ2UnKTtcbiAgICAgICAgaW1nLnNyYyA9IGBhc3NldHMvaW1hZ2VzL2NlbmFzL2RlcnJvdGEvMi5qcGVnYDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVQYW5lbEVsLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc3QgZ2FtZU92ZXJDb250ZWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmNsYXNzTGlzdC5hZGQoJ2dhbWVfb3ZlcicpO1xuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuaW5uZXJIVE1MID0gYDxoMT5HYW1lIE92ZXI8L2gxPmA7XG4gICAgICAgICAgICBnYW1lT3ZlckNvbnRlaW5lci5pbm5lckhUTUwgKz0gYDxwIGNsYXNzPVwiZ2FtZV9vdmVyX19zY29yZVwiPlBvbnR1YcOnw6NvOiAke3RoaXMuc2NvcmV9PC9wPmA7ICAgIFxuICAgICAgICAgICAgZ2FtZU92ZXJDb250ZWluZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgICAgIGdhbWVPdmVyQ29udGVpbmVyLmlubmVySFRNTCArPSBgPGEgaHJlZj1cIlwiIGNsYXNzPVwiZ2FtZV9vdmVyX19idXR0b25cIj5SZWluaWNpYXI8L2E+YDtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChnYW1lT3ZlckNvbnRlaW5lcik7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgZ2FtZSBvdmVyIGltYWdlJyk7XG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICBzaG93VmljdG9yeVNjcmVlbigpIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCd2aWN0b3J5X19pbWFnZScpO1xuICAgICAgICBpbWcuc3JjID0gYGFzc2V0cy9pbWFnZXMvY2VuYXMvdml0b3JpYS8xLmpwZWdgO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY29yZVBhbmVsRWwuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICAgICBjb25zdCB2aWN0b3J5Q29udGVpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmNsYXNzTGlzdC5hZGQoJ3ZpY3RvcnknKTtcbiAgICAgICAgICAgIHZpY3RvcnlDb250ZWluZXIuaW5uZXJIVE1MID0gYDxoMT5WaXTDs3JpYTwvaDE+YDtcbiAgICAgICAgICAgIHZpY3RvcnlDb250ZWluZXIuaW5uZXJIVE1MICs9IGA8cCBjbGFzcz1cInZpY3RvcnlfX3Njb3JlXCI+UG9udHVhw6fDo286ICR7dGhpcy5zY29yZX08L3A+YDsgICAgXG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICB2aWN0b3J5Q29udGVpbmVyLmlubmVySFRNTCArPSBgPGEgaHJlZj1cIlwiIGNsYXNzPVwidmljdG9yeV9fYnV0dG9uXCI+UmVpbmljaWFyPC9hPmA7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuYXBwZW5kQ2hpbGQodmljdG9yeUNvbnRlaW5lcik7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdmljdG9yeSBpbWFnZScpO1xuICAgICAgICB9O1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTdG9yeSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIGNoYXB0ZXJzKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5jaGFwdGVycyA9IGNoYXB0ZXJzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgQ2hhcHRlciB7XG4gICAgY29uc3RydWN0b3Ioc2NlbmVzKSB7XG4gICAgICAgIHRoaXMuc2NlbmVzID0gc2NlbmVzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBzdWJzY2VuZXMsIGNoYWxsZW5nZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuc3Vic2NlbmVzID0gc3Vic2NlbmVzO1xuICAgICAgICB0aGlzLmNoYWxsZW5nZSA9IGNoYWxsZW5nZTtcbiAgICB9XG59XG5cblxuXG5cbiIsImV4cG9ydCBjbGFzcyBTdWJTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGV4dCwgaW1hZ2UsIGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIH1cbiB9IiwiZXhwb3J0IGNsYXNzIENoYWxsZW5nZSB7XG4gICAgY29uc3RydWN0b3IocXVlc3Rpb24sIGltYWdlLCBhbHRlcm5hdGl2ZXMsIGNvcnJlY3RBbnN3ZXIsIGhpbnRzLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnF1ZXN0aW9uID0gcXVlc3Rpb247XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5hbHRlcm5hdGl2ZXMgPSBhbHRlcm5hdGl2ZXM7XG4gICAgICAgIHRoaXMuY29ycmVjdEFuc3dlciA9IGNvcnJlY3RBbnN3ZXI7XG4gICAgICAgIHRoaXMuaGludHMgPSBoaW50cztcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBcbiAgICBkaXNwbGF5KCkge1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYWxsZW5nZVwiPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzcz1cImNoYWxsZW5nZV9fdGl0bGVcIj5EZXNhZmlvPC9oMj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhbGxlbmdlX19xdWVzdGlvblwiPiR7dGhpcy5xdWVzdGlvbn08L2Rpdj5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiY2hhbGxlbmdlX19pbWdcIiBzcmM9XCIke3RoaXMuaW1hZ2V9XCIgLz5cbiAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImNoYWxsZW5nZV9faGludHNcIj5EaWNhOiAke3RoaXMuaGludHN9PC9wPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImNoYWxsZW5nZV9fbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICAke3RoaXMuYWx0ZXJuYXRpdmVzLm1hcCgoYWx0ZXJuYXRpdmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiY2hhbGxlbmdlX19pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIG5hbWU9XCJhbHRlcm5hdGl2ZVwiIHZhbHVlPVwiJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9faW5wdXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIGNsYXNzPVwiY2hhbGxlbmdlX19sYWJlbFwiPiR7YWx0ZXJuYXRpdmV9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz1cIiR7dGhpcy5jYWxsYmFja30oKVwiIGNsYXNzPVwiY2hhbGxlbmdlX19idXR0b25cIj5SZXNwb25kZXI8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH1cbiAgICBcbn0iLCJpbXBvcnQgeyBHYW1lUGxheSB9IGZyb20gXCIuL0dhbWVcIjtcbmltcG9ydCB7IFN0b3J5IH0gZnJvbSBcIi4vU3RvcnlcIjtcbmltcG9ydCB7IENoYXB0ZXIgfSBmcm9tIFwiLi9DaGFwdGVyXCI7XG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gXCIuL1NjZW5lXCI7XG5pbXBvcnQgeyBTdWJTY2VuZSB9IGZyb20gXCIuL1N1YlNjZW5lXCI7XG5pbXBvcnQgeyBDaGFsbGVuZ2UgfSBmcm9tIFwiLi9DaGFsbGVuZ2VcIjtcblxuXG5jb25zdCBhcHBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwXCIpO1xuY29uc3Qgc2NvcmVQYW5lbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY29yZV9wYW5lbFwiKTtcbmNvbnN0IGxpZmVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlmZVwiKTtcbmNvbnN0IHNjb3JlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjb3JlXCIpO1xuY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuY29uc3Qgc3RhcnRTY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LXNjcmVlblwiKTtcblxuY29uc3QgY2hhbGxlbmdlQ2FsbGJhY2sgPSAoc2NlbmVUaXRsZSwgYW5zd2VyKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNjZW5lOiAke3NjZW5lVGl0bGV9YCk7XG4gICAgY29uc29sZS5sb2coYEFuc3dlcjogJHthbnN3ZXJ9YCk7XG59XG5cblxuY29uc3QgY2hhcHRlcnMgPSBbXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIENoYW1hZG8gZG8gR3VhcmRpw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCB1bSBqb3ZlbSBzYW11cmFpLCBhY29yZGEgY29tIHVtIGVzdHJhbmhvIHNvbSB2aW5kbyBkbyBqYXJkaW0gZG8gc2V1IGRvam8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGludmVzdGlnYXIsIGVsZSBlbmNvbnRyYSB1bSBlc3DDrXJpdG8gZ3VhcmRpw6NvIGNoYW1hZG8gWXVraW11cmEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIll1a2ltdXJhIGVzdMOhIGRlc2VzcGVyYWRvIGUgcGVkZSBhIGFqdWRhIGRlIEhpcm9zaGkgcGFyYSBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSwgcXVlIGZvaSBzZXF1ZXN0cmFkYSBwZWxvIHNvbWJyaW8gU2VuaG9yIGRhcyBTb21icmFzLCBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIGluaWNpYWxtZW50ZSBoZXNpdGFudGUsIHNlIGxlbWJyYSBkYXMgaGlzdMOzcmlhcyBkb3MgYW50aWdvcyBoZXLDs2lzIHNhbXVyYWlzIHF1ZSBzYWx2YXJhbSBvIHJlaW5vIGUgZGVjaWRlIHF1ZSBhZ29yYSDDqSBzdWEgdmV6IGRlIHNlciBvIGhlcsOzaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiQW50ZXMgZGUgcGFydGlyIHBhcmEgc3VhIGpvcm5hZGEsIFl1a2ltdXJhIGFwcmVzZW50YSBhIEhpcm9zaGkgdW0gZGVzYWZpbyBkZSBsw7NnaWNhIHBhcmEgdGVzdGFyIHN1YSBhc3TDumNpYS4gWXVraW11cmEgYXByZXNlbnRhIGEgc2VndWludGUgZXhwcmVzc8OjbyBsw7NnaWNhIHBhcmEgSGlyb3NoaSBlIHBlZGUgcXVlIGVsZSBhIHBhcmVudGl6ZSBjb21wbGV0YW1lbnRlLCBzZWd1aW5kbyBhIG9yZGVtIGRvcyBwcmVkaWNhZG9zOjxicj48YnI+IEggPSBQIOKGkiBRIOKIpyBRIOKGkiBSIHYgwqxQXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvZGVzYWZpbzEud2VicFwiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9IChQIOKGkiAoUSDiiKcgKFEg4oaSIChSIOKIqCDCrFApKSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoUCDihpIgKFEg4oinIFEpKSDihpIgKFIg4oioIMKsUCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSCA9ICgoKFAg4oaSIFEpIOKIpyAoUSDihpIgUikpIOKIqCAowqxQKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCJIID0gKChQIOKGkiBRKSDiiKcgKChR4oaSUikg4oioIMKsUCkpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgXCJJZGVudGlmaXF1ZSBvcyBvcGVyYWRvcmVzIGzDs2dpY29zIGUgc3VhIHByZWNlZMOqbmNpYS48YnI+UmVzb2x2YSBhcyBvcGVyYcOnw7VlcyBkZSBkZW50cm8gcGFyYSBmb3JhLjxicj5Vc2UgYSBwcmVjZWTDqm5jaWEgZG9zIG9wZXJhZG9yZXMuXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBKb3JuYWRhIENvbWXDp2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBZdWtpbXVyYSBwYXJ0ZW0gZW0gYnVzY2EgZGEgUHJpbmNlc2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIGNhbWluaG8sIGVsZXMgZW5mcmVudGFtIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZSBlbmNvbnRyYW0gSGFuYSwgdW1hIMOhZ2lsIGt1bm9pY2hpIHByZXNhIGVtIHVtYSBhcm1hZGlsaGEuIEVsZXMgYSBsaWJlcnRhbSBlIGdhbmhhbSB1bWEgbm92YSBhbGlhZGEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkVtIHNlZ3VpZGEsIGVuY29udHJhbSBLZW5qaSwgdW0gc8OhYmlvIG1vbmdlLCBxdWUgdHJheiBpbmZvcm1hw6fDtWVzIHZhbGlvc2FzIHNvYnJlIGEgbG9jYWxpemHDp8OjbyBkZSBBa2VtaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBwcmVjaXNhIGF0cmF2ZXNzYXIgdW1hIHBvbnRlIGd1YXJkYWRhIHBvciBkb2lzIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMuIE8gZ3VlcnJlaXJvIMOgIGVzcXVlcmRhLCBSeW90YSwgc2VtcHJlIG1lbnRlLiBPIGd1ZXJyZWlybyDDoCBkaXJlaXRhLCBUYXJvLCBzZW1wcmUgZGl6IGEgdmVyZGFkZS4gRWxlcyBzw7MgcG9kZW0gZmF6ZXIgdW1hIHBlcmd1bnRhIGEgdW0gZG9zIGd1ZXJyZWlyb3MgcGFyYSBkZXNjb2JyaXIgbyBjYW1pbmhvIGNvcnJldG8uIDxicj48YnI+UXVhbCBwZXJndW50YSBIaXJvc2hpIGRldmUgZmF6ZXIgcGFyYSBkZXNjb2JyaXIgbyBjYW1pbmhvIGNvcnJldG8/XCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvZGVzYWZpbzIud2VicFwiLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJRdWFsIMOpIG8gY2FtaW5obyBzZWd1cm8/XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgZXUgcGVyZ3VudGFzc2UgYW8gb3V0cm8gZ3VlcnJlaXJvIHF1YWwgw6kgbyBjYW1pbmhvIHNlZ3VybywgcXVlIGNhbWluaG8gZWxlIGluZGljYXJpYT9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJPIGNhbWluaG8gw6AgZXNxdWVyZGEgw6kgc2VndXJvP1wiLFxuICAgICAgICAgICAgICAgICAgICBcIk8gY2FtaW5obyDDoCBkaXJlaXRhIMOpIHNlZ3Vybz9cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICBcIlBlcmd1bnRlIGEgdW0gZ3VlcnJlaXJvIG8gcXVlIG8gb3V0cm8gZGlyaWEuIERlcG9pcywgZXNjb2xoYSBvIGNhbWluaG8gb3Bvc3RvLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gQm9zcXVlIGRhcyBTb21icmFzXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZW50cmFtIGVtIHVtIGJvc3F1ZSBzb21icmlvIGNoZWlvIGRlIGFybWFkaWxoYXMgZSBkZXNhZmlvcy5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTyBhbWJpZW50ZSDDqSBlc2N1cm8sIGNvbSBjYW1pbmhvcyBxdWUgcGFyZWNlbSBtdWRhciBkZSBsdWdhci4gRWxlcyBlbmZyZW50YW0gb2JzdMOhY3Vsb3MgY29tbyBjYW1pbmhvcyBxdWUgZGVzYXBhcmVjZW0gZSDDoXJ2b3JlcyBxdWUgc2UgbW92ZW0uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkNvbnNpZGVyZSBhcyBzZWd1aW50ZXMgcHJvcG9zacOnw7VlczogPGJyPjxicj5QOiBIaXJvc2hpIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwuIDxicj5ROiBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgYXZhbsOnYW0gbm8gYm9zcXVlLiA8YnI+UjogVW1hIMOhcnZvcmUgc2UgbW92ZSBlIGJsb3F1ZWlhIG8gY2FtaW5oby4gPGJyPjxicj5Db20gYmFzZSBuYXMgcHJvcG9zacOnw7VlcyBmb3JuZWNpZGFzLCBhbmFsaXNlIGEgZsOzcm11bGEgbMOzZ2ljYTogPGJyPjxicj5IID0gKFAg4oaSIFEpIOKIpyAowqwgUCDihpIgUikgPGJyPjxicj5FIGRldGVybWluZSBxdWFsIGRhcyBhbHRlcm5hdGl2YXMgcmVwcmVzZW50YSBjb3JyZXRhbWVudGUgYSBmw7NybXVsYSBmb3JuZWNpZGEuXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvZGVzYWZpbzMud2VicFwiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZSwgZW50w6NvIHVtYSDDoXJ2b3JlIHNlIG1vdmUgZSBibG9xdWVpYSBvIGNhbWluaG8sIGUgc2UgSGlyb3NoaSBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlbnTDo28gYSDDoXJ2b3JlIG7Do28gc2UgbW92ZS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJTZSBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgYXZhbsOnYW0gbm8gYm9zcXVlLCBlbnTDo28gZWxlcyBlbmNvbnRyYW0gdW0gY2FtaW5obyBlc3TDoXZlbCwgZSBzZSB1bWEgw6Fydm9yZSBibG9xdWVpYSBvIGNhbWluaG8sIGVudMOjbyBIaXJvc2hpIG7Do28gZW5jb250cm91IHVtIGNhbWluaG8gZXN0w6F2ZWwuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiU2UgSGlyb3NoaSBuw6NvIGVuY29udHJhIHVtIGNhbWluaG8gZXN0w6F2ZWwsIGVudMOjbyBlbGUgZSBzZXVzIGFtaWdvcyBuw6NvIGF2YW7Dp2FtIG5vIGJvc3F1ZSwgbWFzIHVtYSDDoXJ2b3JlIHNlbXByZSBzZSBtb3ZlIGluZGVwZW5kZW50ZW1lbnRlLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIlNlIEhpcm9zaGkgZW5jb250cmEgdW0gY2FtaW5obyBlc3TDoXZlbCwgZW50w6NvIGVsZSBlIHNldXMgYW1pZ29zIGF2YW7Dp2FtIG5vIGJvc3F1ZSwgbWFzIHNlIEhpcm9zaGkgbsOjbyBlbmNvbnRyYSB1bSBjYW1pbmhvIGVzdMOhdmVsLCBlbnTDo28gdW1hIMOhcnZvcmUgc2UgbW92ZSBlIGJsb3F1ZWlhIG8gY2FtaW5oby5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMyxcbiAgICAgICAgICAgICAgICBcIlBhcmEgcmVzb2x2ZXIgZXN0YSBxdWVzdMOjbywgdmVyaWZpcXVlIHNlIGNhZGEgcGFydGUgZGEgZsOzcm11bGEgbMOzZ2ljYSBIPShQ4oaSUSniiKcowqxQ4oaSUikgZXN0w6EgY29ycmV0YW1lbnRlIHJlcHJlc2VudGFkYSBuYXMgYWx0ZXJuYXRpdmFzLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRW5jb250cm8gY29tIERhaWNoaVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY29yYcOnw6NvIGRvIGJvc3F1ZSwgSGlyb3NoaSBlbmNvbnRyYSBEYWljaGksIG8gdmlsw6NvLCBzZW50YWRvIGVtIHVtIHRyb25vIGZlaXRvIGRlIG9zc29zIGUgcGVkcmFzLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJEYWljaGkgcmV2ZWxhIHF1ZSBjYXB0dXJvdSBBa2VtaSBwYXJhIGF0cmFpciBvIHZlcmRhZGVpcm8gaGVyw7NpLCBtYXMgZXN0w6Egc3VycHJlc28gYW8gdmVyIEhpcm9zaGkuIEVsZSBzdWJlc3RpbWEgSGlyb3NoaSBlIG8gZGVzYWZpYSBhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDExXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVzY2FwYW0gZG8gYm9zcXVlIGFww7NzIHJlc29sdmVyIG8gZW5pZ21hIGRlIERhaWNoaS4gTm8gZW50YW50bywgRGFpY2hpLCBmdXJpb3NvLCBvcyBwZXJzZWd1ZS4gRWxlcyBlbmNvbnRyYW0gdW0gdG9yaWkgbcOhZ2ljbyBxdWUgcG9kZSBsZXbDoS1sb3MgcGFyYSBmb3JhIGRvIGJvc3F1ZSwgbWFzIHByZWNpc2FtIGF0aXbDoS1sby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkRhaWNoaSBwcm9ww7VlIG8gc2VndWludGUgZGVzYWZpbyBsw7NnaWNvIHBhcmEgSGlyb3NoaTo8YnI+PGJyPlNlIHZvY8OqIMOpIHJlYWxtZW50ZSBvIGhlcsOzaSwgZW50w6NvIHZvY8OqIGNvbnNlZ3VpcsOhIHJlc29sdmVyIGVzdGUgZW5pZ21hLiBTZSB2b2PDqiByZXNvbHZlciBvIGVuaWdtYSwgZW50w6NvIHZvY8OqIGUgc2V1cyBhbWlnb3MgcG9kZXLDo28gZXNjYXBhci4gU2Ugdm9jw6ogbsOjbyByZXNvbHZlciBvIGVuaWdtYSwgdm9jw6pzIHNlIHRvcm5hcsOjbyBtZXVzIHNlcnZvcy4gPGJyPjxicj5Db20gYmFzZSBuYXMgcHJvcG9zacOnw7VlcyBmb3JuZWNpZGFzOiA8YnI+PGJyPlAgPSDDiSBoZXLDs2k8YnI+USA9IFJlc29sdmVyIGVuaWdtYTxicj5SID0gQW1pZ29zIGVzY2FwYXI8YnI+UyA9IFRvcm5hcsOjbyBtZXVzIHNlcnZvcyA8YnI+PGJyPkRldGVybWluZSBxdWFsIGRhcyBhbHRlcm5hdGl2YXMgcmVwcmVzZW50YSBjb3JyZXRhbWVudGUgYSBmw7NybXVsYSBsw7NnaWNhIHByb3Bvc3RhIHBvciBEYWljaGkuXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIigoUOKGklEp4oinKFHihpJSKeKIpyjCrFHihpJTKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoKFDihpJRKeKIpyhR4oaSUiniiKcowqxR4oaSwqxTKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoKFDihpJRKeKIpyhR4oaSUyniiKcowqxR4oaSUikpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgXCJJZGVudGlmaXF1ZSBjYWRhIHByb3Bvc2nDp8OjbyBjb25kaWNpb25hbCBuYSBmYWxhIGRvIHBlcnNvbmFnZW0uPGJyPlRyYWR1emEgY2FkYSBwYXJ0ZSBkYSBzZW50ZW7Dp2EgcGFyYSB1bWEgZXhwcmVzc8OjbyBsw7NnaWNhLjxicj5WZXJpZmlxdWUgc2UgYSBleHByZXNzw6NvIGzDs2dpY2Egc2VsZWNpb25hZGEgY29ycmVzcG9uZGUgZXhhdGFtZW50ZSDDoHMgY29uZGnDp8O1ZXMgZm9ybmVjaWRhcyBuYSBxdWVzdMOjby5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEZ1Z2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS81XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJQYXJhIGF0aXZhciBvIHRvcmlpIG3DoWdpY28sIEhpcm9zaGkgcHJlY2lzYSByZXNvbHZlciBhIHNlZ3VpbnRlIGRlc2FmaW86PGJyPjxicj5TZSBhdGl2YXJtb3MgbyB0b3JpaSBtw6FnaWNvLCBlbnTDo28gZXNjYXBhcmVtb3MgZG8gYm9zcXVlLiBTZSBEYWljaGkgbm9zIGFsY2Fuw6dhciwgZW50w6NvIHNlcmVtb3MgY2FwdHVyYWRvcy4gU2UgbsOjbyBmb3Jtb3MgY2FwdHVyYWRvcywgZW50w6NvIGVzY2FwYXJlbW9zLiBTZSBuw6NvIGF0aXZhcm1vcyBvIHRvcmlpIG3DoWdpY28sIGVudMOjbyBzZXJlbW9zIGNhcHR1cmFkb3Mgb3UgRGFpY2hpIG5vcyBhbGNhbsOnYXLDoS4gPGJyPjxicj5Db20gYmFzZSBuYXMgcHJvcG9zacOnw7VlcyBmb3JuZWNpZGFzOiA8YnI+PGJyPlA6IEF0aXZhbW9zIG8gdG9yaWkgbcOhZ2ljby4gPGJyPlE6IEVzY2FwYW1vcyBkbyBib3NxdWUuIDxicj5SOiBEYWljaGkgbm9zIGFsY2Fuw6dhLiA8YnI+UzogU2VyZW1vcyBjYXB0dXJhZG9zLiA8YnI+PGJyPiBEZXRlcm1pbmUgcXVhbCBkYXMgYWx0ZXJuYXRpdmFzIHJlcHJlc2VudGEgY29ycmV0YW1lbnRlIGEgZsOzcm11bGEgbMOzZ2ljYSBwcm9wb3N0YSBwb3IgRGFpY2hpLlwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy81L2Rlc2FmaW81LndlYnBcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIihQ4oaSUSniiKcoUuKGklMp4oinKMKsU+KGklEp4oinKMKsUOKGkihT4oioUilcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpLCrFMp4oinKMKsU+KGksKsUSniiKcowqxQ4oaSKFPiiKhSKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCIoUOKGklEp4oinKFLihpLCrFMp4oinKFPihpJRKeKIpyjCrFDihpLCrFMpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgXCJJZGVudGlmaXF1ZSBjYWRhIHByb3Bvc2nDp8OjbyBjb25kaWNpb25hbCBuYXMgaW5zdHJ1w6fDtWVzIGRhZGFzLjxicj5DZXJ0aWZpcXVlLXNlIGRlIHF1ZSBhIGV4cHJlc3PDo28gbMOzZ2ljYSBzZWxlY2lvbmFkYSByZXByZXNlbnRhIGNvcnJldGFtZW50ZSBjYWRhIHVtYSBkYXMgY29uZGnDp8O1ZXMgZGVzY3JpdGFzLjxicj5Db21wYXJlIGNhZGEgYWx0ZXJuYXRpdmEgY29tIGFzIGNvbmRpw6fDtWVzIG9idGlkYXMgcGFyYSBkZXRlcm1pbmFyIGEgY29ycmV0YS5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBWaWxhcmVqbyBTZW0gVmlkYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIGNvbXBhbmhpYSBlbWVyZ2VtIGRvIHRvcmlpIG3DoWdpY28gZSBjaGVnYW0gYW8gUmVpbm8gZGFzIFNvbWJyYXMsIG9uZGUgYXMgY29pc2FzIG7Do28gcG9zc3VlbSB2aWRhIG5lbSBjb3IuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHPDo28gcmVjZWJpZG9zIHBvciBBeWFtZSwgdW1hIHNhY2VyZG90aXNhIGUgbWVzdHJhIGRhIGNhbGlncmFmaWEgZSBkYSBwaW50dXJhIG3DoWdpY2EsIHF1ZSB0cmF6IHZpZGEgw6BzIGNvaXNhcyBjb20gc3VhIGFydGUuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBleHBsaWNhIHF1ZSBwYXJhIGF2YW7Dp2FyLCBlbGVzIHByZWNpc2FtIHJlc3RhdXJhciBhIHZpZGEgZGUgdsOhcmlhcyDDoXJlYXMgcXVlIGZvcmFtIGRlc2JvdGFkYXMgcGVsb3MgY2FwYW5nYXMgZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIGA8cD5Db25zaWRlcmUgYSBjZW5hIGVtIHF1ZSBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EgZGUgcHJlZGljYWRvcyBwYXJhIGF2YW7Dp2FyIG5vIFZpbGFyZWpvIFNlbSBWaWRhLjwvcD4gXG4gICAgICAgICAgICAgICAgPHA+XCJTZSB1bWEgw6FyZWEgZXN0w6EgZGVzYm90YWRhIHBlbG9zIGNhcGFuZ2FzIGRlIERhaWNoaSBlIHJlc3RhdXJhbW9zIGEgdmlkYSBkZXNzYSDDoXJlYSwgZW50w6NvIGF2YW7Dp2FyZW1vcy5cIjwvcD4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJpdGVtLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICA8bGk+cCh4KTogXCLDgXJlYSB4IGVzdMOhIGRlc2JvdGFkYSBwZWxvcyBjYXBhbmdhcyBkZSBEYWljaGlcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnEoeCk6IFwiUmVzdGF1cmFtb3MgYSB2aWRhIGRhIMOhcmVhIHhcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnI6IFwiUG9kZW1vcyBhdmFuw6dhclwiPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxwPlF1YWwgZGFzIHNlZ3VpbnRlcyBvcMOnw7VlcyBjb3JyZXRhbWVudGUgcmVwcmVzZW50YSBhIHByb3Bvc2nDp8OjbyBxdWUgZGVzY3JldmUgYSBuZWNlc3NpZGFkZSBkZSByZXN0YXVyYXIgYSB2aWRhIGRhcyDDoXJlYXMgcGFyYSBhdmFuw6dhcj88cD5gLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCLiiIB4IChwKHgpIOKGkiBxKHgpIOKGknIpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeCAocCh4KSDihpIgcSh4KSkg4oaSclwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3ggKChwKHgpIOKIpyBxKHgpKSDihpJyKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3ggKHAoeCkg4oaSIHEoeCkg4oaScilcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICBcIlByZXN0ZSBhdGVuw6fDo28gw6AgZXN0cnV0dXJhIGRhIGltcGxpY2HDp8OjbyBsw7NnaWNhOiBpZGVudGlmaXF1ZSBhIHJlbGHDp8OjbyBlbnRyZSBhcyDDoXJlYXMgZGVzYm90YWRhcyBlIGEgbmVjZXNzaWRhZGUgZGUgcmVzdGF1csOhLWxhcyBwYXJhIHBvZGVyIGF2YW7Dp2FyLiBBIGZvcm11bGHDp8OjbyBjb3JyZXRhIGRldmUgcmVmbGV0aXIgcXVlLCBwYXJhIHRvZGFzIGFzIMOhcmVhcywgYSByZXN0YXVyYcOnw6NvIMOpIG5lY2Vzc8OhcmlhIHBhcmEgYXZhbsOnYXIuXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBEYW7Dp2EgZG9zIEd1ZXJyZWlyb3MgZGFzIFNvbWJyYXNcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbSBhIHByaW1laXJhIMOhcmVhIHJlc3RhdXJhZGEsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjb250aW51YW0gc3VhIGpvcm5hZGEgZW0gYnVzY2EgZGEgcHJpbmNlc2EgZSBzZSBkZXBhcmFtIGNvbSB1bSBncnVwbyBkZSBndWVycmVpcm9zIGRhcyBzb21icmFzIGVtIHVtIHDDoXRpbyBzb21icmlvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gYWRlbnRyYXIgYSDDoXJlYSwgSGlyb3NoaSBkZXNjb2JyZSBxdWUgYSBkYW7Dp2Egcml0dWFsw61zdGljYSBkb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBwb2RlIGRlc2Jsb3F1ZWFyIHBhc3NhZ2VucyBzZWNyZXRhcyBxdWUgRGFpY2hpIHRyYW5jb3UuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgYDxwPkNvbnNpZGVyZSBhIGNlbmEgZW0gcXVlIEhpcm9zaGkgcHJlY2lzYSByZXNvbHZlciB1bSBlbmlnbWEgZGUgbMOzZ2ljYSBkZSBwcmVkaWNhZG9zIHBhcmEgZGVzYmxvcXVlYXIgcGFzc2FnZW5zIHNlY3JldGFzIG5vIFJlaW5vIGRhcyBTb21icmFzPC9wPiBcbiAgICAgICAgICAgICAgICA8cD5cIlNlIG9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZmF6ZW0gYSBkYW7Dp2Egcml0dWFsw61zdGljYSBlIGV4aXN0ZSB1bWEgcGFzc2FnZW0gdHJhbmNhZGEgcG9yIERhaWNoaSwgZW50w6NvIGVzc2EgcGFzc2FnZW0gc2Vyw6EgZGVzYmxvcXVlYWRhLlwiPC9wPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cIml0ZW0tbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgIDxsaT5wOiBcIk9zIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZmF6ZW0gYSBkYW7Dp2Egcml0dWFsw61zdGljYVwiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+cSh4KTogXCJQYXNzYWdlbSB4IGVzdMOhIHRyYW5jYWRhIHBvciBEYWljaGlcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnIoeCk6IFwiUGFzc2FnZW0geCBlc3TDoSBkZXNibG9xdWVhZGFcIjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cD5RdWFsIGRhcyBzZWd1aW50ZXMgb3DDp8O1ZXMgY29ycmV0YW1lbnRlIHJlcHJlc2VudGEgYSBwcm9wb3Npw6fDo28gcXVlIGRlc2NyZXZlIGEgcmVsYcOnw6NvIGVudHJlIGEgZGFuw6dhIGRvcyBndWVycmVpcm9zIGRhcyBzb21icmFzIGUgYXMgcGFzc2FnZW5zIHNlY3JldGFzPzxwPmAsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIihwIOKIpyAoKOKIg3gpIHEoeCkpIOKGkiAo4oiDeCkgcih4KSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIB4IChwIOKGkiBxKHgpIOKGkiByKHgpKVwiLFxuICAgICAgICAgICAgICAgICAgICBcIuKIg3ggKHAg4oaScSAoeCkg4oaSIHIoeCkpIOKGkiAo4oiAeCkgcih4KSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwIOKGkiDiiIN4KCBxKHgpIOKGkiByKHgpKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIFwiRm9xdWUgbmEgcmVsYcOnw6NvIGRlIGNhdXNhIGUgZWZlaXRvOiBhIGRhbsOnYSByaXR1YWzDrXN0aWNhIGRldmUgc2VyIGEgY2F1c2EgcXVlIGxldmEgYW8gZGVzYmxvcXVlaW8gZGFzIHBhc3NhZ2VucyB0cmFuY2FkYXMgcG9yIERhaWNoaS4gQSBmb3JtdWxhw6fDo28gY29ycmV0YSBkZXZlIHJlZmxldGlyIHF1ZSBhIGRhbsOnYSByZXN1bHRhIG5vIGRlc2Jsb3F1ZWlvIGRlIHRvZGFzIGFzIHBhc3NhZ2VucyB0cmFuY2FkYXMuMlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRmVzdGl2YWwgZG9zIFDDoXNzYXJvcyBkZSBQYXBlbFwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gcGFzc2FyIHBvciB1bWEgcGFzc2FnZW0gc2VjcmV0YSBkZXNibG9xdWVhZGEgcGVsb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhIHVtYSBjaWRhZGUgb25kZSBlc3TDoSBhY29udGVjZW5kbyB1bSBmZXN0aXZhbCBkZSBww6Fzc2Fyb3MgZGUgcGFwZWwgKG9yaWdhbWkpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBkZXNjb2JyZW0gcXVlIERhaWNoaSBlc2NvbmRldSBjaGF2ZXMgbm9zIHDDoXNzYXJvcyBkZSBwYXBlbCBwYXJhIHRyYW5jYXIgb3V0cmFzIMOhcmVhcyBkbyBzZXUgUmVpbm8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgYDxwPkNvbnNpZGVyZSBhIGNlbmEgZW0gcXVlIEhpcm9zaGkgcHJlY2lzYSByZXNvbHZlciB1bSBlbmlnbWEgZGUgbMOzZ2ljYSBkZSBwcmVkaWNhZG9zIHBhcmEgZW5jb250cmFyIGNoYXZlcyBubyBGZXN0aXZhbCBkb3MgUMOhc3Nhcm9zIGRlIFBhcGVsPC9wPiBcbiAgICAgICAgICAgICAgICA8cD5cIlBhcmEgdG9kbyBww6Fzc2FybyBkZSBwYXBlbCBxdWUgY29udMOpbSB1bWEgY2hhdmUuIEVzc2EgY2hhdmUgdHJhbmNhIG91IG7Do28gdHJhbmNhIHVtYSDDoXJlYSBkbyBSZWlubywgZW50w6NvIHNlcsOhIHBvc3PDrXZlbCBhYnJpciBhIMOhcmVhLlwiPC9wPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cIml0ZW0tbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgIDxsaT5wKHgpOiBcIlDDoXNzYXJvIGRlIHBhcGVsIHggY29udMOpbSB1bWEgY2hhdmVcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnEoeCkpOiBcIkNoYXZlIHggdHJhbmNhIHVtYSDDoXJlYSBkbyBSZWlub1wiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+wqxxKHgpKTogXCJDaGF2ZSB4IG7Do28gdHJhbmNhIHVtYSDDoXJlYSBkbyBSZWlub1wiPC9saT5cbiAgICAgICAgICAgICAgICAgICA8bGk+cih4KTogXCLDgXJlYSB4IHNlcsOhIGFiZXJ0YVwiPC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxwPlF1YWwgZGFzIHNlZ3VpbnRlcyBvcMOnw7VlcyBjb3JyZXRhbWVudGUgcmVwcmVzZW50YSBhIHByb3Bvc2nDp8OjbyBxdWUgZGVzY3JldmUgYSByZWxhw6fDo28gZW50cmUgb3MgcMOhc3Nhcm9zIGRlIHBhcGVsIGUgYXMgw6FyZWFzIHRyYW5jYWRhcz88cD5gLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzhfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCLiiIN4IChwKHgpIOKGkiAocSh4KSDiiKggwqxxKHgpKSDihpIgcih4KSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIN4IChwKHgpIOKGkiDiiIB5IChxKHkgKeKGkiByKHkpKSlcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIB4IChwKHgpIOKGkiAoKHEoeCkg4oioIMKscSh4KSkg4oaSIHIoeCkpKSBcIixcbiAgICAgICAgICAgICAgICAgICAgXCLiiIB4IChwKHgpIOKGkiAocSh4KSDiiKggcSh4KSkg4oaSIHIoeCkpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgXCJPYnNlcnZlIGEgcmVsYcOnw6NvIGRpcmV0YSBlbnRyZSBhcyBjaGF2ZXMgbm9zIHDDoXNzYXJvcyBkZSBwYXBlbCBlIGFzIMOhcmVhcyB0cmFuY2FkYXMuIEEgZm9ybXVsYcOnw6NvIGNvcnJldGEgZGV2ZSByZWZsZXRpciBxdWUsIHBhcmEgdG9kb3Mgb3MgcMOhc3Nhcm9zIGRlIHBhcGVsIHF1ZSBjb250w6ltIHVtYSBjaGF2ZSwgZXNzYSBjaGF2ZSDDqSByZXNwb25zw6F2ZWwgcG9yIHRyYW5jYXIgb3UgZGVzdHJhbmNhciB1bWEgw6FyZWEgZXNwZWPDrWZpY2EgZG8gUmVpbm8uXCIsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBSZXNnYXRlIGRhIFByaW5jZXNhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gdG9kYXMgYXMgw6FyZWFzIHJlc3RhdXJhZGFzIGUgY2hhdmVzIGVuY29udHJhZGFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGFvIGNhc3RlbG8gZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQWtlbWkgZXN0w6EgcHJlc2EgZW0gdW1hIGNlbGEgZ2lnYW50ZSBkZW50cm8gZG8gY2FzdGVsbywgY2VyY2FkbyBwb3IgZm9nby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIGA8cD5Db25zaWRlcmUgYSBjZW5hIGVtIHF1ZSBIaXJvc2hpIHByZWNpc2EgcmVzb2x2ZXIgdW0gZW5pZ21hIGRlIGzDs2dpY2EgZGUgcHJlZGljYWRvcyBwYXJhIHNhbHZhciBhIFByaW5jZXNhIEFrZW1pLiBBIHNlZ3VpciwgZXN0w6EgdW1hIHRlbnRhdGl2YSBkZSBmb3JtYWxpemFyIGEgc2l0dWHDp8OjbyB1c2FuZG8gbMOzZ2ljYSBkZSBwcmVkaWNhZG9zLiA8L3A+IFxuICAgICAgICAgICAgICAgIDxwPlwiU2UgQWtlbWkgZXN0w6Egbm8gY2FzdGVsbyBlIG8gY2FzdGVsbyBlc3TDoSBjZXJjYWRvIHBvciBmb2dvLCBlbnTDo28gcHJlY2lzYW1vcyBhdGl2YXIgdW1hIHBvbnRlIGludmlzw612ZWwsIHF1ZSBzw7MgYXBhcmVjZSBxdWFuZG8gdG9kYXMgYXMgw6FyZWFzIGRvIHJlaW5vIGVzdMOjbyByZXN0YXVyYWRhcy5cIjwvcD4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJpdGVtLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICA8bGk+cCh4KTogXCJBa2VtaSBlc3TDoSBubyBjYXN0ZWxvXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5xKHgpOiBcIk8gY2FzdGVsbyBlc3TDoSBjZXJjYWRvIHBvciBmb2dvXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT5yKHgpOiBcIlByZWNpc2Ftb3MgYXRyYXZlc3NhciBvIGZvZ29cIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnMoeCk6IFwiQXRpdmFtb3MgYSBwb250ZSBpbnZpc8OtdmVsXCI8L2xpPlxuICAgICAgICAgICAgICAgICAgIDxsaT50KHgpOiBcIlRvZGFzIGFzIMOhcmVhcyBkbyByZWlubyBlc3TDo28gcmVzdGF1cmFkYXNcIjwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8cD5RdWFsIGRhcyBzZWd1aW50ZXMgb3DDp8O1ZXMgY29ycmV0YW1lbnRlIHJlcHJlc2VudGEgYSBwcm9wb3Npw6fDo28gcXVlIGRlc2NyZXZlIGEgbmVjZXNzaWRhZGUgZGUgYXRpdmFyIHVtYSBwb250ZSBpbnZpc8OtdmVsIHBhcmEgYXRyYXZlc3NhciBvIGZvZ28gZSBzYWx2YXIgQWtlbWk/PHA+YCxcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeChwKHgp4oaSKHEoeCniiKdyKHgp4oaScyh4KSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeChxKHgp4oincih4KeKGkih0KHgp4oaScyh4KSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeChwKHgp4oinKHEoeCniiKdyKHgp4oaScyh4KSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeChwKHgp4oincSh4KeKIp3IoeCnihpJzKHgpKVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIFwiRm9xdWUgbmEgZXN0cnV0dXJhIGRhIGltcGxpY2HDp8OjbyBsw7NnaWNhOiBpZGVudGlmaXF1ZSBhcyBjb25kacOnw7VlcyBuZWNlc3PDoXJpYXMgKG8gY2FzdGVsbyBjZXJjYWRvIHBvciBmb2dvIGUgYSBuZWNlc3NpZGFkZSBkZSBhdHJhdmVzc2FyIG8gZm9nbykgZSBhIGNvbmRpw6fDo28gYWRpY2lvbmFsICh0b2RhcyBhcyDDoXJlYXMgZG8gcmVpbm8gcmVzdGF1cmFkYXMpIHF1ZSBsZXZhIMOgIGNvbmNsdXPDo28gKGF0aXZhw6fDo28gZGEgcG9udGUgaW52aXPDrXZlbCkuIEEgb3DDp8OjbyBjb3JyZXRhIGRldmUgcmVmbGV0aXIgcXVlIGEgYXRpdmHDp8OjbyBkYSBwb250ZSBkZXBlbmRlIGRhIHJlc3RhdXJhw6fDo28gZG8gcmVpbm8gYXDDs3Mgc2F0aXNmYXplciBhcyBjb25kacOnw7VlcyBpbmljaWFpcy5cIixcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIENlbGVicmHDp8Ojb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXDDs3Mgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWkgZSBkZXJyb3RhciBEYWljaGksIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyByZXRvcm5hbSBhbyBSZWlubyBkYSBMdXogcGFyYSB1bWEgZ3JhbmRlIGNlbGVicmHDp8Ojby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgb3JnYW5pemEgdW1hIGZlc3RhIHBhcmEgb3MgaGVyw7NpcyBjb21lbW9yYXJlbSBhIHZpdMOzcmlhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBgPHA+Q29uc2lkZXJlIGEgY2VuYSBlbSBxdWUgSGlyb3NoaSBwcmVjaXNhIHJlc29sdmVyIHVtIMO6bHRpbW8gZGVzYWZpbyBkZSBsw7NnaWNhIGRlIHByZWRpY2Fkb3MgZHVyYW50ZSBhIGNlbGVicmHDp8OjbyBwYXJhIGFicmlyIG8gYmHDuiBkbyB0ZXNvdXJvLiBBIHNlZ3VpciwgZXN0w6EgdW1hIHRlbnRhdGl2YSBkZSBmb3JtYWxpemFyIGEgc2l0dWHDp8OjbyB1c2FuZG8gbMOzZ2ljYSBkZSBwcmVkaWNhZG9zLjwvcD4gXG4gICAgICAgICAgICAgICAgPHA+XCJTZSBhIGNoYXZlIGVzdMOhIG5hIGNhaXhhIHZlcm1lbGhhIG91IG5hIGNhaXhhIGF6dWwsIGUgYSBjYWl4YSB2ZXJtZWxoYSBlc3TDoSB0cmFuY2FkYSwgZW50w6NvIGEgY2hhdmUgZXN0w6EgbmEgY2FpeGEgYXp1bC5cIjwvcD4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJpdGVtLWxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICA8bGk+cCh4KXAoeClwKHgpOiBcIkEgY2hhdmUgZXN0w6EgbmEgY2FpeGEgdmVybWVsaGFcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnEoeClxKHgpcSh4KTogXCJBIGNoYXZlIGVzdMOhIG5hIGNhaXhhIGF6dWxcIjwvbGk+XG4gICAgICAgICAgICAgICAgICAgPGxpPnIoeClyKHgpcih4KTogXCJBIGNhaXhhIHZlcm1lbGhhIGVzdMOhIHRyYW5jYWRhXCI8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPHA+UXVhbCBkYXMgc2VndWludGVzIG9ww6fDtWVzIGNvcnJldGFtZW50ZSByZXByZXNlbnRhIGEgcHJvcG9zacOnw6NvIHF1ZSBkZXNjcmV2ZSBhIG5lY2Vzc2lkYWRlIGRlIGF0aXZhciB1bWEgcG9udGUgaW52aXPDrXZlbCBwYXJhIGF0cmF2ZXNzYXIgbyBmb2dvIGUgc2FsdmFyIEFrZW1pPzxwPmAsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeChyKHgpIOKGkiAocCh4KSDiiKggcSh4KSDihpIgcSh4KSkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeChyKHgpIOKIpyAocCh4KSDiiKggcSh4KSkg4oaSIHEoeCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiAeCgocCh4KSDiiKggcSh4KSkg4oinIHIoeCkg4oaSIHEoeCkpXCIsXG4gICAgICAgICAgICAgICAgICAgIFwi4oiDeCgocCh4KSDiiKggcSh4KSkg4oinIHIoeCkg4oaSIMKscCh4KeKIp3EoeCkpXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgXCJQcmVzdGUgYXRlbsOnw6NvIGFvcyBxdWFudGlmaWNhZG9yZXM6IOKIgHggaW5kaWNhIHF1ZSBhIHByb3Bvc2nDp8OjbyDDqSB2w6FsaWRhIHBhcmEgdG9kYXMgYXMgc2l0dWHDp8O1ZXMgcG9zc8OtdmVpcywgZW5xdWFudG8g4oiDeCBpbmRpY2EgcXVlIGEgcHJvcG9zacOnw6NvIMOpIHbDoWxpZGEgcGFyYSBwZWxvIG1lbm9zIHVtYSBzaXR1YcOnw6NvIGVzcGVjw61maWNhLiBBIGZvcm11bGHDp8OjbyBjb3JyZXRhIGRldmUgdXNhciBvIHF1YW50aWZpY2Fkb3IgdW5pdmVyc2FsIHBhcmEgcmVmbGV0aXIgcXVlIGEgZGVkdcOnw6NvIMOpIHbDoWxpZGEgZW0gdG9kb3Mgb3MgY2Fzb3Mgb25kZSBhcyBjb25kacOnw7VlcyBzw6NvIHNhdGlzZmVpdGFzLlwiLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgXSksXG5dO1xuXG5cbnN0YXJ0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgc3RhcnRTY3JlZW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGFwcEVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgbGlmZUVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc2NvcmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgY29uc3Qgc3RvcnkgPSBuZXcgU3RvcnkoXCJBIEF2ZW50dXJhIGRlIEhpcm9zaGkgbm8gUmVpbm8gZGFzIFNvbWJyYXNcIiwgY2hhcHRlcnMpO1xuICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZVBsYXkoc3RvcnksIGFwcEVsLCBzY29yZVBhbmVsRWwsIHNjb3JlRWwsIGxpZmVFbCwgXCJub3JtYWxcIik7XG4gICAgZ2FtZS5nYW1lTG9vcCgpO1xufSk7XG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFFBQVEsQ0FBQztJQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsUUFBUSxFQUFFO1FBQ3JGLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsZUFBZSxDQUFDO0tBQ3pFOztJQUVELE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUN2QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLEFBSUEsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2hEO1NBQ0o7UUFD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
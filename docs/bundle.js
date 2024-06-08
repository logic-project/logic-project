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
    
                const subsceneDuration = this.mode === 'fast' ? 1000 : subscene.duration * 1000;
    
                setTimeout(() => {
                    resolve();
                }, subsceneDuration);
            };
            img.onerror = () => {
                console.error('Failed to load image:', subscene.image);
                resolve();  // Resolve the promise even if the image fails to load
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
                    this.score++;
                    this.updateScoreDisplay();
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

    updateScoreDisplay() {
        this.scoreElement.innerHTML = `Pontos: ${this.score}`;
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
 }

class Challenge {
    constructor(question, image, alternatives, correctAnswer, callback) {
        this.question = question;
        this.image = image;
        this.alternatives = alternatives;
        this.correctAnswer = correctAnswer;
        this.callback = callback;
    }
    
    // display() {
    //    return `
    //     <div class="challenge">
    //         <h2 class="challenge__title">${this.question}</h2>
    //         <img class="challenge__img"  src="${this.image}" />
    //         <ul>
    //             ${this.alternatives.map((alternative, index) => {
    //                 return `
    //                 <li>
    //                     <input type="radio" id="alternative${index}" name="alternative" value="${index}">
    //                     <label for="alternative${index}">${alternative}</label>
    //                 </li>
    //                 `
    //             }).join('')}
    //         </ul>
    //         <button onclick="${this.callback}()">Submit</button>
    //     </div>
    //     `
    // }

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
    const game = new GamePlay(story, appEl, scoreEl, lifeEl, "normal");
    game.gameLoop();
});

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIHNjb3JlRWxlbWVudCwgbGlmZUVsZW1lbnQsIG1vZGUgPSAnbm9ybWFsJykge1xuICAgICAgICB0aGlzLnN0b3J5ID0gc3Rvcnk7XG4gICAgICAgIHRoaXMuYXBwRWxlbWVudCA9IGFwcEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2NvcmVFbGVtZW50ID0gc2NvcmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIH1cblxuICAgIGFzeW5jIGdhbWVMb29wKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XG4gICAgICAgIGZvciAoY29uc3QgY2hhcHRlciBvZiB0aGlzLnN0b3J5LmNoYXB0ZXJzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNjZW5lIG9mIGNoYXB0ZXIuc2NlbmVzKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY2VuZSBvZiBzY2VuZS5zdWJzY2VuZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5U3Vic2NlbmUoc2NlbmUsIHN1YnNjZW5lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlDaGFsbGVuZ2Uoc2NlbmUuY2hhbGxlbmdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgZGlzcGxheVN1YnNjZW5lKHNjZW5lLCBzdWJzY2VuZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY2VuZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmUnKTtcbiAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmlubmVySFRNTCA9IGA8aDEgY2xhc3M9XCJzdWJzY2VuZV9fdGl0bGVcIj4ke3NjZW5lLnRpdGxlfTwvaDE+YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWcuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX2ltZycpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHN1YnNjZW5lLmltYWdlO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9fdGV4dCcpO1xuICAgICAgICAgICAgICAgIHN1YnNjZW5lQ29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dENvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5hcHBlbmRDaGlsZChzdWJzY2VuZUNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDEwMDAgOiBzdWJzY2VuZS5kdXJhdGlvbiAqIDEwMDA7XG4gICAgXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCBzdWJzY2VuZUR1cmF0aW9uKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZTonLCBzdWJzY2VuZS5pbWFnZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpOyAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBldmVuIGlmIHRoZSBpbWFnZSBmYWlscyB0byBsb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG5cbiAgICBkaXNwbGF5Q2hhbGxlbmdlKGNoYWxsZW5nZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gY2hhbGxlbmdlLmRpc3BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHlwZVdyaXRlcih0ZXh0LCBlbGVtZW50LCBzcGVlZCA9IDQwKSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZnVuY3Rpb24gdHlwZSgpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MICs9IHRleHQuY2hhckF0KGkpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0eXBlLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSgpO1xuICAgIH1cblxuXG4gICAgZGlzcGxheUNoYWxsZW5nZShjaGFsbGVuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IGNoYWxsZW5nZS5kaXNwbGF5KCk7XG4gICAgICAgICAgICB0aGlzLmFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENoYWxsZW5nZUV2ZW50TGlzdGVuZXJzKGNoYWxsZW5nZSwgcmVzb2x2ZSkge1xuICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNoYWxsZW5nZSBidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiYWx0ZXJuYXRpdmVcIl06Y2hlY2tlZCcpO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5zd2VyID0gc2VsZWN0ZWRPcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuc3dlciA9PSBjaGFsbGVuZ2UuY29ycmVjdEFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgICBjaGFsbGVuZ2UuY2FsbGJhY2soY2hhbGxlbmdlLnF1ZXN0aW9uLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3JlKys7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2NvcmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaWZlRGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5saWZlRWxlbWVudC5pbm5lckhUTUwgPSBgVmlkYXM6ICR7dGhpcy5saWZlfWA7XG4gICAgfVxuXG4gICAgdXBkYXRlU2NvcmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLnNjb3JlRWxlbWVudC5pbm5lckhUTUwgPSBgUG9udG9zOiAke3RoaXMuc2NvcmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IFwiPGgxPlZvY8OqIHBlcmRldTwvaDE+XCI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY2hhcHRlcnMpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLmNoYXB0ZXJzID0gY2hhcHRlcnM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDaGFwdGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZXMpIHtcbiAgICAgICAgdGhpcy5zY2VuZXMgPSBzY2VuZXM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIHN1YnNjZW5lcywgY2hhbGxlbmdlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5zdWJzY2VuZXMgPSBzdWJzY2VuZXM7XG4gICAgICAgIHRoaXMuY2hhbGxlbmdlID0gY2hhbGxlbmdlO1xuICAgIH1cbn1cblxuXG5cblxuIiwiZXhwb3J0IGNsYXNzIFN1YlNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBpbWFnZSwgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuIH0iLCJleHBvcnQgY2xhc3MgQ2hhbGxlbmdlIHtcbiAgICBjb25zdHJ1Y3RvcihxdWVzdGlvbiwgaW1hZ2UsIGFsdGVybmF0aXZlcywgY29ycmVjdEFuc3dlciwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5xdWVzdGlvbiA9IHF1ZXN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuYWx0ZXJuYXRpdmVzID0gYWx0ZXJuYXRpdmVzO1xuICAgICAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBjb3JyZWN0QW5zd2VyO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIFxuICAgIC8vIGRpc3BsYXkoKSB7XG4gICAgLy8gICAgcmV0dXJuIGBcbiAgICAvLyAgICAgPGRpdiBjbGFzcz1cImNoYWxsZW5nZVwiPlxuICAgIC8vICAgICAgICAgPGgyIGNsYXNzPVwiY2hhbGxlbmdlX190aXRsZVwiPiR7dGhpcy5xdWVzdGlvbn08L2gyPlxuICAgIC8vICAgICAgICAgPGltZyBjbGFzcz1cImNoYWxsZW5nZV9faW1nXCIgIHNyYz1cIiR7dGhpcy5pbWFnZX1cIiAvPlxuICAgIC8vICAgICAgICAgPHVsPlxuICAgIC8vICAgICAgICAgICAgICR7dGhpcy5hbHRlcm5hdGl2ZXMubWFwKChhbHRlcm5hdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAvLyAgICAgICAgICAgICAgICAgPGxpPlxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiIGlkPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiIG5hbWU9XCJhbHRlcm5hdGl2ZVwiIHZhbHVlPVwiJHtpbmRleH1cIj5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCI+JHthbHRlcm5hdGl2ZX08L2xhYmVsPlxuICAgIC8vICAgICAgICAgICAgICAgICA8L2xpPlxuICAgIC8vICAgICAgICAgICAgICAgICBgXG4gICAgLy8gICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgLy8gICAgICAgICA8L3VsPlxuICAgIC8vICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiJHt0aGlzLmNhbGxiYWNrfSgpXCI+U3VibWl0PC9idXR0b24+XG4gICAgLy8gICAgIDwvZGl2PlxuICAgIC8vICAgICBgXG4gICAgLy8gfVxuXG4gICAgZGlzcGxheSgpIHtcbiAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3M9XCJjaGFsbGVuZ2VfX3RpdGxlXCI+RGVzYWZpbzwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjaGFsbGVuZ2VfX3F1ZXN0aW9uXCI+JHt0aGlzLnF1ZXN0aW9ufTwvcD5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwiY2hhbGxlbmdlX19pbWdcIiBzcmM9XCIke3RoaXMuaW1hZ2V9XCIgLz5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJjaGFsbGVuZ2VfX2xpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmFsdGVybmF0aXZlcy5tYXAoKGFsdGVybmF0aXZlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cImNoYWxsZW5nZV9faXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBuYW1lPVwiYWx0ZXJuYXRpdmVcIiB2YWx1ZT1cIiR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBjbGFzcz1cImNoYWxsZW5nZV9fbGFiZWxcIj4ke2FsdGVybmF0aXZlfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICAgICAgfSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCIke3RoaXMuY2FsbGJhY2t9KClcIiBjbGFzcz1cImNoYWxsZW5nZV9fYnV0dG9uXCI+UmVzcG9uZGVyPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9XG4gICAgXG59IiwiaW1wb3J0IHsgR2FtZVBsYXkgfSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBTdG9yeSB9IGZyb20gXCIuL1N0b3J5XCI7XG5pbXBvcnQgeyBDaGFwdGVyIH0gZnJvbSBcIi4vQ2hhcHRlclwiO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZVwiO1xuaW1wb3J0IHsgU3ViU2NlbmUgfSBmcm9tIFwiLi9TdWJTY2VuZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4vQ2hhbGxlbmdlXCI7XG5cblxuY29uc3QgYXBwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IGxpZmVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlmZVwiKTtcbmNvbnN0IHNjb3JlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjb3JlXCIpO1xuY29uc3Qgc3RhcnRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpO1xuY29uc3Qgc3RhcnRTY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0LXNjcmVlblwiKTtcblxuY29uc3QgY2hhbGxlbmdlQ2FsbGJhY2sgPSAoc2NlbmVUaXRsZSwgYW5zd2VyKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNjZW5lOiAke3NjZW5lVGl0bGV9YCk7XG4gICAgY29uc29sZS5sb2coYEFuc3dlcjogJHthbnN3ZXJ9YCk7XG59XG5cblxuY29uc3QgY2hhcHRlcnMgPSBbXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIENoYW1hZG8gZG8gR3VhcmRpw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCB1bSBqb3ZlbSBzYW11cmFpLCBhY29yZGEgY29tIHVtIGVzdHJhbmhvIHNvbSB2aW5kbyBkbyBqYXJkaW0gZG8gc2V1IGRvam8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGludmVzdGlnYXIsIGVsZSBlbmNvbnRyYSB1bSBlc3DDrXJpdG8gZ3VhcmRpw6NvIGNoYW1hZG8gWXVraW11cmEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIll1a2ltdXJhIGVzdMOhIGRlc2VzcGVyYWRvIGUgcGVkZSBhIGFqdWRhIGRlIEhpcm9zaGkgcGFyYSBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSwgcXVlIGZvaSBzZXF1ZXN0cmFkYSBwZWxvIHNvbWJyaW8gU2VuaG9yIGRhcyBTb21icmFzLCBEYWljaGkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIGluaWNpYWxtZW50ZSBoZXNpdGFudGUsIHNlIGxlbWJyYSBkYXMgaGlzdMOzcmlhcyBkb3MgYW50aWdvcyBoZXLDs2lzIHNhbXVyYWlzIHF1ZSBzYWx2YXJhbSBvIHJlaW5vIGUgZGVjaWRlIHF1ZSBhZ29yYSDDqSBzdWEgdmV6IGRlIHNlciBvIGhlcsOzaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiRW5jb250cmFyIGEgY2hhdmUgZGEgcG9ydGEgZG8gcXVhcnRvIGRlIEhpcm9zaGlcIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBwcmVjaXNhIGVuY29udHJhciBhIGNoYXZlIGRhIHBvcnRhIGRvIHF1YXJ0byBwYXJhIHBvZGVyIHNhaXIgZGUgY2FzYSBlIGlyIGFvIGVuY29udHJvIGRlIFl1a2ltdXJhLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkEgY2hhdmUgZXN0w6EgZXNjb25kaWRhIGVtIHVtIGRvcyB2YXNvcyBkZSBwbGFudGFzIGRvIGphcmRpbS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGRldmUgcHJvY3VyYXIgYSBjaGF2ZSBlbSBjYWRhIHVtIGRvcyB2YXNvcyBkZSBwbGFudGFzIGF0w6kgZW5jb250csOhLWxhLlwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgSm9ybmFkYSBDb21lw6dhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgWXVraW11cmEgcGFydGVtIGVtIGJ1c2NhIGRhIFByaW5jZXNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDRcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJObyBjYW1pbmhvLCBlbGVzIGVuZnJlbnRhbSBndWVycmVpcm9zIGRhcyBzb21icmFzIGUgZW5jb250cmFtIEhhbmEsIHVtYSDDoWdpbCBrdW5vaWNoaSBwcmVzYSBlbSB1bWEgYXJtYWRpbGhhLiBFbGVzIGEgbGliZXJ0YW0gZSBnYW5oYW0gdW1hIG5vdmEgYWxpYWRhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbSBzZWd1aWRhLCBlbmNvbnRyYW0gS2VuamksIHVtIHPDoWJpbyBtb25nZSwgcXVlIHRyYXogaW5mb3JtYcOnw7VlcyB2YWxpb3NhcyBzb2JyZSBhIGxvY2FsaXphw6fDo28gZGUgQWtlbWkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgN1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkVuY29udHJhciBhIHNhw61kYSBkYSBmbG9yZXN0YVwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfNi5qcGVnXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIFl1a2ltdXJhLCBIYW5hIGUgS2VuamkgZXN0w6NvIHBlcmRpZG9zIG5hIGZsb3Jlc3RhLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkVsZXMgcHJlY2lzYW0gZW5jb250cmFyIGEgc2HDrWRhIHBhcmEgY29udGludWFyIGEgam9ybmFkYS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBIHNhw61kYSBlc3TDoSBlc2NvbmRpZGEgYXRyw6FzIGRlIHVtYSBjYWNob2VpcmEuXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBCb3NxdWUgZGFzIFNvbWJyYXNcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlbnRyYW0gZW0gdW0gYm9zcXVlIHNvbWJyaW8gY2hlaW8gZGUgYXJtYWRpbGhhcyBlIGRlc2FmaW9zLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM18xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJPIGFtYmllbnRlIMOpIGVzY3VybywgY29tIGNhbWluaG9zIHF1ZSBwYXJlY2VtIG11ZGFyIGRlIGx1Z2FyLiBFbGVzIGVuZnJlbnRhbSBvYnN0w6FjdWxvcyBjb21vIGNhbWluaG9zIHF1ZSBkZXNhcGFyZWNlbSBlIMOhcnZvcmVzIHF1ZSBzZSBtb3ZlbS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8zLzNfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEVuY29udHJvIGNvbSBEYWljaGlcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIGNvcmHDp8OjbyBkbyBib3NxdWUsIEhpcm9zaGkgZW5jb250cmEgRGFpY2hpLCBvIHZpbMOjbywgc2VudGFkbyBlbSB1bSB0cm9ubyBmZWl0byBkZSBvc3NvcyBlIHBlZHJhcy5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRGFpY2hpIHJldmVsYSBxdWUgY2FwdHVyb3UgQWtlbWkgcGFyYSBhdHJhaXIgbyB2ZXJkYWRlaXJvIGhlcsOzaSwgbWFzIGVzdMOhIHN1cnByZXNvIGFvIHZlciBIaXJvc2hpLiBFbGUgc3ViZXN0aW1hIEhpcm9zaGkgZSBvIGRlc2FmaWEgYSByZXNvbHZlciB1bSBlbmlnbWEgZGUgbMOzZ2ljYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBzZXVzIGFtaWdvcyBlc2NhcGFtIGRvIGJvc3F1ZSBhcMOzcyByZXNvbHZlciBvIGVuaWdtYSBkZSBEYWljaGkuIE5vIGVudGFudG8sIERhaWNoaSwgZnVyaW9zbywgb3MgcGVyc2VndWUuIEVsZXMgZW5jb250cmFtIHVtIHRvcmlpIG3DoWdpY28gcXVlIHBvZGUgbGV2w6EtbG9zIHBhcmEgZm9yYSBkbyBib3NxdWUsIG1hcyBwcmVjaXNhbSBhdGl2w6EtbG8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIkEgRnVnYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVzY2FwYW0gZG8gYm9zcXVlIGFww7NzIHJlc29sdmVyIG8gZW5pZ21hIGRlIERhaWNoaS4gTm8gZW50YW50bywgRGFpY2hpLCBmdXJpb3NvLCBvcyBwZXJzZWd1ZS4gRWxlcyBlbmNvbnRyYW0gdW0gdG9yaWkgbcOhZ2ljbyBxdWUgcG9kZSBsZXbDoS1sb3MgcGFyYSBmb3JhIGRvIGJvc3F1ZSwgbWFzIHByZWNpc2FtIGF0aXbDoS1sby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy81LzVfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNS81XzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICBdKSxcbiAgICBuZXcgQ2hhcHRlcihbXG4gICAgICAgIG5ldyBTY2VuZShcIk8gVmlsYXJlam8gU2VtIFZpZGFcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBjb21wYW5oaWEgZW1lcmdlbSBkbyB0b3JpaSBtw6FnaWNvIGUgY2hlZ2FtIGFvIFJlaW5vIGRhcyBTb21icmFzLCBvbmRlIGFzIGNvaXNhcyBuw6NvIHBvc3N1ZW0gdmlkYSBuZW0gY29yLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBzw6NvIHJlY2ViaWRvcyBwb3IgQXlhbWUsIHVtYSBzYWNlcmRvdGlzYSBlIG1lc3RyYSBkYSBjYWxpZ3JhZmlhIGUgZGEgcGludHVyYSBtw6FnaWNhLCBxdWUgdHJheiB2aWRhIMOgcyBjb2lzYXMgY29tIHN1YSBhcnRlLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl81LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgZXhwbGljYSBxdWUgcGFyYSBhdmFuw6dhciwgZWxlcyBwcmVjaXNhbSByZXN0YXVyYXIgYSB2aWRhIGRlIHbDoXJpYXMgw6FyZWFzIHF1ZSBmb3JhbSBkZXNib3RhZGFzIHBlbG9zIGNhcGFuZ2FzIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzguanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBEYW7Dp2EgZG9zIEd1ZXJyZWlyb3MgZGFzIFNvbWJyYXNcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkNvbSBhIHByaW1laXJhIMOhcmVhIHJlc3RhdXJhZGEsIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyBjb250aW51YW0gc3VhIGpvcm5hZGEgZW0gYnVzY2EgZGEgcHJpbmNlc2EgZSBzZSBkZXBhcmFtIGNvbSB1bSBncnVwbyBkZSBndWVycmVpcm9zIGRhcyBzb21icmFzIGVtIHVtIHDDoXRpbyBzb21icmlvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gYWRlbnRyYXIgYSDDoXJlYSwgSGlyb3NoaSBkZXNjb2JyZSBxdWUgYSBkYW7Dp2Egcml0dWFsw61zdGljYSBkb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBwb2RlIGRlc2Jsb3F1ZWFyIHBhc3NhZ2VucyBzZWNyZXRhcyBxdWUgRGFpY2hpIHRyYW5jb3UuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzcvN18zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRmVzdGl2YWwgZG9zIFDDoXNzYXJvcyBkZSBQYXBlbFwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gcGFzc2FyIHBvciB1bWEgcGFzc2FnZW0gc2VjcmV0YSBkZXNibG9xdWVhZGEgcGVsb3MgZ3VlcnJlaXJvcyBkYXMgc29tYnJhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhIHVtYSBjaWRhZGUgb25kZSBlc3TDoSBhY29udGVjZW5kbyB1bSBmZXN0aXZhbCBkZSBww6Fzc2Fyb3MgZGUgcGFwZWwgKG9yaWdhbWkpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBkZXNjb2JyZW0gcXVlIERhaWNoaSBlc2NvbmRldSBjaGF2ZXMgbm9zIHDDoXNzYXJvcyBkZSBwYXBlbCBwYXJhIHRyYW5jYXIgb3V0cmFzIMOhcmVhcyBkbyBzZXUgUmVpbm8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzgvOF83LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gUmVzZ2F0ZSBkYSBQcmluY2VzYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIHRvZGFzIGFzIMOhcmVhcyByZXN0YXVyYWRhcyBlIGNoYXZlcyBlbmNvbnRyYWRhcywgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNoZWdhbSBhbyBjYXN0ZWxvIGRlIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFrZW1pIGVzdMOhIHByZXNhIGVtIHVtYSBjZWxhIGdpZ2FudGUgZGVudHJvIGRvIGNhc3RlbG8sIGNlcmNhZG8gcG9yIGZvZ28uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgOFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOS85XzYuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBDZWxlYnJhw6fDo29cIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFww7NzIHNhbHZhciBhIFByaW5jZXNhIEFrZW1pIGUgZGVycm90YXIgRGFpY2hpLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgcmV0b3JuYW0gYW8gUmVpbm8gZGEgTHV6IHBhcmEgdW1hIGdyYW5kZSBjZWxlYnJhw6fDo28uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkF5YW1lIG9yZ2FuaXphIHVtYSBmZXN0YSBwYXJhIG9zIGhlcsOzaXMgY29tZW1vcmFyZW0gYSB2aXTDs3JpYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF80LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICBdKSxcbl07XG5cblxuc3RhcnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBzdGFydFNjcmVlbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgYXBwRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBsaWZlRWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBzY29yZUVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG5cbiAgICBjb25zdCBzdG9yeSA9IG5ldyBTdG9yeShcIkEgQXZlbnR1cmEgZGUgSGlyb3NoaSBubyBSZWlubyBkYXMgU29tYnJhc1wiLCBjaGFwdGVycyk7XG4gICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lUGxheShzdG9yeSwgYXBwRWwsIHNjb3JlRWwsIGxpZmVFbCwgXCJub3JtYWxcIik7XG4gICAgZ2FtZS5nYW1lTG9vcCgpO1xufSk7XG5cblxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLFFBQVEsQ0FBQztJQUNsQixXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxRQUFRLEVBQUU7UUFDdkUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJ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
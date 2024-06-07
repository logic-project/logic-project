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
                    await this.displaySubscene(scene, subscene);
                }

                await this.displayChallenge(scene.challenge);
            }
        }
    }

    // displaySubscene(subscene) {
    //     return new Promise(resolve => {
    //         this.appElement.innerHTML = `<img width="500px" src="${subscene.image}" alt="">`;
    //         const textContainer = document.createElement('div');
    //         this.appElement.appendChild(textContainer);
            
    //         this.typeWriter(subscene.text, textContainer);

    //         const subsceneDuration = this.mode === 'fast' ? 1000 : subscene.duration * 1000;

    //         setTimeout(() => {
    //             resolve();
    //         }, subsceneDuration);
    //     });
    // }

    // displaySubscene(scene, subscene) {
    //     return new Promise(resolve => {
    //         this.appElement.innerHTML = `
    //             <div class="subscene">
    //                 <h1 class="subscene__title">${scene.title}</h1>
    //                 <img class="subscene__img" src="${subscene.image}" alt="">
    //             </div>
    //         `;
    
    //         const textContainer = document.createElement('div');
    //         textContainer.classList.add('subscene__text');
    //         this.appElement.querySelector('.subscene').appendChild(textContainer);
            
    //         this.typeWriter(subscene.text, textContainer);
    
    //         const subsceneDuration = this.mode === 'fast' ? 1000 : subscene.duration * 1000;
    
    //         setTimeout(() => {
    //             resolve();
    //         }, subsceneDuration);
    //     });
    // }

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
                // new SubScene(
                //     "No caminho, eles enfrentam guerreiros das sombras e encontram Hana, uma ágil kunoichi presa em uma armadilha. Eles a libertam e ganham uma nova aliada.", 
                //     "assets/images/cenas/2/2_2.jpeg", 
                //     9
                // ),
                // new SubScene(
                //     "Em seguida, encontram Kenji, um sábio monge, que traz informações valiosas sobre a localização de Akemi.", 
                //     "assets/images/cenas/2/2_6.jpeg", 
                //     7
                // ),
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

    const story = new Story("A Aventura de Hiroshi no Reino das Sombras", chapters);
    const game = new GamePlay(story, appEl, lifeEl, "normal");
    game.gameLoop();
});

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIGxpZmVFbGVtZW50LCBtb2RlID0gJ25vcm1hbCcpIHtcbiAgICAgICAgdGhpcy5zdG9yeSA9IHN0b3J5O1xuICAgICAgICB0aGlzLmFwcEVsZW1lbnQgPSBhcHBFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2FtZUxvb3AoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGlmZURpc3BsYXkoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGFwdGVyIG9mIHRoaXMuc3RvcnkuY2hhcHRlcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2NlbmUgb2YgY2hhcHRlci5zY2VuZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YnNjZW5lIG9mIHNjZW5lLnN1YnNjZW5lcykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlTdWJzY2VuZShzY2VuZSwgc3Vic2NlbmUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUNoYWxsZW5nZShzY2VuZS5jaGFsbGVuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGlzcGxheVN1YnNjZW5lKHN1YnNjZW5lKSB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBgPGltZyB3aWR0aD1cIjUwMHB4XCIgc3JjPVwiJHtzdWJzY2VuZS5pbWFnZX1cIiBhbHQ9XCJcIj5gO1xuICAgIC8vICAgICAgICAgY29uc3QgdGV4dENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIC8vICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHRleHRDb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgLy8gICAgICAgICB0aGlzLnR5cGVXcml0ZXIoc3Vic2NlbmUudGV4dCwgdGV4dENvbnRhaW5lcik7XG5cbiAgICAvLyAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDEwMDAgOiBzdWJzY2VuZS5kdXJhdGlvbiAqIDEwMDA7XG5cbiAgICAvLyAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAvLyAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICAvLyBkaXNwbGF5U3Vic2NlbmUoc2NlbmUsIHN1YnNjZW5lKSB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBgXG4gICAgLy8gICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN1YnNjZW5lXCI+XG4gICAgLy8gICAgICAgICAgICAgICAgIDxoMSBjbGFzcz1cInN1YnNjZW5lX190aXRsZVwiPiR7c2NlbmUudGl0bGV9PC9oMT5cbiAgICAvLyAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInN1YnNjZW5lX19pbWdcIiBzcmM9XCIke3N1YnNjZW5lLmltYWdlfVwiIGFsdD1cIlwiPlxuICAgIC8vICAgICAgICAgICAgIDwvZGl2PlxuICAgIC8vICAgICAgICAgYDtcbiAgICBcbiAgICAvLyAgICAgICAgIGNvbnN0IHRleHRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAvLyAgICAgICAgIHRleHRDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX3RleHQnKTtcbiAgICAvLyAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3Vic2NlbmUnKS5hcHBlbmRDaGlsZCh0ZXh0Q29udGFpbmVyKTtcbiAgICAgICAgICAgIFxuICAgIC8vICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgIC8vICAgICAgICAgY29uc3Qgc3Vic2NlbmVEdXJhdGlvbiA9IHRoaXMubW9kZSA9PT0gJ2Zhc3QnID8gMTAwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAvLyAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAvLyAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICBkaXNwbGF5U3Vic2NlbmUoc2NlbmUsIHN1YnNjZW5lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN1YnNjZW5lQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBzdWJzY2VuZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZScpO1xuICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuaW5uZXJIVE1MID0gYDxoMSBjbGFzcz1cInN1YnNjZW5lX190aXRsZVwiPiR7c2NlbmUudGl0bGV9PC9oMT5gO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5jbGFzc0xpc3QuYWRkKCdzdWJzY2VuZV9faW1nJyk7XG4gICAgICAgICAgICBpbWcuc3JjID0gc3Vic2NlbmUuaW1hZ2U7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0ZXh0Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3N1YnNjZW5lX190ZXh0Jyk7XG4gICAgICAgICAgICAgICAgc3Vic2NlbmVDb250YWluZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgICAgICAgICBzdWJzY2VuZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0Q29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHN1YnNjZW5lQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVXcml0ZXIoc3Vic2NlbmUudGV4dCwgdGV4dENvbnRhaW5lcik7XG4gICAgXG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NlbmVEdXJhdGlvbiA9IHRoaXMubW9kZSA9PT0gJ2Zhc3QnID8gMTAwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGltYWdlOicsIHN1YnNjZW5lLmltYWdlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7ICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGV2ZW4gaWYgdGhlIGltYWdlIGZhaWxzIHRvIGxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBcblxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0eXBlV3JpdGVyKHRleHQsIGVsZW1lbnQsIHNwZWVkID0gNDApIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmdW5jdGlvbiB0eXBlKCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgKz0gdGV4dC5jaGFyQXQoaSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHR5cGUsIHNwZWVkKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlKCk7XG4gICAgfVxuXG5cbiAgICBkaXNwbGF5Q2hhbGxlbmdlKGNoYWxsZW5nZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gY2hhbGxlbmdlLmRpc3BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2hhbGxlbmdlIGJ1dHRvbicpO1xuICAgICAgICBidXR0b24ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJhbHRlcm5hdGl2ZVwiXTpjaGVja2VkJyk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbnN3ZXIgPSBzZWxlY3RlZE9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoYW5zd2VyID09IGNoYWxsZW5nZS5jb3JyZWN0QW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYWxsZW5nZS5jYWxsYmFjayhjaGFsbGVuZ2UucXVlc3Rpb24sIGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVMaWZlRGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5saWZlIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVMaWZlRGlzcGxheSgpIHtcbiAgICAgICAgdGhpcy5saWZlRWxlbWVudC5pbm5lckhUTUwgPSBgVmlkYXM6ICR7dGhpcy5saWZlfWA7XG4gICAgfVxuXG4gICAgZ2FtZU92ZXIoKSB7XG4gICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBcIjxoMT5Wb2PDqiBwZXJkZXU8L2gxPlwiO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTdG9yeSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIGNoYXB0ZXJzKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5jaGFwdGVycyA9IGNoYXB0ZXJzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgQ2hhcHRlciB7XG4gICAgY29uc3RydWN0b3Ioc2NlbmVzKSB7XG4gICAgICAgIHRoaXMuc2NlbmVzID0gc2NlbmVzO1xuICAgIH1cbn0iLCJleHBvcnQgY2xhc3MgU2NlbmUge1xuICAgIGNvbnN0cnVjdG9yKHRpdGxlLCBzdWJzY2VuZXMsIGNoYWxsZW5nZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuc3Vic2NlbmVzID0gc3Vic2NlbmVzO1xuICAgICAgICB0aGlzLmNoYWxsZW5nZSA9IGNoYWxsZW5nZTtcbiAgICB9XG59XG5cblxuXG5cbiIsImV4cG9ydCBjbGFzcyBTdWJTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGV4dCwgaW1hZ2UsIGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIH1cbiB9IiwiZXhwb3J0IGNsYXNzIENoYWxsZW5nZSB7XG4gICAgY29uc3RydWN0b3IocXVlc3Rpb24sIGltYWdlLCBhbHRlcm5hdGl2ZXMsIGNvcnJlY3RBbnN3ZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb24gPSBxdWVzdGlvbjtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmFsdGVybmF0aXZlcyA9IGFsdGVybmF0aXZlcztcbiAgICAgICAgdGhpcy5jb3JyZWN0QW5zd2VyID0gY29ycmVjdEFuc3dlcjtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICBcbiAgICAvLyBkaXNwbGF5KCkge1xuICAgIC8vICAgIHJldHVybiBgXG4gICAgLy8gICAgIDxkaXYgY2xhc3M9XCJjaGFsbGVuZ2VcIj5cbiAgICAvLyAgICAgICAgIDxoMiBjbGFzcz1cImNoYWxsZW5nZV9fdGl0bGVcIj4ke3RoaXMucXVlc3Rpb259PC9oMj5cbiAgICAvLyAgICAgICAgIDxpbWcgY2xhc3M9XCJjaGFsbGVuZ2VfX2ltZ1wiICBzcmM9XCIke3RoaXMuaW1hZ2V9XCIgLz5cbiAgICAvLyAgICAgICAgIDx1bD5cbiAgICAvLyAgICAgICAgICAgICAke3RoaXMuYWx0ZXJuYXRpdmVzLm1hcCgoYWx0ZXJuYXRpdmUsIGluZGV4KSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgLy8gICAgICAgICAgICAgICAgIDxsaT5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIiBpZD1cImFsdGVybmF0aXZlJHtpbmRleH1cIiBuYW1lPVwiYWx0ZXJuYXRpdmVcIiB2YWx1ZT1cIiR7aW5kZXh9XCI+XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiYWx0ZXJuYXRpdmUke2luZGV4fVwiPiR7YWx0ZXJuYXRpdmV9PC9sYWJlbD5cbiAgICAvLyAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAvLyAgICAgICAgICAgICAgICAgYFxuICAgIC8vICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgIC8vICAgICAgICAgPC91bD5cbiAgICAvLyAgICAgICAgIDxidXR0b24gb25jbGljaz1cIiR7dGhpcy5jYWxsYmFja30oKVwiPlN1Ym1pdDwvYnV0dG9uPlxuICAgIC8vICAgICA8L2Rpdj5cbiAgICAvLyAgICAgYFxuICAgIC8vIH1cblxuICAgIGRpc3BsYXkoKSB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhbGxlbmdlXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzPVwiY2hhbGxlbmdlX190aXRsZVwiPkRlc2FmaW88L2gyPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwiY2hhbGxlbmdlX19xdWVzdGlvblwiPiR7dGhpcy5xdWVzdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImNoYWxsZW5nZV9faW1nXCIgc3JjPVwiJHt0aGlzLmltYWdlfVwiIC8+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwiY2hhbGxlbmdlX19saXN0XCI+XG4gICAgICAgICAgICAgICAgICAgICR7dGhpcy5hbHRlcm5hdGl2ZXMubWFwKChhbHRlcm5hdGl2ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjaGFsbGVuZ2VfX2l0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCIgbmFtZT1cImFsdGVybmF0aXZlXCIgdmFsdWU9XCIke2luZGV4fVwiIGNsYXNzPVwiY2hhbGxlbmdlX19pbnB1dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2xhYmVsXCI+JHthbHRlcm5hdGl2ZX08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiJHt0aGlzLmNhbGxiYWNrfSgpXCIgY2xhc3M9XCJjaGFsbGVuZ2VfX2J1dHRvblwiPlJlc3BvbmRlcjwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgfVxuICAgIFxufSIsImltcG9ydCB7IEdhbWVQbGF5IH0gZnJvbSBcIi4vR2FtZVwiO1xuaW1wb3J0IHsgU3RvcnkgfSBmcm9tIFwiLi9TdG9yeVwiO1xuaW1wb3J0IHsgQ2hhcHRlciB9IGZyb20gXCIuL0NoYXB0ZXJcIjtcbmltcG9ydCB7IFNjZW5lIH0gZnJvbSBcIi4vU2NlbmVcIjtcbmltcG9ydCB7IFN1YlNjZW5lIH0gZnJvbSBcIi4vU3ViU2NlbmVcIjtcbmltcG9ydCB7IENoYWxsZW5nZSB9IGZyb20gXCIuL0NoYWxsZW5nZVwiO1xuXG5cbmNvbnN0IGFwcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG5jb25zdCBsaWZlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpZmVcIik7XG5jb25zdCBzdGFydEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XG5jb25zdCBzdGFydFNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnQtc2NyZWVuXCIpO1xuXG5jb25zdCBjaGFsbGVuZ2VDYWxsYmFjayA9IChzY2VuZVRpdGxlLCBhbnN3ZXIpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgU2NlbmU6ICR7c2NlbmVUaXRsZX1gKTtcbiAgICBjb25zb2xlLmxvZyhgQW5zd2VyOiAke2Fuc3dlcn1gKTtcbn1cblxuXG5jb25zdCBjaGFwdGVycyA9IFtcbiAgICBuZXcgQ2hhcHRlcihbXG4gICAgICAgIG5ldyBTY2VuZShcIk8gQ2hhbWFkbyBkbyBHdWFyZGnDo29cIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGksIHVtIGpvdmVtIHNhbXVyYWksIGFjb3JkYSBjb20gdW0gZXN0cmFuaG8gc29tIHZpbmRvIGRvIGphcmRpbSBkbyBzZXUgZG9qby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQW8gaW52ZXN0aWdhciwgZWxlIGVuY29udHJhIHVtIGVzcMOtcml0byBndWFyZGnDo28gY2hhbWFkbyBZdWtpbXVyYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA2XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiWXVraW11cmEgZXN0w6EgZGVzZXNwZXJhZG8gZSBwZWRlIGEgYWp1ZGEgZGUgSGlyb3NoaSBwYXJhIHNhbHZhciBhIFByaW5jZXNhIEFrZW1pLCBxdWUgZm9pIHNlcXVlc3RyYWRhIHBlbG8gc29tYnJpbyBTZW5ob3IgZGFzIFNvbWJyYXMsIERhaWNoaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgaW5pY2lhbG1lbnRlIGhlc2l0YW50ZSwgc2UgbGVtYnJhIGRhcyBoaXN0w7NyaWFzIGRvcyBhbnRpZ29zIGhlcsOzaXMgc2FtdXJhaXMgcXVlIHNhbHZhcmFtIG8gcmVpbm8gZSBkZWNpZGUgcXVlIGFnb3JhIMOpIHN1YSB2ZXogZGUgc2VyIG8gaGVyw7NpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJFbmNvbnRyYXIgYSBjaGF2ZSBkYSBwb3J0YSBkbyBxdWFydG8gZGUgSGlyb3NoaVwiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIHByZWNpc2EgZW5jb250cmFyIGEgY2hhdmUgZGEgcG9ydGEgZG8gcXVhcnRvIHBhcmEgcG9kZXIgc2FpciBkZSBjYXNhIGUgaXIgYW8gZW5jb250cm8gZGUgWXVraW11cmEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQSBjaGF2ZSBlc3TDoSBlc2NvbmRpZGEgZW0gdW0gZG9zIHZhc29zIGRlIHBsYW50YXMgZG8gamFyZGltLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZGV2ZSBwcm9jdXJhciBhIGNoYXZlIGVtIGNhZGEgdW0gZG9zIHZhc29zIGRlIHBsYW50YXMgYXTDqSBlbmNvbnRyw6EtbGEuXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBKb3JuYWRhIENvbWXDp2FcIiwgXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgZSBZdWtpbXVyYSBwYXJ0ZW0gZW0gYnVzY2EgZGEgUHJpbmNlc2EuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgLy8gbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgIC8vICAgICBcIk5vIGNhbWluaG8sIGVsZXMgZW5mcmVudGFtIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZSBlbmNvbnRyYW0gSGFuYSwgdW1hIMOhZ2lsIGt1bm9pY2hpIHByZXNhIGVtIHVtYSBhcm1hZGlsaGEuIEVsZXMgYSBsaWJlcnRhbSBlIGdhbmhhbSB1bWEgbm92YSBhbGlhZGEuXCIsIFxuICAgICAgICAgICAgICAgIC8vICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMi8yXzIuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAvLyAgICAgOVxuICAgICAgICAgICAgICAgIC8vICksXG4gICAgICAgICAgICAgICAgLy8gbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgIC8vICAgICBcIkVtIHNlZ3VpZGEsIGVuY29udHJhbSBLZW5qaSwgdW0gc8OhYmlvIG1vbmdlLCBxdWUgdHJheiBpbmZvcm1hw6fDtWVzIHZhbGlvc2FzIHNvYnJlIGEgbG9jYWxpemHDp8OjbyBkZSBBa2VtaS5cIiwgXG4gICAgICAgICAgICAgICAgLy8gICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIC8vICAgICA3XG4gICAgICAgICAgICAgICAgLy8gKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiRW5jb250cmFyIGEgc2HDrWRhIGRhIGZsb3Jlc3RhXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl82LmpwZWdcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgWXVraW11cmEsIEhhbmEgZSBLZW5qaSBlc3TDo28gcGVyZGlkb3MgbmEgZmxvcmVzdGEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBwcmVjaXNhbSBlbmNvbnRyYXIgYSBzYcOtZGEgcGFyYSBjb250aW51YXIgYSBqb3JuYWRhLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkEgc2HDrWRhIGVzdMOhIGVzY29uZGlkYSBhdHLDoXMgZGUgdW1hIGNhY2hvZWlyYS5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEJvc3F1ZSBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVudHJhbSBlbSB1bSBib3NxdWUgc29tYnJpbyBjaGVpbyBkZSBhcm1hZGlsaGFzIGUgZGVzYWZpb3MuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk8gYW1iaWVudGUgw6kgZXNjdXJvLCBjb20gY2FtaW5ob3MgcXVlIHBhcmVjZW0gbXVkYXIgZGUgbHVnYXIuIEVsZXMgZW5mcmVudGFtIG9ic3TDoWN1bG9zIGNvbW8gY2FtaW5ob3MgcXVlIGRlc2FwYXJlY2VtIGUgw6Fydm9yZXMgcXVlIHNlIG1vdmVtLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRW5jb250cm8gY29tIERhaWNoaVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY29yYcOnw6NvIGRvIGJvc3F1ZSwgSGlyb3NoaSBlbmNvbnRyYSBEYWljaGksIG8gdmlsw6NvLCBzZW50YWRvIGVtIHVtIHRyb25vIGZlaXRvIGRlIG9zc29zIGUgcGVkcmFzLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJEYWljaGkgcmV2ZWxhIHF1ZSBjYXB0dXJvdSBBa2VtaSBwYXJhIGF0cmFpciBvIHZlcmRhZGVpcm8gaGVyw7NpLCBtYXMgZXN0w6Egc3VycHJlc28gYW8gdmVyIEhpcm9zaGkuIEVsZSBzdWJlc3RpbWEgSGlyb3NoaSBlIG8gZGVzYWZpYSBhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDExXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVzY2FwYW0gZG8gYm9zcXVlIGFww7NzIHJlc29sdmVyIG8gZW5pZ21hIGRlIERhaWNoaS4gTm8gZW50YW50bywgRGFpY2hpLCBmdXJpb3NvLCBvcyBwZXJzZWd1ZS4gRWxlcyBlbmNvbnRyYW0gdW0gdG9yaWkgbcOhZ2ljbyBxdWUgcG9kZSBsZXbDoS1sb3MgcGFyYSBmb3JhIGRvIGJvc3F1ZSwgbWFzIHByZWNpc2FtIGF0aXbDoS1sby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBGdWdhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy81LzVfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBWaWxhcmVqbyBTZW0gVmlkYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIGNvbXBhbmhpYSBlbWVyZ2VtIGRvIHRvcmlpIG3DoWdpY28gZSBjaGVnYW0gYW8gUmVpbm8gZGFzIFNvbWJyYXMsIG9uZGUgYXMgY29pc2FzIG7Do28gcG9zc3VlbSB2aWRhIG5lbSBjb3IuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHPDo28gcmVjZWJpZG9zIHBvciBBeWFtZSwgdW1hIHNhY2VyZG90aXNhIGUgbWVzdHJhIGRhIGNhbGlncmFmaWEgZSBkYSBwaW50dXJhIG3DoWdpY2EsIHF1ZSB0cmF6IHZpZGEgw6BzIGNvaXNhcyBjb20gc3VhIGFydGUuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBleHBsaWNhIHF1ZSBwYXJhIGF2YW7Dp2FyLCBlbGVzIHByZWNpc2FtIHJlc3RhdXJhciBhIHZpZGEgZGUgdsOhcmlhcyDDoXJlYXMgcXVlIGZvcmFtIGRlc2JvdGFkYXMgcGVsb3MgY2FwYW5nYXMgZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIERhbsOnYSBkb3MgR3VlcnJlaXJvcyBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIGEgcHJpbWVpcmEgw6FyZWEgcmVzdGF1cmFkYSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNvbnRpbnVhbSBzdWEgam9ybmFkYSBlbSBidXNjYSBkYSBwcmluY2VzYSBlIHNlIGRlcGFyYW0gY29tIHVtIGdydXBvIGRlIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZW0gdW0gcMOhdGlvIHNvbWJyaW8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBhZGVudHJhciBhIMOhcmVhLCBIaXJvc2hpIGRlc2NvYnJlIHF1ZSBhIGRhbsOnYSByaXR1YWzDrXN0aWNhIGRvcyBndWVycmVpcm9zIGRhcyBzb21icmFzIHBvZGUgZGVzYmxvcXVlYXIgcGFzc2FnZW5zIHNlY3JldGFzIHF1ZSBEYWljaGkgdHJhbmNvdS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBGZXN0aXZhbCBkb3MgUMOhc3Nhcm9zIGRlIFBhcGVsXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBwYXNzYXIgcG9yIHVtYSBwYXNzYWdlbSBzZWNyZXRhIGRlc2Jsb3F1ZWFkYSBwZWxvcyBndWVycmVpcm9zIGRhcyBzb21icmFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGEgdW1hIGNpZGFkZSBvbmRlIGVzdMOhIGFjb250ZWNlbmRvIHVtIGZlc3RpdmFsIGRlIHDDoXNzYXJvcyBkZSBwYXBlbCAob3JpZ2FtaSkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIGRlc2NvYnJlbSBxdWUgRGFpY2hpIGVzY29uZGV1IGNoYXZlcyBub3MgcMOhc3Nhcm9zIGRlIHBhcGVsIHBhcmEgdHJhbmNhciBvdXRyYXMgw6FyZWFzIGRvIHNldSBSZWluby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfNy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBSZXNnYXRlIGRhIFByaW5jZXNhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gdG9kYXMgYXMgw6FyZWFzIHJlc3RhdXJhZGFzIGUgY2hhdmVzIGVuY29udHJhZGFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGFvIGNhc3RlbG8gZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQWtlbWkgZXN0w6EgcHJlc2EgZW0gdW1hIGNlbGEgZ2lnYW50ZSBkZW50cm8gZG8gY2FzdGVsbywgY2VyY2FkbyBwb3IgZm9nby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIENlbGVicmHDp8Ojb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXDDs3Mgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWkgZSBkZXJyb3RhciBEYWljaGksIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyByZXRvcm5hbSBhbyBSZWlubyBkYSBMdXogcGFyYSB1bWEgZ3JhbmRlIGNlbGVicmHDp8Ojby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgb3JnYW5pemEgdW1hIGZlc3RhIHBhcmEgb3MgaGVyw7NpcyBjb21lbW9yYXJlbSBhIHZpdMOzcmlhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuXTtcblxuXG5zdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHN0YXJ0U2NyZWVuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBhcHBFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxpZmVFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuXG4gICAgY29uc3Qgc3RvcnkgPSBuZXcgU3RvcnkoXCJBIEF2ZW50dXJhIGRlIEhpcm9zaGkgbm8gUmVpbm8gZGFzIFNvbWJyYXNcIiwgY2hhcHRlcnMpO1xuICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZVBsYXkoc3RvcnksIGFwcEVsLCBsaWZlRWwsIFwibm9ybWFsXCIpO1xuICAgIGdhbWUuZ2FtZUxvb3AoKTtcbn0pO1xuXG5cblxuXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sTUFBTSxRQUFRLENBQUM7SUFDbEIsV0FBVyxDQUFDLEtBQUss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
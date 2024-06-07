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

    displaySubscene(scene, subscene) {
        return new Promise(resolve => {
            this.appElement.innerHTML = `
                <div class="subscene">
                    <h1 class="subscene__title">${scene.title}</h1>
                    <img class="subscene__img" src="${subscene.image}" alt="">
                </div>
            `;
    
            const textContainer = document.createElement('div');
            textContainer.classList.add('subscene__text');
            this.appElement.querySelector('.subscene').appendChild(textContainer);
            
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

    typeWriter(text, element, speed = 45) {
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
                    "Hiroshi, um jovem samurai, acorda com um estranho som vindo do jardim do seu dojo.", 
                    "assets/images/cenas/1/1_1.jpeg", 
                    5
                ),
                new SubScene(
                    "Ao investigar, ele encontra um espírito guardião chamado Yukimura.", 
                    "assets/images/cenas/1/1_3.jpeg", 
                    5
                ),
                new SubScene(
                    "Yukimura está desesperado e pede a ajuda de Hiroshi para salvar a Princesa Akemi, que foi sequestrada pelo sombrio Senhor das Sombras, Daichi. Hiroshi, inicialmente hesitante, se lembra das histórias dos antigos heróis samurais que salvaram o reino e decide que agora é sua vez de ser o herói.", 
                    "assets/images/cenas/1/1_8.jpeg", 
                    16
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
                "assets/images/cenas/2_6.jpeg",
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

const story = new Story("A Aventura de Hiroshi no Reino das Sombras", chapters);
const game = new GamePlay(story, appEl, lifeEl, "normal");
game.gameLoop();

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvR2FtZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvU3RvcnkuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL0NoYXB0ZXIuanMiLCIvaG9tZS9sYXRvcnJlL1JlcG9zL2xvZ2ljLXByb2plY3Qvc3JjL2pzL1NjZW5lLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9TdWJTY2VuZS5qcyIsIi9ob21lL2xhdG9ycmUvUmVwb3MvbG9naWMtcHJvamVjdC9zcmMvanMvQ2hhbGxlbmdlLmpzIiwiL2hvbWUvbGF0b3JyZS9SZXBvcy9sb2dpYy1wcm9qZWN0L3NyYy9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBHYW1lUGxheSB7XG4gICAgY29uc3RydWN0b3Ioc3RvcnksIGFwcEVsZW1lbnQsIGxpZmVFbGVtZW50LCBtb2RlID0gJ25vcm1hbCcpIHtcbiAgICAgICAgdGhpcy5zdG9yeSA9IHN0b3J5O1xuICAgICAgICB0aGlzLmFwcEVsZW1lbnQgPSBhcHBFbGVtZW50O1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50ID0gbGlmZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgIHRoaXMubGlmZSA9IDM7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2FtZUxvb3AoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGlmZURpc3BsYXkoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGFwdGVyIG9mIHRoaXMuc3RvcnkuY2hhcHRlcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2NlbmUgb2YgY2hhcHRlci5zY2VuZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YnNjZW5lIG9mIHNjZW5lLnN1YnNjZW5lcykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlTdWJzY2VuZShzY2VuZSwgc3Vic2NlbmUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUNoYWxsZW5nZShzY2VuZS5jaGFsbGVuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGlzcGxheVN1YnNjZW5lKHN1YnNjZW5lKSB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBgPGltZyB3aWR0aD1cIjUwMHB4XCIgc3JjPVwiJHtzdWJzY2VuZS5pbWFnZX1cIiBhbHQ9XCJcIj5gO1xuICAgIC8vICAgICAgICAgY29uc3QgdGV4dENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIC8vICAgICAgICAgdGhpcy5hcHBFbGVtZW50LmFwcGVuZENoaWxkKHRleHRDb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgLy8gICAgICAgICB0aGlzLnR5cGVXcml0ZXIoc3Vic2NlbmUudGV4dCwgdGV4dENvbnRhaW5lcik7XG5cbiAgICAvLyAgICAgICAgIGNvbnN0IHN1YnNjZW5lRHVyYXRpb24gPSB0aGlzLm1vZGUgPT09ICdmYXN0JyA/IDEwMDAgOiBzdWJzY2VuZS5kdXJhdGlvbiAqIDEwMDA7XG5cbiAgICAvLyAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAvLyAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICBkaXNwbGF5U3Vic2NlbmUoc2NlbmUsIHN1YnNjZW5lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN1YnNjZW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzcz1cInN1YnNjZW5lX190aXRsZVwiPiR7c2NlbmUudGl0bGV9PC9oMT5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInN1YnNjZW5lX19pbWdcIiBzcmM9XCIke3N1YnNjZW5lLmltYWdlfVwiIGFsdD1cIlwiPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICBcbiAgICAgICAgICAgIGNvbnN0IHRleHRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRleHRDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3Vic2NlbmVfX3RleHQnKTtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc3Vic2NlbmUnKS5hcHBlbmRDaGlsZCh0ZXh0Q29udGFpbmVyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy50eXBlV3JpdGVyKHN1YnNjZW5lLnRleHQsIHRleHRDb250YWluZXIpO1xuICAgIFxuICAgICAgICAgICAgY29uc3Qgc3Vic2NlbmVEdXJhdGlvbiA9IHRoaXMubW9kZSA9PT0gJ2Zhc3QnID8gMTAwMCA6IHN1YnNjZW5lLmR1cmF0aW9uICogMTAwMDtcbiAgICBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIHN1YnNjZW5lRHVyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgXG5cbiAgICBkaXNwbGF5Q2hhbGxlbmdlKGNoYWxsZW5nZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFwcEVsZW1lbnQuaW5uZXJIVE1MID0gY2hhbGxlbmdlLmRpc3BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hhbGxlbmdlRXZlbnRMaXN0ZW5lcnMoY2hhbGxlbmdlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHlwZVdyaXRlcih0ZXh0LCBlbGVtZW50LCBzcGVlZCA9IDQ1KSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZnVuY3Rpb24gdHlwZSgpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MICs9IHRleHQuY2hhckF0KGkpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0eXBlLCBzcGVlZCk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSgpO1xuICAgIH1cblxuICAgIGRpc3BsYXlDaGFsbGVuZ2UoY2hhbGxlbmdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXBwRWxlbWVudC5pbm5lckhUTUwgPSBjaGFsbGVuZ2UuZGlzcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDaGFsbGVuZ2VFdmVudExpc3RlbmVycyhjaGFsbGVuZ2UsIHJlc29sdmUpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gdGhpcy5hcHBFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGFsbGVuZ2UgYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLmFwcEVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImFsdGVybmF0aXZlXCJdOmNoZWNrZWQnKTtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuc3dlciA9IHNlbGVjdGVkT3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChhbnN3ZXIgPT0gY2hhbGxlbmdlLmNvcnJlY3RBbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbGxlbmdlLmNhbGxiYWNrKGNoYWxsZW5nZS5xdWVzdGlvbiwgYW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlmZS0tO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxpZmVEaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpZmUgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUxpZmVEaXNwbGF5KCkge1xuICAgICAgICB0aGlzLmxpZmVFbGVtZW50LmlubmVySFRNTCA9IGBWaWRhczogJHt0aGlzLmxpZmV9YDtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5hcHBFbGVtZW50LmlubmVySFRNTCA9IFwiPGgxPlZvY8OqIHBlcmRldTwvaDE+XCI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih0aXRsZSwgY2hhcHRlcnMpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLmNoYXB0ZXJzID0gY2hhcHRlcnM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBDaGFwdGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzY2VuZXMpIHtcbiAgICAgICAgdGhpcy5zY2VuZXMgPSBzY2VuZXM7XG4gICAgfVxufSIsImV4cG9ydCBjbGFzcyBTY2VuZSB7XG4gICAgY29uc3RydWN0b3IodGl0bGUsIHN1YnNjZW5lcywgY2hhbGxlbmdlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5zdWJzY2VuZXMgPSBzdWJzY2VuZXM7XG4gICAgICAgIHRoaXMuY2hhbGxlbmdlID0gY2hhbGxlbmdlO1xuICAgIH1cbn1cblxuXG5cblxuIiwiZXhwb3J0IGNsYXNzIFN1YlNjZW5lIHtcbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBpbWFnZSwgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuIH0iLCJleHBvcnQgY2xhc3MgQ2hhbGxlbmdlIHtcbiAgICBjb25zdHJ1Y3RvcihxdWVzdGlvbiwgaW1hZ2UsIGFsdGVybmF0aXZlcywgY29ycmVjdEFuc3dlciwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5xdWVzdGlvbiA9IHF1ZXN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuYWx0ZXJuYXRpdmVzID0gYWx0ZXJuYXRpdmVzO1xuICAgICAgICB0aGlzLmNvcnJlY3RBbnN3ZXIgPSBjb3JyZWN0QW5zd2VyO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIFxuICAgIGRpc3BsYXkoKSB7XG4gICAgICAgcmV0dXJuIGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImNoYWxsZW5nZVwiPlxuICAgICAgICAgICAgPGgyPiR7dGhpcy5xdWVzdGlvbn08L2gyPlxuICAgICAgICAgICAgPGltZyB3aWR0aD1cIjUwMHB4XCIgc3JjPVwiJHt0aGlzLmltYWdlfVwiIC8+XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgJHt0aGlzLmFsdGVybmF0aXZlcy5tYXAoKGFsdGVybmF0aXZlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCIgaWQ9XCJhbHRlcm5hdGl2ZSR7aW5kZXh9XCIgbmFtZT1cImFsdGVybmF0aXZlXCIgdmFsdWU9XCIke2luZGV4fVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImFsdGVybmF0aXZlJHtpbmRleH1cIj4ke2FsdGVybmF0aXZlfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgIGBcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8YnV0dG9uIG9uY2xpY2s9XCIke3RoaXMuY2FsbGJhY2t9KClcIj5TdWJtaXQ8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIGBcbiAgICB9XG59IiwiaW1wb3J0IHsgR2FtZVBsYXkgfSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBTdG9yeSB9IGZyb20gXCIuL1N0b3J5XCI7XG5pbXBvcnQgeyBDaGFwdGVyIH0gZnJvbSBcIi4vQ2hhcHRlclwiO1xuaW1wb3J0IHsgU2NlbmUgfSBmcm9tIFwiLi9TY2VuZVwiO1xuaW1wb3J0IHsgU3ViU2NlbmUgfSBmcm9tIFwiLi9TdWJTY2VuZVwiO1xuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4vQ2hhbGxlbmdlXCI7XG5cblxuY29uc3QgYXBwRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKTtcbmNvbnN0IGxpZmVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlmZVwiKTtcblxuY29uc3QgY2hhbGxlbmdlQ2FsbGJhY2sgPSAoc2NlbmVUaXRsZSwgYW5zd2VyKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNjZW5lOiAke3NjZW5lVGl0bGV9YCk7XG4gICAgY29uc29sZS5sb2coYEFuc3dlcjogJHthbnN3ZXJ9YCk7XG59XG5cblxuY29uc3QgY2hhcHRlcnMgPSBbXG4gICAgbmV3IENoYXB0ZXIoW1xuICAgICAgICBuZXcgU2NlbmUoXCJPIENoYW1hZG8gZG8gR3VhcmRpw6NvXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpLCB1bSBqb3ZlbSBzYW11cmFpLCBhY29yZGEgY29tIHVtIGVzdHJhbmhvIHNvbSB2aW5kbyBkbyBqYXJkaW0gZG8gc2V1IGRvam8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIkFvIGludmVzdGlnYXIsIGVsZSBlbmNvbnRyYSB1bSBlc3DDrXJpdG8gZ3VhcmRpw6NvIGNoYW1hZG8gWXVraW11cmEuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMS8xXzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIll1a2ltdXJhIGVzdMOhIGRlc2VzcGVyYWRvIGUgcGVkZSBhIGFqdWRhIGRlIEhpcm9zaGkgcGFyYSBzYWx2YXIgYSBQcmluY2VzYSBBa2VtaSwgcXVlIGZvaSBzZXF1ZXN0cmFkYSBwZWxvIHNvbWJyaW8gU2VuaG9yIGRhcyBTb21icmFzLCBEYWljaGkuIEhpcm9zaGksIGluaWNpYWxtZW50ZSBoZXNpdGFudGUsIHNlIGxlbWJyYSBkYXMgaGlzdMOzcmlhcyBkb3MgYW50aWdvcyBoZXLDs2lzIHNhbXVyYWlzIHF1ZSBzYWx2YXJhbSBvIHJlaW5vIGUgZGVjaWRlIHF1ZSBhZ29yYSDDqSBzdWEgdmV6IGRlIHNlciBvIGhlcsOzaS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xLzFfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIkVuY29udHJhciBhIGNoYXZlIGRhIHBvcnRhIGRvIHF1YXJ0byBkZSBIaXJvc2hpXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEvMV8zLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkhpcm9zaGkgcHJlY2lzYSBlbmNvbnRyYXIgYSBjaGF2ZSBkYSBwb3J0YSBkbyBxdWFydG8gcGFyYSBwb2RlciBzYWlyIGRlIGNhc2EgZSBpciBhbyBlbmNvbnRybyBkZSBZdWtpbXVyYS5cIixcbiAgICAgICAgICAgICAgICAgICAgXCJBIGNoYXZlIGVzdMOhIGVzY29uZGlkYSBlbSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBkbyBqYXJkaW0uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBkZXZlIHByb2N1cmFyIGEgY2hhdmUgZW0gY2FkYSB1bSBkb3MgdmFzb3MgZGUgcGxhbnRhcyBhdMOpIGVuY29udHLDoS1sYS5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIEpvcm5hZGEgQ29tZcOnYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIFl1a2ltdXJhIHBhcnRlbSBlbSBidXNjYSBkYSBQcmluY2VzYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA0XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY2FtaW5obywgZWxlcyBlbmZyZW50YW0gZ3VlcnJlaXJvcyBkYXMgc29tYnJhcyBlIGVuY29udHJhbSBIYW5hLCB1bWEgw6FnaWwga3Vub2ljaGkgcHJlc2EgZW0gdW1hIGFybWFkaWxoYS4gRWxlcyBhIGxpYmVydGFtIGUgZ2FuaGFtIHVtYSBub3ZhIGFsaWFkYS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8yLzJfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiRW0gc2VndWlkYSwgZW5jb250cmFtIEtlbmppLCB1bSBzw6FiaW8gbW9uZ2UsIHF1ZSB0cmF6IGluZm9ybWHDp8O1ZXMgdmFsaW9zYXMgc29icmUgYSBsb2NhbGl6YcOnw6NvIGRlIEFrZW1pLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzIvMl82LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJFbmNvbnRyYXIgYSBzYcOtZGEgZGEgZmxvcmVzdGFcIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMl82LmpwZWdcIixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSwgWXVraW11cmEsIEhhbmEgZSBLZW5qaSBlc3TDo28gcGVyZGlkb3MgbmEgZmxvcmVzdGEuXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiRWxlcyBwcmVjaXNhbSBlbmNvbnRyYXIgYSBzYcOtZGEgcGFyYSBjb250aW51YXIgYSBqb3JuYWRhLlwiLFxuICAgICAgICAgICAgICAgICAgICBcIkEgc2HDrWRhIGVzdMOhIGVzY29uZGlkYSBhdHLDoXMgZGUgdW1hIGNhY2hvZWlyYS5cIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJPIEJvc3F1ZSBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVudHJhbSBlbSB1bSBib3NxdWUgc29tYnJpbyBjaGVpbyBkZSBhcm1hZGlsaGFzIGUgZGVzYWZpb3MuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMy8zXzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbmV3IFN1YlNjZW5lKFxuICAgICAgICAgICAgICAgICAgICBcIk8gYW1iaWVudGUgw6kgZXNjdXJvLCBjb20gY2FtaW5ob3MgcXVlIHBhcmVjZW0gbXVkYXIgZGUgbHVnYXIuIEVsZXMgZW5mcmVudGFtIG9ic3TDoWN1bG9zIGNvbW8gY2FtaW5ob3MgcXVlIGRlc2FwYXJlY2VtIGUgw6Fydm9yZXMgcXVlIHNlIG1vdmVtLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG5ldyBDaGFsbGVuZ2UoXG4gICAgICAgICAgICAgICAgXCJUZXh0byBkbyBkZXNhZmlvXCIsXG4gICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzMvM180LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcIkEpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQikgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJDKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNvcnJldGEgQ1wiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGNoYWxsZW5nZUNhbGxiYWNrXG4gICAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIG5ldyBTY2VuZShcIk8gRW5jb250cm8gY29tIERhaWNoaVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gY29yYcOnw6NvIGRvIGJvc3F1ZSwgSGlyb3NoaSBlbmNvbnRyYSBEYWljaGksIG8gdmlsw6NvLCBzZW50YWRvIGVtIHVtIHRyb25vIGZlaXRvIGRlIG9zc29zIGUgcGVkcmFzLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJEYWljaGkgcmV2ZWxhIHF1ZSBjYXB0dXJvdSBBa2VtaSBwYXJhIGF0cmFpciBvIHZlcmRhZGVpcm8gaGVyw7NpLCBtYXMgZXN0w6Egc3VycHJlc28gYW8gdmVyIEhpcm9zaGkuIEVsZSBzdWJlc3RpbWEgSGlyb3NoaSBlIG8gZGVzYWZpYSBhIHJlc29sdmVyIHVtIGVuaWdtYSBkZSBsw7NnaWNhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzQvNF8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDExXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIHNldXMgYW1pZ29zIGVzY2FwYW0gZG8gYm9zcXVlIGFww7NzIHJlc29sdmVyIG8gZW5pZ21hIGRlIERhaWNoaS4gTm8gZW50YW50bywgRGFpY2hpLCBmdXJpb3NvLCBvcyBwZXJzZWd1ZS4gRWxlcyBlbmNvbnRyYW0gdW0gdG9yaWkgbcOhZ2ljbyBxdWUgcG9kZSBsZXbDoS1sb3MgcGFyYSBmb3JhIGRvIGJvc3F1ZSwgbWFzIHByZWNpc2FtIGF0aXbDoS1sby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy80LzRfNS5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxM1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNC80XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiQSBGdWdhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJIaXJvc2hpIGUgc2V1cyBhbWlnb3MgZXNjYXBhbSBkbyBib3NxdWUgYXDDs3MgcmVzb2x2ZXIgbyBlbmlnbWEgZGUgRGFpY2hpLiBObyBlbnRhbnRvLCBEYWljaGksIGZ1cmlvc28sIG9zIHBlcnNlZ3VlLiBFbGVzIGVuY29udHJhbSB1bSB0b3JpaSBtw6FnaWNvIHF1ZSBwb2RlIGxldsOhLWxvcyBwYXJhIGZvcmEgZG8gYm9zcXVlLCBtYXMgcHJlY2lzYW0gYXRpdsOhLWxvLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzUvNV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy81LzVfMi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuICAgIG5ldyBDaGFwdGVyKFtcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBWaWxhcmVqbyBTZW0gVmlkYVwiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiSGlyb3NoaSBlIGNvbXBhbmhpYSBlbWVyZ2VtIGRvIHRvcmlpIG3DoWdpY28gZSBjaGVnYW0gYW8gUmVpbm8gZGFzIFNvbWJyYXMsIG9uZGUgYXMgY29pc2FzIG7Do28gcG9zc3VlbSB2aWRhIG5lbSBjb3IuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIHPDo28gcmVjZWJpZG9zIHBvciBBeWFtZSwgdW1hIHNhY2VyZG90aXNhIGUgbWVzdHJhIGRhIGNhbGlncmFmaWEgZSBkYSBwaW50dXJhIG3DoWdpY2EsIHF1ZSB0cmF6IHZpZGEgw6BzIGNvaXNhcyBjb20gc3VhIGFydGUuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNi82XzUuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBeWFtZSBleHBsaWNhIHF1ZSBwYXJhIGF2YW7Dp2FyLCBlbGVzIHByZWNpc2FtIHJlc3RhdXJhciBhIHZpZGEgZGUgdsOhcmlhcyDDoXJlYXMgcXVlIGZvcmFtIGRlc2JvdGFkYXMgcGVsb3MgY2FwYW5nYXMgZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzYvNl84LmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy82LzZfOC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIERhbsOnYSBkb3MgR3VlcnJlaXJvcyBkYXMgU29tYnJhc1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29tIGEgcHJpbWVpcmEgw6FyZWEgcmVzdGF1cmFkYSwgSGlyb3NoaSBlIHNldXMgYW1pZ29zIGNvbnRpbnVhbSBzdWEgam9ybmFkYSBlbSBidXNjYSBkYSBwcmluY2VzYSBlIHNlIGRlcGFyYW0gY29tIHVtIGdydXBvIGRlIGd1ZXJyZWlyb3MgZGFzIHNvbWJyYXMgZW0gdW0gcMOhdGlvIHNvbWJyaW8uXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBhZGVudHJhciBhIMOhcmVhLCBIaXJvc2hpIGRlc2NvYnJlIHF1ZSBhIGRhbsOnYSByaXR1YWzDrXN0aWNhIGRvcyBndWVycmVpcm9zIGRhcyBzb21icmFzIHBvZGUgZGVzYmxvcXVlYXIgcGFzc2FnZW5zIHNlY3JldGFzIHF1ZSBEYWljaGkgdHJhbmNvdS5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy83LzdfMy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvNy83XzMuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBGZXN0aXZhbCBkb3MgUMOhc3Nhcm9zIGRlIFBhcGVsXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJBbyBwYXNzYXIgcG9yIHVtYSBwYXNzYWdlbSBzZWNyZXRhIGRlc2Jsb3F1ZWFkYSBwZWxvcyBndWVycmVpcm9zIGRhcyBzb21icmFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGEgdW1hIGNpZGFkZSBvbmRlIGVzdMOhIGFjb250ZWNlbmRvIHVtIGZlc3RpdmFsIGRlIHDDoXNzYXJvcyBkZSBwYXBlbCAob3JpZ2FtaSkuXCIsIFxuICAgICAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzEuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgMTNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJFbGVzIGRlc2NvYnJlbSBxdWUgRGFpY2hpIGVzY29uZGV1IGNoYXZlcyBub3MgcMOhc3Nhcm9zIGRlIHBhcGVsIHBhcmEgdHJhbmNhciBvdXRyYXMgw6FyZWFzIGRvIHNldSBSZWluby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy84LzhfNy5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvOC84XzcuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIFwiQSkgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkMpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiY29ycmV0YSBDXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgY2hhbGxlbmdlQ2FsbGJhY2tcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgbmV3IFNjZW5lKFwiTyBSZXNnYXRlIGRhIFByaW5jZXNhXCIsIFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIG5ldyBTdWJTY2VuZShcbiAgICAgICAgICAgICAgICAgICAgXCJDb20gdG9kYXMgYXMgw6FyZWFzIHJlc3RhdXJhZGFzIGUgY2hhdmVzIGVuY29udHJhZGFzLCBIaXJvc2hpIGUgc2V1cyBhbWlnb3MgY2hlZ2FtIGFvIGNhc3RlbG8gZGUgRGFpY2hpLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzkvOV8yLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQWtlbWkgZXN0w6EgcHJlc2EgZW0gdW1hIGNlbGEgZ2lnYW50ZSBkZW50cm8gZG8gY2FzdGVsbywgY2VyY2FkbyBwb3IgZm9nby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgICAgICA4XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBuZXcgQ2hhbGxlbmdlKFxuICAgICAgICAgICAgICAgIFwiVGV4dG8gZG8gZGVzYWZpb1wiLFxuICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy85LzlfNi5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBuZXcgU2NlbmUoXCJBIENlbGVicmHDp8Ojb1wiLCBcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXDDs3Mgc2FsdmFyIGEgUHJpbmNlc2EgQWtlbWkgZSBkZXJyb3RhciBEYWljaGksIEhpcm9zaGkgZSBzZXVzIGFtaWdvcyByZXRvcm5hbSBhbyBSZWlubyBkYSBMdXogcGFyYSB1bWEgZ3JhbmRlIGNlbGVicmHDp8Ojby5cIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYXNzZXRzL2ltYWdlcy9jZW5hcy8xMC8xMF8xLmpwZWdcIiwgXG4gICAgICAgICAgICAgICAgICAgIDEwXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBuZXcgU3ViU2NlbmUoXG4gICAgICAgICAgICAgICAgICAgIFwiQXlhbWUgb3JnYW5pemEgdW1hIGZlc3RhIHBhcmEgb3MgaGVyw7NpcyBjb21lbW9yYXJlbSBhIHZpdMOzcmlhLlwiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1hZ2VzL2NlbmFzLzEwLzEwXzQuanBlZ1wiLCBcbiAgICAgICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbmV3IENoYWxsZW5nZShcbiAgICAgICAgICAgICAgICBcIlRleHRvIGRvIGRlc2FmaW9cIixcbiAgICAgICAgICAgICAgICBcImFzc2V0cy9pbWFnZXMvY2VuYXMvMTAvMTBfNC5qcGVnXCIsIFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgXCJBKSBhbHRlcm5hdGl2YVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkIpIGFsdGVybmF0aXZhXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQykgYWx0ZXJuYXRpdmFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjb3JyZXRhIENcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjaGFsbGVuZ2VDYWxsYmFja1xuICAgICAgICAgICAgKVxuICAgICAgICApLFxuICAgIF0pLFxuXTtcblxuY29uc3Qgc3RvcnkgPSBuZXcgU3RvcnkoXCJBIEF2ZW50dXJhIGRlIEhpcm9zaGkgbm8gUmVpbm8gZGFzIFNvbWJyYXNcIiwgY2hhcHRlcnMpO1xuY29uc3QgZ2FtZSA9IG5ldyBHYW1lUGxheShzdG9yeSwgYXBwRWwsIGxpZmVFbCwgXCJub3JtYWxcIik7XG5nYW1lLmdhbWVMb29wKCk7XG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sUUFBUSxDQUFDO0lBQ2xCLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEdBQUcsUUFBUSxFQUFFO1FBQ3pELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCOztJQUVELE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUN2QyxLQUFLLE1BQU0s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
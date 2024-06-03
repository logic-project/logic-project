import { GamePlay } from "./Game";
import { Story } from "./Story";
import { Chapter } from "./Chapter";
import { Scene } from "./Scene";
import { SubScene } from "./SubScene";
import { Challenge } from "./Challenge";


const appEl = document.getElementById("app");
const lifeEl = document.getElementById("life");

const challengeCallback = (sceneTitle, answer) => {
    console.log(`Scene: ${sceneTitle}`);
    console.log(`Answer: ${answer}`);
}

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



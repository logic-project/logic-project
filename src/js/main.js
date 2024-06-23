import { GamePlay } from "./Game";
import { Story } from "./Story";
import { Chapter } from "./Chapter";
import { Scene } from "./Scene";
import { SubScene } from "./SubScene";
import { Challenge } from "./Challenge";


const appEl = document.getElementById("app");
const scorePanelEl = document.getElementById("score_panel");
const lifeEl = document.getElementById("life");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start");
const startScreen = document.getElementById("start-screen");

const challengeCallback = (sceneTitle, answer) => {
    console.log(`Scene: ${sceneTitle}`);
    console.log(`Answer: ${answer}`);
}


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
                    12
                ),
                new SubScene(
                    "Eles descobrem que Daichi escondeu chaves nos pássaros de papel para trancar outras áreas do seu Reino.", 
                    "assets/images/cenas/8/8_7.jpeg", 
                    9
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
                    9
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
                    9
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


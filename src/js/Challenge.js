export class Challenge {
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
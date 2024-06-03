export class Challenge {
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
export class SubScene {
    constructor(text, image, duration) {
        this.text = text;
        this.image = image;
        this.duration = duration;
    }

    display() {
        return `
        <div class="subscene">
            <p>${this.text}</p>
            <img src="${this.image}" />
        </div>
        `
    }
 }
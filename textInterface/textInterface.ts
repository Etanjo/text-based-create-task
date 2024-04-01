import './textInterface.css';

const yesWords = ['y','yes','t','true','yup','yeah','yup'];
const noWords = ['n','false','no','nope','null'];

export class TextInterface {
  
  listener : (arg0: string)=>void | null;  
  outputQueue : [string,boolean?][];
  outputAnimationLength : number = 800;
  outputDelay : number = 300;
  
  private div : HTMLDivElement;
  private inputEl : HTMLDivElement;
  private outputEl : HTMLDivElement;
  private placeholderEl : HTMLDivElement;
  private inputWrap : HTMLDivElement;
  private outputting : boolean;
  
  constructor (element = document.body) {
    this.outputQueue = [];
    this.div = document.createElement('div');
    this.div.classList.add('text-interface');
    element.appendChild(
      this.div
    );
    this.div.innerHTML = `
      <h2 class="ti-title">Text Interface</h2>
      <div class="output">
      </div>
      <div class="input-wrap">
          <div 
             class="input" 
             contenteditable 
             placeholder="Type here...">
          </div>
          <div class="placeholder">Type and hit return...</div>
      </div>
    `
    this.inputWrap = this.div.querySelector('.input-wrap');
    this.inputEl = this.div.querySelector('.input');
    this.outputEl = this.div.querySelector('.output');
    this.placeholderEl = this.div.querySelector('.placeholder');
    this.setupInputListener();
    //this.inputEl.focus();
  }

  setTitle (text) {
    this.div.querySelector('.ti-title')
      .textContent = text;
  }

  clear () {
    this.outputEl.innerHTML = '';
  }
  
  async readChoice (choices :string [],
                  prompt='Choose one of the following:', error='You must choose one of the options!') {
    let n = 0;
    this.output(prompt);
    for (let n=0; n<choices.length; n++) {
      this.output(`${n+1}. ${choices[n]}`)
    }
    this.output('Type the number of your choice');    
    let textInput = await this.readText();
    if (choices.indexOf(textInput)>-1) {
      return textInput;
    }
    textInput = textInput.replace(/\D/g,'');
    if (textInput === '') {
      this.output(error);
      let correction = await this.readChoice(choices,prompt,error);
      return correction;
    }
    let number = Number(textInput);
    if (!isNaN(number) && number <= choices.length && number > 0) {
      return choices[Math.floor(number)-1];
    } else {
      this.output(error);
      let correction = await this.readChoice(choices,prompt,error);
      return correction
    }
  }
  
  async readYesOrNo (errorMessage = 'Say yes or no!') {    
    let text : string = await this.readText();
    text = text.toLowerCase();
    text = text.replace(/\s+/,'');
    if (yesWords.indexOf(text)>-1) {
      return true;
    }
    
    if (noWords.indexOf(text)>-1) {
      return false
    }
    else {
      this.output(errorMessage);
      return await this.readYesOrNo(errorMessage);
    }
    
  }

  async readNumber (errorMessage = 'Please type a number') : Promise<number> {
    let text = await this.readText();
    let number = Number(text);
    if (isNaN(number)) {
      this.output(errorMessage);
      return this.readNumber(errorMessage);
    } else {
      return number;
    }    
  }
  
  readText () : Promise<string> {
    //this.inputEl.focus();
    this.inputWrap.classList.add('active');
    return new Promise(
      (resolve, reject) => {
        this.listener = resolve
      }
    )
  }
  output (text, echo=false) {
    /* If we are already outputting, wait... */
    if (this.outputting) {
      this.outputQueue.push([text,echo]);
    } else {      
      let output = document.createElement('div')
      output.classList.add('output');
      if (echo) {
        output.classList.add('echo')
      }
      if (!this.outputAnimationLength || echo) {
        output.textContent = text;
      } else {
        this.outputting = true;
        let delay = this.outputAnimationLength / text.length;
        const animateOutput = () => {          
          output.textContent += text[0] || '';
          text = text.substr(1);
          if (text.length) {
            setTimeout(
              animateOutput,
              delay
            )
          } else {
            this.outputting = false;
            if (this.outputQueue.length) {
              let next = this.outputQueue[0];
              this.outputQueue = this.outputQueue.slice(1);
              this.output(...next);
            }
          }
        }                      
        setTimeout(animateOutput,this.outputDelay)
      }
      this.outputEl.appendChild(output);
    }
  }
  
  private setupInputListener () {
    this.inputEl.addEventListener(
      'keypress',
      (event)=>{
        let isEnter = event.code == 'Enter';
        if (isEnter) {
          let input = this.inputEl.textContent.replace(/\n$/,'');
          this.output(input,true)
          if (this.listener) {
            this.listener(input);
            this.listener = null;
          }
          this.inputWrap.classList.remove('active');
          setTimeout(
            ()=>{
              this.inputEl.textContent = '';
            },
            1
          ); // after input fires
          
        }
      }            
    );
    this.placeholderEl.addEventListener(
      'click',
      ()=>this.inputEl.focus()
    )
  }

  
  
  
}
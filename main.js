import './style.css'
import {TextInterface} from './textInterface';

// Create a new "Text Interface" 
let ti = new TextInterface();
let words = []
let removedWords = []
let spinning = false

function wordAdding(word,number){
    for(let i=0;i<number;i++){
    words.push(word)
}
console.log(words)
}

function restartWheel(){
ti.clear()
words = []
removedWords = []
spinning = false
startProcess()
console.log("Restarted")
}

async function spinWheel(){
    while(spinning==true){
        ti.clear()
        let selection
        ti.output("Are you ready to spin?")
        if(await ti.readYesOrNo()){
         let randomNum = Math.floor(Math.random()*words.length)
         selection = words[randomNum]
         let choices = [`Remove ${selection}`,'Spin Again']
         ti.output(`The selection was: ${selection}! What do you want to do next?`)
         if(await ti.readChoice(choices) == choices[0]){
            removedWords.push(selection)
            words = words.splice(randomNum,1)
            console.log(words)
            console.log(removedWords)
            
         }
         if(words.length <=1){
            let endChoices = ['Start over with the same words', 'Make a New Wheel']
            if(words.length > 0){
                endChoices.push('Spin again')
            }
            ti.output("It seems like you're done spinning, what would you like to do?")
            let answer = await ti.readChoice(endChoices)
            if( answer ==  endChoices[0]){
                words = removedWords
            }else if(answer == endChoices[1]){
                spinning = false
                restartWheel()
                return
            }else{

            }
        }
        }
  
    }
}

async function startProcess(){
let addingWords = false

ti.output('Are you ready to begin?')
if(await ti.readYesOrNo()){
    addingWords=true
}
while(addingWords == true){
    ti.clear()
    ti.output("What do you want to add?")
    let newWord = await ti.readText()
    ti.output("Do you want more than one?")
    let num
    if(await ti.readYesOrNo()){
        ti.output("How many")
        num = await ti.readNumber()
    }else{
        num = 1
    }
    wordAdding(newWord,num)
    ti.output(`${newWord} added ${num} times, would you like to add more words?`)
    if(await ti.readYesOrNo() == false){
        ti.clear()
        spinning = true
        addingWords=false
        spinWheel()
        return
    }else{
        ti.clear()
    }
}
}
startProcess()
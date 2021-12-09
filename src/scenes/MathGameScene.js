var questionNumber = 2;
var question;
var totalQuestion = 5;
var curQuestion = 0;

var circleGreen;
var crossRed = [];

var quenstionText = [];
var answer = [];

var time = 7;
var timeEvent;

var isNext = false;
var isGameOver = false;

export default class MathGame extends Phaser.Scene{
    constructor() {
        super("MATHSCENE")
    }

    preload(){
        this.load.image("bg_question", "assets/background/bg_question.png");
        this.load.image("bg_answer", "assets/background/bg_answer.png");
        this.load.bitmapFont('MainFont', 'assets/font/MainFont.png', 'assets/font/MainFont.xml');
    }
    
    create(){
        var marginLeft = 10;
        var gap = 10;
        var graphics = this.add.graphics();
        this.add.image()
        function Question(x, y, questionNumber, time, scene){
            this.x = x;
            this.y = y;
            this.background = scene.add.image(x, y, "bg_question")
            this.questionNumber = scene.add.bitmapText(x - this.background._displayOriginX + 5, y - this.background._displayOriginY / 3 + 13, 'MainFont', '');
            this.text =  scene.add.bitmapText(x , y + 25, 'MainFont', '').setOrigin(0.5, 0.5);
            this.time = scene.add.bitmapText(x , y - 5, 'MainFont', '').setOrigin(0.5, 0.5).setScale(0.7, 0.7);
        }
        question = new Question(this.renderer.width / 2, 50, questionNumber, time,this);
        function Answer(x, y, scene){
            this.x = x;
            this.y = y;
            this.background = scene.add.image(x, y, "bg_answer")
            this.text = scene.add.bitmapText(x, y, 'MainFont', '').setOrigin(0.5, 0.5);
        }
        answer.push(new Answer(this.renderer.width / 5 - marginLeft, this.renderer.height / 4 * 3, this));
        answer.push(new Answer(this.renderer.width / 5 * 2 - marginLeft + gap, this.renderer.height / 4 * 3, this));
        answer.push(new Answer(this.renderer.width / 5 * 3 - marginLeft + gap * 2, this.renderer.height / 4 * 3, this));
        answer.push(new Answer(this.renderer.width / 5 * 4 - marginLeft + gap * 3, this.renderer.height / 4 * 3, this));
        
        circleGreen = this.add.circle(200, 200, 35).setVisible(false);
        circleGreen.setStrokeStyle(10, 0x00ff00);

        crossRed.push( this.add.line(100, 100, 0, 0, 50, 50, 0xFF0000, 0.9).setLineWidth(10).setVisible(false))
        crossRed.push( this.add.line(100, 100, 0, 50, 50, 0, 0xFF0000, 0.9).setLineWidth(10).setVisible(false))
        quenstionText = this.generateQuestion(totalQuestion);
        this.setGame()

    }   

    update(){       
        
    }

    setQuestionNumber(questionNumber){
        question.questionNumber.setText('Question ' + questionNumber + ': ');
    }

    setQuestion(questionString){
        question.text.setText(questionString);
    }

    setAnswers(answersString){
        for (let i = 0; i < 4; i++){
            answer[i].text.setText(answersString[i])
        }
    }

    caculateQuestion(questionString){
        if (questionString.indexOf("x") != -1){
            questionString = questionString.replace(questionString.substr(questionString.indexOf("x") - 2, questionString.indexOf("x") + 3)
            , parseInt(questionString.substr(questionString.indexOf("x") - 2, questionString.indexOf("x") - 1))
            * parseInt(questionString.substr(questionString.indexOf("x") + 2, questionString.indexOf("x") + 3)))
        }
            
        var qsSplit = questionString.split(" ");
        var rs = 0;
        for (let i = 0; i < qsSplit.length; i++){
            if (i == 0){
                rs += parseInt(qsSplit[i]);
            }else if (i % 2 ==0){
                switch(qsSplit[i - 1]){
                    case "+":
                        rs += parseInt(qsSplit[i]);
                        break;
                    case "-":
                        rs -= parseInt(qsSplit[i]);
                        break;
                }
            }
        }
        return rs;
    }

    findCorrectAnswer(correctAnswer){
        for (let i = 0; i < 4; i++){
            answer[i].background._events.pointerdown = [];
            if (parseInt(answer[i].text._text) == correctAnswer){
                answer[i].background.setInteractive().once("pointerdown", () =>{
                    isNext = true;
                    answer[i].background.once("pointerup", () =>{
                        answer[i].background._events.pointerdown = [];
                        if (isNext){
                            this.setQuestion(question.text._text + answer[i].text._text)
                            circleGreen.x = question.text.x + question.text._displayOriginX - 5;
                            circleGreen.y = question.text.y;
                            circleGreen.setVisible(true);
                            timeEvent.destroy();
                            answer[i].background.disableInteractive();
                            this.time.delayedCall(2000, () => {
                                curQuestion++;
                                circleGreen.setVisible(false);
                                this.setGame(); 
                            })
                            isNext = false;
                        }
                    })
                })
            }else{
                answer[i].background.setInteractive().once("pointerdown", () =>{
                    isNext = true;
                    answer[i].background.once("pointerup", () =>{
                        answer[i].background._events.pointerdown = [];
                        if (isNext){
                            crossRed[0].x = question.text.x + question.text._displayOriginX - 5;
                            crossRed[1].x = question.text.x + question.text._displayOriginX - 5;
                            crossRed[0].y = question.text.y;
                            crossRed[1].y = question.text.y;
                            crossRed[0].setVisible(true);
                            crossRed[1].setVisible(true);
                            timeEvent.destroy();
                            answer[i].background.disableInteractive();
                            this.time.delayedCall(2000, () => {
                                crossRed[0].setVisible(false);
                                crossRed[1].setVisible(false);
                                curQuestion++;
                                this.setGame(); 
                            })
                            isNext = false;
                        }
                    })
                })
            }
        }
    }

    generateQuestion(totalQuestion){
        var rs = [];
        var level = ["+-", "++-", "++--", "+-x", "++-x"]
        var curLevel = 1;
        for (let i = 1; i <= totalQuestion; i++){
            var question = "";
            question = String(Math.floor(Math.random() * 9) + 1) + " ";
            for (let j = 0; j < level[curLevel - 1].length; j++){
                question = question + level[curLevel - 1].substr(j, 1) + " " + String(Math.floor(Math.random() * 9) + 1) + " ";
            }
            question += "= "
            rs.push(question)
            if (i >= totalQuestion * (curLevel / level.length))
            {
                curLevel = curLevel > level.length ? 5 : curLevel + 1;
            }
        }
        return rs;
    }

    generateAnswers(correctAnswer){
        var rs = [];
        var positionCorrect = Math.floor(Math.random() * 4);
        var errorCorrect = 2;
        for (let i = parseInt(correctAnswer) - positionCorrect * errorCorrect; i < correctAnswer + (4 - positionCorrect) * errorCorrect; i+= errorCorrect){
            rs.push(i);
        }
        return rs;
    }

    setGame(){
        if (curQuestion >= quenstionText.length){
            this.gameOver();
            return;
        }
        this.setQuestionNumber(curQuestion + 1);
        this.setQuestion(quenstionText[curQuestion]);
        var answerNumber = this.caculateQuestion(quenstionText[curQuestion]);
        this.setAnswers(this.generateAnswers(answerNumber));
        this.findCorrectAnswer(answerNumber)
        this.countdownTime(time);
    }

    countdownTime(time){
        question.time.setText(time);
        timeEvent = this.time.addEvent({
            delay: 1000,
            startAt: 0,
            repeat: time,
            callback: () => {
                question.time.setText(timeEvent.getRepeatCount());
                if (timeEvent.getRepeatCount() == 0){
                    crossRed[0].x = question.text.x + question.text._displayOriginX - 5;
                    crossRed[1].x = question.text.x + question.text._displayOriginX - 5;
                    crossRed[0].y = question.text.y;
                    crossRed[1].y = question.text.y;
                    crossRed[0].setVisible(true);
                    crossRed[1].setVisible(true);
                    this.time.delayedCall(2000, () => {
                        crossRed[0].setVisible(false);
                        crossRed[1].setVisible(false);
                        curQuestion++;
                        if (curQuestion > quenstionText.length){
                            this.gameOver();
                            return;
                        }
                        this.setGame(); 
                    })
                }
            },
        })
    }

    gameOver(){
        // this.scene.restart()
        isGameOver = true;
        // this.scene.pause("MATHSCENE")
        // this.scene.restart();   
        this.scene.stop()
    }

}
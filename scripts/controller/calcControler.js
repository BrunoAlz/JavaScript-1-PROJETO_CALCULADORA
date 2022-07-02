// Criação da Classe CalcControler
class CalcControler{
    // Método construtor
    constructor(){
        // VARIAVEIS
        // var displayCalc = "0";
        // var currentDate;
        
        // ATRIBUTOS
        // _ Significa que o Atributo é privado
        this._audio = new Audio('/click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEL = document.querySelector('#display');
        this._dateEL = document.querySelector('#data');
        this._timeEL = document.querySelector('#hora');

        this._currentDate; 
        this.initialize();       
        this.initButtonsEvents();      
        this.initKeyboard(); 
    }

    async copyToClipboard() {
        await navigator.clipboard.writeText(this.displayCalc)
        
    }
 
    async pastFromClipboard() {
        let text = await navigator.clipboard.readText();
        this.displayCalc = parseFloat(text);
    }

    // Função para inicializar a página
    initialize(){

        this.setDisplayDateTime();

        // Função para pegar data e hora atual
        setInterval(() => {
            // Pegando a data e passando a localidade, que foi setada no construtor
            this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
            // Pegando a hora e passando a localidade que foi setada no construtor
            this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
            // A função set interval vai executar a cada segundo, simulando perfeitamente um relógio
        }, 1000);

        this.setLastNumberToDisplay();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dbclick', e => {
                e.toggleAudio();
            })
        })
    }

    toggleAudio(){
       this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    // capturar os eventos de teclado
    initKeyboard(){

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backspace':
                    this.clearEntry();
                    break;
    
                case '+':                    
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
    
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case '.':
                case ',':
                    this.addDot();
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
    
                default:
                    this.setError();
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;    
            }

        });

    }

    // Função para adicionar mutiplos eventos ao mesmo botão
    // Recebe o elemento, os eventos e a função que será executada
    addEventListenerAll(element, events, func){
        // pega os eventos e separa a String em um array, depois faz um foreach por cada evento
        events.split(' ').forEach(event => {
            // para cada evento, adicionada o addEventListener e a função
            element.addEventListener(event, func);
        });
    }

    // metodo para limpar toda calculadora
    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay(); 
    }
    
    // Metodo para limpar a ultima entrada
    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay(); 
    }

    getLastOperation(){
        // Pega o ultimo objeto do array
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value){
        this._operation[this._operation.length-1] = value
    }

    isOperator(value){
        // verifica se o valor é um dos operadores do array, e retorna true ou false
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);       
    }

    pushOperation(value){

        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();
        }
    }

    getResult(){
        try {            
            return eval(this._operation.join(""));
        }catch(e){
            setTimeout(() => {
                this.setError();
            }, 1);
        }
    };

    calc(){

        let last = '';
        
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3) {

            last = this._operation.pop();

            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        }
        
        let result = this.getResult();

        if (last == '%') {

            result /= 100;

            this._operation = [result];

        } else {

            this._operation = [result];

            if (last) this._operation.push(last);

        }

        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true){

        let lastItem;

        for (let i = this._operation.length-1; i >= 0; i--){

            if (this.isOperator(this._operation[i]) == isOperator) {
    
                lastItem = this._operation[i];
    
                break;    
            }
        }

        if (!lastItem) {
            // If ternário Condição ? se Verdade  : falso
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;

    }

    setLastNumberToDisplay(){
        /*
        i = 0, enquanto i for menor ou igual a 100, incrementa i + 1
        */
        let lastNumber = this.getLastItem(false);
        
        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    };

    // Adicionar uma operação 
    addOperation(value){
        // Verifica se o value é uma String ou número
        if (isNaN(this.getLastOperation())){
            // String
            // se o ultimo valor for um operador
            if (this.isOperator(value)){
                //  Troca o operador
                this.setLastOperation(value)

            } else if (isNaN(value)){
                
            } else {

                this.pushOperation(value);
                // Atualizar o Display
                this.setLastNumberToDisplay();            
            }

        }else{

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {                    
                // Número
                // Se ultimo valor digitado for um número, converte para string e concatena com os numero digitados
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                // Atualizar o Display
                this.setLastNumberToDisplay();
            }
        }

    };    

    // Apresentar erro
    setError(){
        this.displayCalc = 'Error';
    };

    addDot(){
        // guarda a ultima operação na variavel
        let lastOperation = this.getLastOperation();

        // verifica se a ultima operação já possui um ., se sim sai do if
        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.')
        }else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    };

    execBtn(value){

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;

        }

    }

    // Função para capturar os Eventos dos Botões
    initButtonsEvents(){
        //  pega todos os botões "g" que são filhos e estão dentro da div id=buttons e id=parts
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        // Faz o laçõ para percorrer todos os buttons
        buttons.forEach((btn, index) => {
            // Adicionando a Escuta de Eventos nos botões, primeiro passamos o Evento = click
            this.addEventListenerAll(btn, 'click drag', e => {
                // Extrar apenas o valor da classe para a variavel
                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);
                
            });

            // Adicionando o evento para mudar o cursor para pointer
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer"
            });
            
        });

    }

    setDisplayDateTime(){
        // Pegando a data e passando a localidade, que foi setada no construtor
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        // Pegando a hora e passando a localidade que foi setada no construtor
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
        // A função set interval vai executar a cada segundo, simulando perfeitamente um relógio
    }

    
    // GETTER E SETTERS

    get displayTime(){
        this._timeEL.innerHTML;
    }

    set displayTime(value){
        this._timeEL.innerHTML = value;
    }

    get displayDate(){
        this._dateEL.innerHTML;
    }    

    set displayDate(value){
        this._dateEL.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEL.innerHTML;
    }

    set displayCalc(value){

        if (value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEL.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

};
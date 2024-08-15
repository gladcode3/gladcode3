//required to provide inside glads object:
//name, user, code, skin, vstr, vagi, vint
//or an array with ids

class Simulation{
    constructor(args){
        this.args = args
        this.running = false

        if (args.terminal){
            this.terminal = args.terminal
            delete this.args.terminal
        }
    }

    async run(){
        this.running = true
        let call = $.post("back_simulation.php", {
            args: JSON.stringify(this.args)
        })
        this.call = call
        return new Promise( (resolve, reject) => {
            this.call.then( data => {
                // console.log(data)
                try {
                    data = JSON.parse(data)
                } catch(e){
                    if (this.terminal){
                        this.showTerm({error: e})
                    }

                    this.running = false
                    reject({ error: e })
                }

                if (this.terminal){
                    this.showTerm(data)
                }

                this.running = false
                this.hash = data
                resolve(data)
            })
        })
    }

    abort(){
        this.running = false
        this.call.abort()
    }

    showTerm(data){
        if (data.error){
            let error = data.error.split("/usercode/").join("");
            for (let i in this.args.glads){
                let glad = this.args.glads[i]
                if (glad.name){
                    error = error.split(`code${i}.c`).join(`<span>${glad.name}</span>`);
                    error = error.split(`code${i}.py`).join(`<span>${glad.name}</span>`);
                }
                else{
                    var pattern = /setName\("([\w\W]*?)"\)/;
                    var match = glad.match(pattern);
                    if (match){ 
                        error = error.split(`code${i}.c`).join(`<span>${match[1]}</span>`);
                        error = error.split(`code${i}.py`).join(`<span>${match[1]}</span>`);
                    }
                }
            }
            var pattern = /\\n/g;
            error = error.replace(pattern, '\n');
            showTerminal("ERRO DE SINTAXE", error);
            console.log(data)
        }
        else if (data.output == "CLIENT TIMEOUT"){
            showTerminal("ERRO NA SIMULAÇÃO","A gladCode está tendo problemas entre a conexão do simulador e os gladiadores. Por favor, reporte este problema para <a href='mailto:contato@gladcode.dev'><span>contato@gladcode.dev</span></a>");
            console.log(data)
        }
        else if (data.output.indexOf("timed out") != -1){
            var glad = data.output.split("Gladiator ")[1].split(" timed out")[0];
            showTerminal("GLADIADOR EM LOOP", "O código do gladiador <span>"+ glad +"</span> está em uma repetição da qual não consegue sair.\nEle foi desativado para não comprometer a simulação.\n\nRevise o código-fonte e tente novamente.");
            console.log(data)
        }
    }
}

var ajaxcall;

async function runSimulation(args) {
    if (ajaxcall)
        ajaxcall.abort();
    var glads = args.glads;
    
    //console.log(glads);
    var response = $.Deferred();
    ajaxcall = $.post("back_simulation.php", {
        args: JSON.stringify(args),
    })
    .done(function(data){
        // console.log(data);
        var jsonerror;
        try{
            JSON.parse(data);
        }
        catch(e){
            jsonerror = e;
        }
            
        if (jsonerror){
            showTerminal("ERRO EM TEMPO DE EXECUÇÃO", "Algum de seus gladiadores ocasionou um erro na simulação enquanto ela estava sendo executada.\nVerifique seus códigos-fonte e tente novamente.");
            console.log("ERROR: "+jsonerror);
            console.log("JSON: "+data);
            return response.resolve("ERROR");
        }
        else if (JSON.parse(data)){
            data = JSON.parse(data);
            var simulation = data.simulation;
            var error = data.error;
            var output = data.output;
            
            if (error != ""){
                if (error == "INVALID_ATTR"){
                    showTerminal("ERRO DE VALIDAÇÃO", "Os atributos de um dos gladiadores não são válidos ou sua pontuação não corresponde às regras da gladCode");
                }
                else{
                    error = error.split("/usercode/").join("");
                    for (var i in glads){
                        if (glads[i].name){
                            error = error.split(`code${i}.c`).join(`<span>${glads[i].name}</span>`);
                            error = error.split(`code${i}.py`).join(`<span>${glads[i].name}</span>`);
                        }
                        else{
                            var pattern = /setName\("([\w\W]*?)"\)/;
                            var match = glads[i].match(pattern);
                            if (match){ 
                                error = error.split(`code${i}.c`).join(`<span>${match[1]}</span>`);
                                error = error.split(`code${i}.py`).join(`<span>${match[1]}</span>`);
                            }
                        }
                    }
                    var pattern = /\\n/g;
                    error = error.replace(pattern, '\n');

                    showTerminal("ERRO DE SINTAXE", error);
                }
                return response.resolve("ERROR");
            }
            else if (simulation.length > 0){
                if (output == "CLIENT TIMEOUT"){
                    showTerminal("ERRO NA SIMULAÇÃO","A gladCode está tendo problemas entre a conexão do simulador e os gladiadores. Por favor, reporte este problema para <a href='mailto:contato@gladcode.dev'><span>contato@gladcode.dev</span></a>");
                    return response.resolve("ERROR");
                }
                else if (output.indexOf("timed out") != -1){
                    var glad = output.split("Gladiator ")[1].split(" timed out")[0];
                    showTerminal("GLADIADOR EM LOOP", "O código do gladiador <span>"+ glad +"</span> está em uma repetição da qual não consegue sair.\nEle foi desativado para não comprometer a simulação.\n\nRevise o código-fonte e tente novamente.");
                    return response.resolve("ERROR");
                }
                else{
                    if (output != "")
                        console.log("MENSAGEM: "+ output);
                    
                    //console.log(simulation[0]);
                    
                    return response.resolve(simulation);
                    //data returned is string json, with skins of each gladiator in simulation[0].glads[i].skin
                }
            }
        }
        else
            return response.resolve(false);
    });
    
    return response.promise();
}

class progressButton {
    constructor(obj, text){
        this.oldhtml = obj.html();

        obj.html("<div id='bar'></div><div id='oldcontent'></div>");
        obj.find('#bar').css({
            'background-color':'#00638d',
            'width':'0px',
            'height':'100%',
            'border-radius':'3px'
        });
        obj.prop('disabled','true');
        obj.css('padding','0');
        obj.append("<div id='oldcontent'></div>");
        $('#oldcontent').css({
            'display':'flex',
            'align-items':'center',
            'justify-content':'center',
            'width':'100%',
            'height':'100%',
            'margin-top':obj.outerHeight()*-1
        });
        
        this.bsize = 0;
        this.obj = obj;
        var self = this;
        var roul = 0, rcont = 0;
        
        this.progint = setInterval(function(){
            var maxtime = 20;
            var uni = obj.width() / (maxtime * 100);
            self.bsize += uni;
            obj.find('#bar').width(self.bsize.toFixed(0));
            obj.find('#oldcontent').html(text[roul]);
            rcont++;
            if (rcont % 200 == 0)
                roul = (roul + 1) % text.length;
            if (obj.find('#bar').width() >= obj.width()){
                self.kill();
                showTerminal("ERRO DE CONEXÃO","Falha ao obter resposta do servidor dentro do tempo limite.");	
                if (ajaxcall)
                    ajaxcall.abort();
                //obj.click();
                
            }
        }, 10);
    }
    
    kill(){
        clearInterval(this.progint);
        this.obj.html(this.oldhtml);
        this.obj.removeAttr('disabled');
        $('#oldcontent').remove();
    }
    
    set(text, porc){
        this.obj.html("<div id='bar'></div>");
        this.obj.find('#bar').css({'background-color':'#00638d','width':'0px','height':'100%','border-radius':'3px'});
        this.obj.prop('disabled','true');
        this.obj.css('padding','0');
        this.obj.append("<div id='oldcontent'>"+ text +"</div>");
        $('#oldcontent').css({'margin':this.obj.css('margin'),'display':'flex','align-items':'center','justify-content':'center','position':'absolute','top':this.obj.position().top,'left':this.obj.position().left,'width':this.obj.width(),'height':this.obj.height()});
        this.bsize = this.obj.width() / 100 * porc;
        this.obj.find('#bar').width(this.bsize.toFixed(0));
    }

    isActive(){
        if (this.obj.find('#oldcontent').length > 0)
            return true;
        else
            return false;
    }
}

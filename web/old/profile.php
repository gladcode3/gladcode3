<!DOCTYPE html>

<?php
    session_start();
    if(!isset($_SESSION['user'])){
        if (isset($_GET['t'])){
            header("Location: index?login=". $_GET['t']);
        }
        else
            header("Location: index");
    }
?>

<html>
<head>
    <meta charset='utf-8' />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/gif" href="icon/gladcode_icon.png" />
    <title>gladCode - Perfil</title>
    <link href="https://fonts.googleapis.com/css?family=Acme|Roboto|Source+Code+Pro&display=swap" rel="stylesheet">
    <link type='text/css' rel='stylesheet' href='https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'/> 
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-coy.min.css" rel="stylesheet" type="text/css"/>

    <link rel='stylesheet' href="css/profile.css"/>
    <link rel='stylesheet' href="css/glad-card.css"/>
    <link rel='stylesheet' href="css/dialog.css"/>
    <link rel='stylesheet' href="css/chat.css"/>
    <link rel='stylesheet' href="css/croppie.css"/>
    <link rel='stylesheet' href="css/slider.css"/>
    <link rel='stylesheet' href="css/radio.css"/>
    <link rel='stylesheet' href="css/checkboxes.css"/>
    <link rel='stylesheet' href="css/table2.css"/>
    <link rel='stylesheet' href="css/header.css"/>
    
    <script src='https://code.jquery.com/jquery-3.4.1.min.js'></script>
    <script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'></script>
    <script src="https://widget.cloudinary.com/v2.0/global/all.js"></script>
    <script src="https://kit.fontawesome.com/c1a16f97ec.js" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/plugins/autoloader/prism-autoloader.min.js"></script>
    <script>Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/components/'</script>
    <script src="https://cdn.jsdelivr.net/npm/blockly@3.20200123.1/blockly.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/blockly@3.20200123.1/msg/pt-br.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/blockly@3.20200123.1/python.js"></script>
    
    <script src="script/assets.js"></script>
    <script src="script/dropzone.js"></script>
    <script src="script/croppie.js"></script>
    <script src="script/profile-tourn.js"></script>
    <script src="script/profile-train.js"></script>
    <script src="script/profile-report.js"></script>
    <script src="script/profile-rank.js"></script>
    <script src="script/profile-potions.js"></script>
    <script src="script/chat.js"></script>
    <script src="script/glad-card.js"></script>
    <script src="script/profile.js"></script>
    <script src="script/dialog.js"></script>
    <script src="script/radio.js"></script>
    <script src="script/runSim.js"></script>
    <script src="script/checkboxes.js"></script>
    <script src="script/stats_func.js"></script>
    <script src="script/emoji.js"></script>
    <script src="script/socket.js"></script>
    <script src="script/googlelogin.js"></script>
    <script src="script/header.js"></script>
    <script src="script/blocks.js"></script>
    
    </head>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-VT4EF5GTBP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-VT4EF5GTBP');
    </script>

<body>
    <?php
        include("header.php");
        if(isset($_GET['t']))
            echo "<div id='tab' hidden>". $_GET['t'] ."</div>";
        if(isset($_GET['s']))
            echo "<div id='subtab' hidden>". $_GET['s'] ."</div>";
    ?>
    <div id='frame'>
        <div id='menu'>
            <div id="profile-ui">
                <div id='picture'><img></div>
                <div id='info'>
                    <div id='nickname'></div>
                    <div id='stats'>
                        <div id='lvl'><img src='res/star.png'><span></span></div>
                        <div id='xp'><div id='filled'></div></div>
                    </div>
                </div>
            </div>	
            <div id='currencies' class='hidden'>
                <div class='curr' id='money' title='Créditos'><i class='fas fa-money-bill'></i><span>0,00</span></div>
                <div class='curr' id='silver' title='Prata'><i class='fas fa-coins'></i><span>0</span></div>
            </div>
            <div id='menu-buttons'>
                <div id='news' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/hand-bell.png'></div><span>{{news}}</span></div>
                <div id='profile' class='item'><div class='icon-frame'><img src='icon/profile.png'></div><span>{{profile}}</span></div>
                <div id='glads' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/face.png'></div><span>{{glads}}</span></div>
                <div id='potions' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/potion-tag.png'></div><span>POÇÕES</span></div>
                <div id='battle' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='sprite/images/swords.png'></div><span>{{battles}}</span></div>
                <div id='report' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/scroll.png'></div><span>{{reports}}</span></div>
                <div id='ranking' class='item'><div class='icon-frame'><img src='icon/winner-icon.png'></div><span>RANKING</span></div>
                <div id='messages' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/message.png'></div><span>{{messages}}</span></div>
                <div id='friends' class='item'><div class='notification empty'></div><div class='icon-frame'><img src='icon/friends.png'></div><span>{{friends}}</span></div>
                <div id='logout' class='item'><div class='icon-frame'><img src='icon/logout.png'></div><span>LOGOUT</span></div>
            </div>
            <div id='footer'></div>
        </div>
        <div id='panel'>
            <div class='content' data-menu='news'><div>
                <h2>Notícias da gladCode</h2>
                <div id='news-container'></div>
            </div></div>
            <div class='content' data-menu='profile'>
                <div id='profile-panel'>
                    <div id='nickname'>
                        <h2>Apelido</h2>
                        <h3>Escolha o nome pelo qual outros mestres de gladiadores o conhecerão</h3>
                        <input type='text' class='input' placeholder='apelido'>
                    </div>
                    <div id='picture'>
                        <h2>Foto de perfil</h2>
                        <h3>Escolha uma foto apropriada para um grande mestre de gladiadores</h3>
                        <div id='img-upload'></div>
                        <div id='img-preview-container'></div>
                        <img id='img-result'>
                        
                    </div>
                    <div id='language'>
                        <h3>Linguagem de programação preferencial</h3>
                        <select>
                            <option value='c'>C</option>
                            <option value='python'>Python</option>
                            <option value='blocks'>Blocos</option>
                        </select>
                    </div>
                    <div id='email'>
                        <h2>Preferências de email</h2>
                        <h3>Desejo receber um email quando:</h3>
                        <div id='pref-friend'><label><input type='checkbox' class='checkslider'>Outro usuário me enviar uma solicitação de amizade</label></div>
                        <div id='pref-message'><label><input type='checkbox' class='checkslider'>Outro usuário me enviar uma mensagem</label></div>
                        <div id='pref-update'><label><input type='checkbox' class='checkslider'>A gladCode receber uma atualização</label></div>
                        <div id='pref-duel'><label><input type='checkbox' class='checkslider'>Um amigo enviar um desafio para um duelo</label></div>
                        <div id='pref-tourn'><label><input type='checkbox' class='checkslider'>Começar um nova rodada de um torneio que participo</label></div>
                    </div>
                    <div id='button-container'>
                        <button class='button' id='save'>GRAVAR</button>
                    </div>
                </div>
            </div>
            <div class='content' data-menu='battle'>
                <div id='battle-container'>
                    <div id='battle-mode'>
                        <h2>Para qual modo de batalha deseja se inscrever?</h2>
                        <div id='button-container'>
                            <button id='ranked' class='button'><img src='icon/winner-icon.png'>Batalha Ranqueada</button>
                            <button id='duel' class='button'><div class='notification empty'></div><img src='sprite/images/swords.png'>Duelo de Gladiadores</button>
                            <button id='tourn' class='button'><img src='icon/tournament.png'>Torneio Personalizado</button>
                            <button id='train' class='button'><img src='icon/stars-stack.png'>Treino de equipes</button>
                        </div>
                    </div>
                    <div id='ranked' class='wrapper'>
                        <div class='container'>
                            <h2>Selecione o gladiador que deseja inscrever na arena</h2>
                            <div class='glad-card-container'></div>
                            <button id='match-find' class='button' disabled>PROCURAR ADVERSÁRIOS</button>
                        </div>
                    </div>
                    <div id='duel' class='wrapper'>
                        <div id='duel-challenge' class='hidden'>
                            <h2>Desafios para duelo</h2>
                            <div class='table'></div>
                        </div>
                        <div class='container'>
                            <h2>Amigo a ser desafido</h2>
                            <input class='input' type='text' placeholder='apelido-do-usuario'>
                            <div class='table' id='table-friends'></div>
                            <div id='button-container'>
                                <button id='challenge' class='button' disabled>DESAFIAR</button>
                            </div>
                        </div>
                    </div>
                    <div id='tourn' class='wrapper'>
                        <div class='container'>
                            <div class='title'>
                                <h2>Torneios públicos abertos</h2>
                                <div id='offset' class='open'><span class='start'>0</span> - <span class='end'>0</span> de <span class='total'>0</span><button id='prev'><i class='fas fa-chevron-left'></i></button><button id='next'><i class='fas fa-chevron-right'></i></button></div>
                            </div>
                            <div id='table-open' class='table'></div>
                            
                            <div id='mytourn' class='title'>
                                <h2>Meus torneios</h2>
                                <div id='offset' class='mine'><span class='start'>0</span> - <span class='end'>0</span> de <span class='total'>0</span><button id='prev'><i class='fas fa-chevron-left'></i></button><button id='next'><i class='fas fa-chevron-right'></i></button></div>
                            </div>
                            <div id='table-mytourn' class='table'></div>

                            <div id='button-container'>
                                <button id='create' class='button'>CRIAR UM TORNEIO</button>
                                <button id='join' class='button'>INGRESSAR EM UM TORNEIO</button>
                            </div>
                        </div>
                    </div>
                    <div id='train' class='wrapper'>
                        <div class='container'>
                            <div class='title manage'>
                                <h2>Treinos que gerencio</h2>
                                <div id='offset' class='manage'><span class='start'>0</span> - <span class='end'>0</span> de <span class='total'>0</span><button id='prev'><i class='fas fa-chevron-left'></i></button><button id='next'><i class='fas fa-chevron-right'></i></button></div>
                            </div>
                            <div id='table-manage' class='table'></div>
                            <div class='title part'>
                                <h2>Treinos que participo</h2>
                                <div id='offset' class='part'><span class='start'>0</span> - <span class='end'>0</span> de <span class='total'>0</span><button id='prev'><i class='fas fa-chevron-left'></i></button><button id='next'><i class='fas fa-chevron-right'></i></button></div>
                            </div>
                            <div id='table-part' class='table'></div>
                            <div id='button-container'>
                                <button id='create' class='button'>NOVO TREINO</button>
                                <button id='join' class='button'>PARTICIPAR DE TREINO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='content' data-menu='report'>
                <div id='report-container'>
                    <div id='bhist-container'>
                        <h2>Histórico de batalhas</h2>
                        <div id='tab-container'>
                            <div id='ranked' class='tab selected'><div class='notification empty'></div><span>Batalhas</span></div>
                            <div id='duel' class='tab'><div class='notification empty'></div><span>Duelos</span></div>
                            <div class='tab'><span>Favoritos</span></div>
                        </div>
                        <div class='table'></div>
                        <div id='post-table'>
                            <label id='unread'><input type="checkbox" class='radio'>Somente não lidos</label>
                            <div class='page-nav'>
                                <span></span> - <span></span> de <span></span>
                                <button id='prev'><i class='fas fa-chevron-left'></i></button>
                                <button id='next'><i class='fas fa-chevron-right'></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='content' data-menu='glads'>
                <div id='glads-container'>
                    <h2>Estes são seus gladiadores:</h2>
                    <div class='glad-card-container'></div>
                </div>
            </div>
            <div class='content' data-menu='potions'>
                <div id='apot-container'>
                    <div id='apot-panel'>
                        <h2>Apotecário <span class='highlight'>nível <span class='lvl'></span></span></h2>
                        <p>Aqui você pode encomendar poções para lhe auxiliar durante as batalhas ranqueadas.</p>
                        <p>As mercadorias encomendadas podem ser usadas por todos seus gladiadores durante <span class='highlight'><span class='duration'></span> horas</span>, uma vez por batalha.</p>
                        <p>Cada um de seus compartimentos dá direito a levar para batalha um item encomendado. Aumente seus níveis de mestre para desbloquear mais espaços.</p>
                        <div id='apot-info'>
                            <div class='col'>
                                <div class='row'>
                                    <div>Nível do apotecário:</div><div class='lvl highlight'></div>
                                </div>
                                <div class='row'>
                                    <div>Duração da encomenda:</div><div class='highlight'><span class='duration'></span>horas</div>
                                </div>
                                <div class='row'>
                                    <div>Custo para aprimorar:</div><div><span class='highlight cost'></span><i class='fas fa-coins silver'></i></div>
                                </div>
                            </div>
                            <div id='button-container' class='col'>
                                <button id='upgrade'>APRIMORAR</button>
                                <button id='browse'>VER POÇÕES</button>
                            </div>
                        </div>
                    </div>
                    <div id='my-pots'></div>
                </div>
            </div>
            <div class='content' data-menu='ranking'>
                <div id='ranking-container'>
                    <h2>Ranking</h2>
                    <div id='search'>
                        <i class="fas fa-search"></i>
                        <input type='text' class='input' placeholder='Pesquisa por gladiador ou mestre'>
                    </div>
                    <div id='tab-container'><div id='tab-general' class='tab selected'>Geral</div><div class='tab' id='add-tab'><i class='fas fa-plus'></i></div></div>
                    <div class='table'></div>
                    <div class='page-nav'>
                        <span></span> - <span></span> de <span></span>
                        <button id='prev'><i class='fas fa-chevron-left'></i></button>
                        <button id='next'><i class='fas fa-chevron-right'></i></button>
                    </div>
                </div>
            </div>
            <div class='content' data-menu='messages'>
                <div id='message-panel'>
                    <h2>Mensagens</h2>
                    <div class='table'></div>
                    <div id='page-title'>
                        <button id='prev'></button>
                        <span></span> - <span></span> de <span></span>
                        <button id='next'></button>
                    </div>
                </div>
            </div>
            <div class='content' data-menu='friends'>
                <div id='friend-panel'>
                    <div id='request' class='hidden'>
                        <h2>Convites pendentes</h2>
                        <div class='table'></div>
                    </div>
                    <div id='friends' class='hidden'>
                        <h2>Lista de amigos</h2>
                        <div class='table'></div>
                        <div class='options'>
                            <div class='message'><img src='icon/message.png'><span>Enviar mensagem</span></div>
                            <div class='duel'><img src='sprite/images/swords.png'><span>Desafiar para duelo</span></div>
                            <div class='unfriend'><img src='icon/unfriend.png'><span>Desfazer amizade</span></div>
                        </div>
                    </div>
                    <div id='search'>
                        <h2>Busca de usuários</h2>
                        <input type='text' class='input' placeholder='nome do usuário'>
                        <div class='table'></div>
                    </div>
                </div>
            </div>
        </div>
        <div id='right-panel'></div>
        <div id='chat-panel'></div>
    </div>
</body>
</html>
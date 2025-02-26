/*
get
request (adicionar amigos)
search
delete
add
filter

cod INT
user1 INT
user2 INT
pending TINYINT(1) [0, 1] 

=====
$sql = "
SELECT 
    a.cod, u.apelido, u.foto, u.lvl 
FROM 
    amizade a 
INNER JOIN 
    usuarios u ON u.id = a.usuario1 
WHERE 
    a.usuario2 = '$user' AND pendente = 1";


pending = []
where...

above takes the pending requests and groups the basic info on the pending array
/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/=/

$fields = "
a.cod, u.id, u.apelido, u.lvl, u.foto, TIMESTAMPDIFF(MINUTE,ativo,now()) as ultimoativo";
=these are select fields

$sql = "
SELECT 
    $fields 
FROM 
    amizade a 
INNER JOIN 
    usuarios u ON u.id = a.usuario1 
WHERE 
    a.usuario2 = '$user' AND 
    pendente = 0 
UNION SELECT 
    $fields 
FROM 
    amizade a 
INNER JOIN 
    usuarios u ON u.id = a.usuario2 
WHERE 
    a.usuario1 = '$user' AND
    pendente = 0";

=user2 é o próprio cara que tá vendo
=union select faz a mesma query mas trocando a perspectiva

confirmed = []
=essa query só se aplica se pendente é 0, que no caso é a lista de amigos do usuário

*/
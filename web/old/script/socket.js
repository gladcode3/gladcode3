var socket;
var serverURL = `//${window.location.hostname}:3000`;

$(document).ready( function(){
    try{
        socket = io(serverURL, { secure: window.location.protocol == 'https:' });
    }
    catch(e){
        console.log(e)
        socket = null;
    }
    // $.getScript(`${serverURL}/socket.io`, function(){
    // });
});

function admin_auth(obj){
    socket_request('login', obj).then( (res, err) => {
        if (err) return console.log(err);
        console.log(res);
        if (res.session == true){
            // window.location.reload();
        }
    });

    $.post("back_login.php", {
        action: "SET",
        admin: JSON.stringify(obj)
    }).done( function(data){
        console.log(data);
    }).fail((xht, status, error) => {
        console.log(xht, status, error)
    });
}

async function socket_request(route, data){
    return await $.ajax({
        type: "POST",
        url: `${serverURL}/${route}`,
        crossDomain: true,
        data: data,
        dataType: 'json',
        xhrFields: { withCredentials: true },
        success: (response) => response,
        error: (xhr, status) => status
    });
}

async function socket_ready(){
    async function isReady(){
        return await new Promise(resolve => {
            setTimeout(() => {
                if (socket && socket.connected)
                    resolve(true);
                else
                    resolve(false);
            }, 10);
        });
    }
    while (await isReady() === false);
    return socket;
}
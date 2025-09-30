// -----JS CODE-----
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"/// NEED TO ENABLE CAMERA KIT "}
//@ui {"widget":"label", "label":" IN PROJECTS SETTINGS => GENERAL /// "}
//@ui {"widget":"separator"}
///DON'T FORGET TO ENABLE "CAMERA KIT" IN "PROJECT SETTINGS" => "GENERAL"///
//@input Asset.RemoteServiceModule serviceModule;
//@input Asset.InternetModule internetModule

global.ServerMode = {Swift : 0, Web : 1}
global.Server = class{
    constructor(_serverMode){
        this._serverMode = this._serverMode = _serverMode !== undefined ? _serverMode : RepeatMode.Swift;
        this._server;
        this.InitServer(this._serverMode);
    }

    InitServer(id){
        switch(id){
            case 0:
                this._server = new Siwft()
            break;
            case 1:
                this._server = new Web()
            break;
        }
    }

    //FOR SWIFT SERVER
    //Send(payload, endpoint)

    //FOR WEB SERVER
    //Send(payload, url)
    Send(payload, base){
        this._server.Send(payload, base);
    }

    //FOR SWIFT SERVER
    //Send(payload, endpoint, onSuccess, onError)

    //FOR WEB SERVER
    //Send(payload, url, onSuccess, onError)
    Receive(endpoint, onSuccess, onError){
        this._server.Receive(endpoint, onSuccess, onError);
    }
}

class Siwft{
    constructor(){}

    Send(payload, endpoint){
        var request = global.RemoteApiRequest.create();
        request.endpoint = endpoint; // le nom de l'endpoint de l'API exposée
        request.parameters = payload; // objet avec les données à envoyer (toutes valeurs doivent être des string)
        
        script.serviceModule.performApiRequest(request, function(response) {
            if (response.statusCode !== 1) {
                print("Erreur d'envoi: Code " + response.statusCode);
                return;
            }
            print("Réponse serveur: " + response.body);
        });
    }

    Receive(endpoint, onSuccess, onError) {
        var request = global.RemoteApiRequest.create();
        request.endpoint = endpoint;

        script.serviceModule.performApiRequest(request, function(response) {
            if (response.statusCode !== 1) {
                print("Erreur de récupération: Code " + response.statusCode);
                if (onError) onError(response);
                return;
            }
            print("Données reçues: " + response.body);
            if (onSuccess) onSuccess(JSON.parse(response.body));
        });
    }
}

class Web{
    constructor(){}

    //let urlExample = 'https://psg-mirror-web.pages.dev/api/endpoint?end=showEnd&score=' + points.toString(); 
    Send(payload, url){
         if (
            typeof RemoteServiceHttpRequest !== "undefined"
            && typeof RemoteServiceHttpRequest.create !== "undefined"
        ) 
        {
            const request = RemoteServiceHttpRequest.create();
            
            request.url = url + payload.toString();
            request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;

            script.internetModule.performHttpRequest(request, function(response) {

            });
        }
        else{
            print("ERROR SERVER, NO CONNECTION");
        }
    }

    //let urlExample = 'https://psg-mirror-web.pages.dev/api/endpoint'
    Receive(url, onSuccess, onError){
        if (
            typeof RemoteServiceHttpRequest !== "undefined"
            && typeof RemoteServiceHttpRequest.create !== "undefined"
        ) {
            const request = RemoteServiceHttpRequest.create();
            request.url = url;
            request.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;

            script.internetModule.performHttpRequest(request, (response) => {
                if (response.statusCode === 200) {

                    print(response.body);
                    if (onSuccess) onSuccess(JSON.parse(response.body));

                } else if (response.statusCode === 400 && response.headers['x-camera-kit-error-type']) {
                    print(`Error: ${res.body}`);
                    if (onError) onError(response);
                } else {
                    print(`Error: Unexpected HTTP status code ${response.statusCode}.`);
                    if (onError) onError(response);
                }
            });
        }
        else{print("ERROR SERVER, NO CONNECTION")}
    }
}

///---EXAMPLES---///
//SWIFT//
/*
const swiftServer = new Server(ServerMode.Swift)

let dataToSend = "Next"
let endpoint = "TakePhoto"

swiftServer.Send(dataToSend, endpoint)

swiftServer.Receive("TakePhoto",
function success(responseData) {      print("Succès ! Données reçues : " + JSON.stringify(responseData));      } // Traite la réponse ici
, 
function error(err) {     print("Erreur dans l'appel serveur : " + JSON.stringify(err));    }) // Traite l’erreur ici
*/

//WEB//
/*
const webServ = new Server(ServerMode.Web)

let url = 'https://psg-mirror-web.pages.dev/api/endpoint?end=showEnd&score=';
let payload = 50

webServ.Send(payload, url)

webServ.Receive("https://psg-mirror-web.pages.dev/api/endpoint",
function success(responseData) {      print("Succès ! Données reçues : " + responseData.jersey);      } // Traite la réponse ici
, 
function error(err) {     print("Erreur dans l'appel serveur : " + err.example);    }) // Traite l’erreur ici
*/
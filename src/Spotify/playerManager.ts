// Old-Config
// const userHasSpotifyAPI = await vscode.window.showQuickPick([
//     { label: "No", value: false },
//     { label: "Si", value: true }
// ], {
//     canPickMany: false,
//     ignoreFocusOut: true,
//     title: "Configuracion",
//     prompt: "Ya tiene la api de Spotify?"
// });

// if (userHasSpotifyAPI) {

//     const client_id = await vscode.window.showInputBox({
//         prompt: 'Ingrese el Client ID de su API',
//         placeHolder: "g9b1kbd13s5a41c8acc5b7c2028dbfba",
//         ignoreFocusOut: true,
//         validateInput: (value) => {
//             if (!value || value === "") {
//                 return "Asegurese de ingresar su client_id";
//             }
//             return null;
//         },
//     });

//     const client_secret = await vscode.window.showInputBox({
//         prompt: 'Ingrese el Client Secret de su API',
//         placeHolder: "g9b1kbd13s5a41c8acc5b7c2028dbfba",
//         ignoreFocusOut: true,
//         validateInput: (value) => {
//             if (!value || value === "") {
//                 return "Asegurese de ingresar su client_secret";
//             }
//             return null;
//         },
//     });

//     if (client_id && client_secret) {
//         const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

//         spotify = new SpotifyAuth(client_id, client_secret, "http://127.0.0.1:5000/callback/");

//         const token = await spotify.auth();

//         dataManager.saveSpotifyData(token);
//     }

//     const uri = await vscode.window.showInputBox({
//         prompt: 'Ingresa el URI de Spotify (opcional - spotify:track:...)',
//         placeHolder: 'spotify:track:... o deja en blanco para reproducir lo que esté en pausa',
//         ignoreFocusOut: true
//     });

//     await config.update('alarmPath', uri || '', vscode.ConfigurationTarget.Global);
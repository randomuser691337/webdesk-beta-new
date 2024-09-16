var globcall;
// This is a clusterfuck of bullshit that needs to be rewritten eventually
var ptp = {
    go: async function (id) {
        let retryc = 0;

        async function attemptConnection() {
            sys.peer = new Peer(id);

            sys.peer.on('open', (peerId) => {
                ui.masschange('deskid', peerId);
                sys.deskid = peerId;
                console.log('<i> DeskID is online. ID: ' + sys.deskid);
            });

            sys.peer.on('error', async (err) => {
                console.log(`<!> whoops: ${err}`);
                if (!sys.deskid && retryc < 5) {
                    console.log('<!> DeskID failed to register, trying again...');
                    retryc++;
                    setTimeout(attemptConnection, 10000);
                } else if (retryc >= 5) {
                    console.log('<!> Maximum retry attempts reached. DeskID registration failed.');
                    wm.wal(`<p class="h3">WebDesk to WebDesk services are disabled</p><p>Your DeskID didn't register for some reason, therefore you can't use WebDrop, WebCall or Migration Assistant.</p><p>If you'd like, you can reboot to try again. Check your Internet too.</p>`, 'reboot()', 'Reboot');
                } else {
                    snack('Failed to connect.');
                }
            });

            sys.peer.on('connection', (dataConnection) => {
                dataConnection.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.type === 'request') {
                            console.log('Received request:', parsedData.message);
                            const response = {
                                response: sys.name
                            };

                            dataConnection.send(JSON.stringify(response));
                        }
                    } catch (err) {
                        console.error('Failed to parse data:', err);
                    }
                });

                dataConnection.on('error', (err) => {
                    console.error('Data connection error:', err);
                });

                dataConnection.on('close', () => {
                    console.log('<i> Data connection closed');
                });
            });

            sys.peer.on('call', (call) => {
                const showyourself = sys.peer.connect(call.peer);
                showyourself.on('open', () => {
                    showyourself.send(JSON.stringify({ type: 'request' }));
                });

                showyourself.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);

                        if (parsedData.response) {
                            wm.notif(`Call from ${parsedData.response}`, 'Answer?', function () {
                                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                                    call.answer(stream);
                                    call.on('stream', (remoteStream) => {
                                        app.webcall.answer(remoteStream, call, parsedData.response);
                                    });
                                }).catch((err) => {
                                    wm.notif('WebCall Error', 'Microphone access is denied, calling/answering might fail.');
                                    console.log(`<!> ${err}`);
                                });
                            });
                        }
                    } catch (err) {
                        console.error('Failed to parse data:', err);
                    }
                });

                showyourself.on('error', (err) => {
                    wm.notif('WebCall Error', err);
                });

                showyourself.on('close', () => {
                    console.log('Data connection closed');
                });
            });
        }

        attemptConnection();
    },
}

function handleData(conn, data) {
    if (sys.webdrop === true) {
        console.log('<i> Thing recieved!')
        if (data.name === "MigrationPackDeskFuck") {
            if (sys.setupd === false) {
                ui.sw('setupqs', 'setuprs'); restorefsold(data.file);
            }
        } else if (data.name === "MigrationPackDeskFuck++") {
            if (sys.setupd === false) {
                ui.sw('setupqs', 'setuprs'); restorefsold(data.file);
            }
        } else if (data.name === "YesImAlive-WebKey") {
            wm.notif(`${data.uname} accepted your WebDrop.`, 'WebDesk Services');
        } else if (data.name === "DesktoDeskMsg-WebKey") {
            wm.notif(data.file, 'WebDesk Services');
        } else if (data.name === "DeclineCall-WebKey") {
            fesw('caller3', 'caller1');
            snack('Your call was declined.');
        } else if (data === "Name and FUCKING address please") {
            conn.send(sys.user);
        } else {
            recb = data.file;
            recn = data.name;
            play('./assets/other/webdrop.ogg');
            wal(`<p class="h3">WebDrop</p><p><span class="med dropn">what</span> would like to share <span class="med dropf">what</span></p>`, `acceptdrop();custf('${data.id}', 'YesImAlive-WebKey');`, 'Accept', './assets/img/apps/webdrop.svg');
            masschange('dropn', data.uname);
            masschange('dropf', data.name);
        }
    } else {
        custf(data.id, 'DesktoDeskMsg-WebKey', `${deskid} isn't accepting WebDrops right now.`);
    }
}

async function compressfs() {
    return new Promise(async (resolve, reject) => {
        try {
            const zip = new JSZip();
            const transaction = db.transaction(['files'], 'readonly');
            const objectStore = transaction.objectStore('files');
            const request = objectStore.getAll();
            request.onsuccess = function (event) {
                const files = event.target.result;
                files.forEach(file => {
                    zip.file(file.path, file.value);
                });
                resolve(zip.generateAsync({ type: "blob" }));
            };
            request.onerror = function (event) {
                reject(event.target.errorCode);
            };
        } catch (error) {
            reject(error);
        }
    });
}

async function restorefs(zipBlob) {
    console.log('<i> Restore Stage 1: Prepare zip');
    try {
        ui.sw('quickstartwdsetup', 'quickstartwdgoing');
        const zip = await JSZip.loadAsync(zipBlob);
        const fileCount = Object.keys(zip.files).length;
        let filesDone = 0;
        console.log(`<i> Restore Stage 2: Open zip and extract ${fileCount} files to FS`);
        await Promise.all(Object.keys(zip.files).map(async filename => {
            console.log(`<i> Restoring file: ${filename}`);
            const file = zip.files[filename];
            const value = await file.async("string");
            fs.write(filename, value);
            filesDone++;
            ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: ${filename}`);
        }));
        ui.sw('quickstartwdgoing', 'setupdone');
    } catch (error) {
        console.error('Error during restoration:', error);
    }
}

async function restorefsold(zipBlob) {
    console.log('<i> Restore Stage 1: Prepare zip');
    try {
        ui.sw('quickstartwdsetup', 'quickstartwdgoing');
        const zip = await JSZip.loadAsync(zipBlob);
        const fileCount = Object.keys(zip.files).length;
        let filesDone = 0;
        console.log(`<i> Restore Stage 2: Open zip and extract ${fileCount} files to FS`);
        await Promise.all(Object.keys(zip.files).map(async filename => {
            console.log(`<i> Restoring file: ${filename}`);
            if (filename === "/user/info/name") {
                const file = zip.files[filename];
                const value = await file.async("string");
                fs.write('/user/info/name', value);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: Handling user data`);
            } else if (filename.includes('/system') || filename.includes('/user/info') || filename === '/user/oldhosts.json') {
                console.log(`<i> Skipped a file: ${filename}`);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: Skipped file: WebDesk specific`);
            } else {
                const file = zip.files[filename];
                const value = await file.async("string");
                fs.write(filename, value);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: ${filename}`);
            }
        }));
        ui.sw('quickstartwdgoing', 'setupdone');
    } catch (error) {
        console.error('Error during restoration:', error);
    }
}

function sends(name, file) {
    fname = name;
    fblob = file;
    opapp('sendf');
    masschange('fname', name);
}

function sendf(id) {
    try {
        custf(id, fname, fblob);
        snack('File has been sent.', 2500);
        play('./assets/other/woosh.ogg');
    } catch (error) {
        console.log('<!> Error while sending file:', error);
        snack('An error occurred while sending your file.', 2500);
    }
}

function custf(id, fname2, fblob2) {
    const dataToSend = {
        name: fname2,
        file: fblob2,
        uname: user,
        id: sys.deskid
    };

    try {
        const conn = peer.connect(id);

        conn.on('open', () => {
            conn.send(dataToSend);
            writejson(id);
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            snack('An error occurred while sending your file.', 2500);
        });
    } catch (error) {
        console.error('Error while sending file:', error);
        snack('An error occurred while sending your file.', 2500);
    }
}
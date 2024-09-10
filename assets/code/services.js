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

            sys.peer.on('connection', (conn) => {
                conn.on('data', (data) => {
                    handleData(conn, data);
                });
            });

            sys.peer.on('call', (call) => {
                console.log('Who the fuck')
            });
        }

        attemptConnection();
    },
}

function hrs(stream) {
    createAudioElement();
    audioElement.srcObject = stream;
    audioElement.play();
}


async function calldesk(remotePeerId) {
    try {
        custf(remotePeerId, 'WebCallName-WebKey', user);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream = stream;
        const call = peer.call(remotePeerId, localStream);
        call.on('stream', (remoteStream) => {
            hrs(remoteStream);
        });
        call.on('close', () => {
            removeAudioElement();
            endcall();
        });
        currentCall = call;
    } catch (err) {
        fesw('caller3', 'caller1');
        endcall();
        console.log('<!> Failed to get local stream', err);
        snack(`Couldn't call. Try reloading both WebDesks.`);
    }
}

function handleData(conn, data) {
    if (sys.webdrop === true) {
        console.log('<i> Thing recieved!')
        if (data.name === "MigrationPackDeskFuck") {
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
        } else if (data.name === "WebCallName-WebKey") {
            masschange('callname', data.file);
            callid = data.id;
            addcall(data.file, callid);
            console.log('<i> bounced names');
            setInterval(function () { masschange('callname', data.file); }, 300);
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
async function bootstage2(uid2, eepysleepy, migcheck, sd, installed) {
    try {
        await initscript('/system/apps.js');
        await initcss('/system/lib/layout1.css');
        await initcss('/system/lib/crop/cropper.css');
        await initscript('/system/lib/jq.js');
        await initscript('/system/lib/socket.io.js');
        await initscript('/system/lib/peer.js');
        await initscript('/system/lib/qrcode.js');
        await initscript('/system/lib/ace/ace.js');
        await initscript('/system/lib/ace/ext-searchbox.js');
        await initscript('/system/lib/ace/theme-monokai.js');
        await initscript('/system/lib/picker.js');
        await initscript('/system/core.js');
        await initscript('/system/wm.js');
        await initscript('/system/services.js');
        await initscript('/system/ui.js');
        await initscript('/system/lib/crop/cropper.js');
        abt.ver = await fs.read('/system/info/currentver');
        abt.lastmod = await fs.read('/system/info/currentveredit');
        await initcss('/system/style.css');
        await wd.fontsw('/system/lib/fonts/Poppins-Regular.woff2', '/system/lib/fonts/Poppins-Medium.woff2', '/system/lib/fonts/Poppins-Bold.woff2', '/system/lib/fonts/mono.woff2');
        const devsocket = await fs.read('/system/info/devsocket');
        async function startsockets() {
            return new Promise((resolve) => {
                try {
                    if (devsocket === "true") {
                        sys.socket = io('wss://webdeskbeta.meower.xyz/');
                        wm.notif('Using beta socket server', 'This is for testing purposes only.');
                    } else {
                        sys.socket = io("wss://webdesk.meower.xyz/");
                    }
                    sys.socket.on('connect', () => {
                        console.log('Socket connected');
                        resolve(true);
                    });
                    sys.socket.on('connect_error', (error) => {
                        console.log('Connection error:', error);
                        sys.socket = undefined;
                        resolve(false);
                    });
                } catch (error) {
                    console.log(error);
                    sys.socket = undefined;
                    resolve(false);
                }
            });
        }

        const socketworks = await startsockets();
        if (!socketworks) {
            console.log('<!> Socket connection failed, proceeding without socket');
        }

    } catch (error) {
        console.error(error);
    }

    console.log('<i> Boot stage 2: Load variables, make decisions');
    if (sd && !migcheck) {
        const uid = params.get('deskid');
        if (uid) {
            sys.migrid = uid;
            const id = gen(7);
            await ptp.go(id);
            ui.crtheme('#010101', true);
            wd.dark('nosave');
            app.system.migrate.init('skibidi');
            ui.hide(tk.g('death'), 140);
            wegood();
            return;
        }
        const deskid = await fs.read('/system/deskid');
        if (deskid) {
            if (deskid.length === 8) {
                await wd.newid();
                window.location.reload();
            }
        } else {
            await wd.newid();
            window.location.reload();
        }
        const [
            darkpref, lightdark, color, font, dev, mob, city, clocksec, apprepo, filtering, notifsound, silent, perf
        ] = await Promise.all([
            fs.read('/user/info/lightdarkpref'),
            fs.read('/user/info/lightdark'),
            fs.read('/user/info/color'),
            fs.read('/user/info/font'),
            fs.read('/system/info/devmode'),
            fs.read('/user/info/mobile'),
            fs.read('/user/info/location.json'),
            fs.read('/user/info/clocksec'),
            fs.read('/system/appurl'),
            fs.read('/user/info/filter'),
            fs.read('/user/info/notifsrc'),
            fs.read('/user/info/silent'),
            fs.read('/system/info/lowgfx'),
        ]);

        await wd.blurcheck(perf);

        if (clocksec === "true") {
            sys.seconds = true;
        } else {
            sys.seconds = false;
        }

        if (city) {
            const ok = JSON.parse(city)[0];
            sys.city = ok.city;
            sys.unit = ok.unit;
            if (ok.unit === "Metric") {
                sys.unitsym = "°C";
            } else {
                sys.unitsym = "°F";
            }
            if (ok.default === true) {
                sys.defaultloc = true;
            } else {
                sys.defaultloc = false;
            }
            sys.loclast = ok.lastupdate;
        } else {
            wd.wetter();
        }

        await ptp.go(deskid);

        if (eepysleepy === "true") {
            ui.hide(tk.g('contain'), 0);
            await initscript('/apps/Lock Screen.app/install.js');
            sys.setupd = "eepy";
            wegood();
            wd.dark('nosave');
            ui.crtheme('#999999', true);
            app.lockscreen.init();
            await wd.chokehold();
            wakelockgo();
        }

        if (apprepo) sys.appurl = apprepo;
        if (notifsound) sys.notifsrc = notifsound;
        if (silent === "true") sys.nvol = 0;

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            sys.mob = true;
            if (mob !== "false") {
                sys.mobui = true;
            }
        }

        if (filtering === "true") {
            sys.filter = true;
        } else if (filtering === "nc") {
            sys.filter = true;
            sys.nc = true;
        }

        if (dev === "true") {
            sys.dev = true;
            wm.notif(`Developer Mode is enabled.`);
        }

        if (font === "big") {
            wd.bgft();
        } else if (font === "small") {
            wd.smft();
        } else {
            wd.meft();
        }

        fs.write('/user/files/Welcome to WebDesk!.txt', `Welcome to WebDesk! This is your Files folder, where things you upload are stored. Use the buttons at the top to navigate between folders, right-click/tap and hold a file to see it's info, and normal tap/click it to open it.`);
        sys.setupd = true;
        try {
            const skibidi = await fetch('/target.json');
            const fucker = await skibidi.text();
            const json = await JSON.parse(fucker);
            if (json['0'].target !== abt.ver) {
                const dark = ui.darken();
                const menu = tk.c('div', dark, 'cm');
                tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
                tk.p('Update WebDesk', 'bold', menu);
                tk.p('This will only take a few seconds.', undefined, menu);
                tk.p(abt.ver + " to " + json['0'].target, undefined, menu);
                tk.cb('b1', 'Later', () => ui.dest(dark), menu); tk.cb('b1', 'Update', async function () {
                    await fs.del('/system/webdesk');
                    reboot();
                }, menu);
            }
            const token = await fs.read('/user/info/token');
            if (sys.socket === undefined) {
                wm.notif('WebDesk servers are down', `You can still use WebDesk normally, but you can't use online services.`);
                webid.priv = -1;
            } else {
                if (!token) {
                    const dark = ui.darken();
                    const menu = tk.c('div', dark, 'cm');
                    tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
                    tk.p('Create/log into WebDesk account', 'bold', menu);
                    tk.p(`Misuse targeting others may result in account limitations. The developer is not liable for your actions.`, undefined, menu);
                    const useri = tk.c('input', menu, 'i1');
                    const passi = tk.c('input', menu, 'i1');
                    useri.placeholder = 'Username';
                    passi.placeholder = 'Password';
                    passi.type = 'password';
                    tk.cb('b1', 'Create/log in', async function () {
                        if (useri.value.length > 16) {
                            wm.snack(`Set a name under 16 characters`, 3200);
                            return;
                        }

                        if (passi.value.length < 8) {
                            wm.snack(`Set a password over 8 characters.`, 3200);
                            return;
                        }

                        sys.socket.emit("newacc", { user: useri.value, pass: passi.value });
                    }, menu);
                    sys.socket.on("token", ({ token }) => {
                        fs.write('/user/info/token', token);
                        wd.reboot();
                    });
                } else {
                    await new Promise((resolve) => {
                        sys.socket.emit("login", token);
                        sys.socket.on("checkback", async (thing) => {
                            if (thing.error === true) {
                                await fs.del('/user/info/token');
                                window.location.reload();
                            } else {
                                sys.name = thing.username;
                                sd = thing.username;
                                await fs.write('/user/info/name', thing.username);
                                webid.token = token;
                                webid.priv = thing.priv;
                                webid.userid = thing.userid;
                                if (thing.priv === 0) {
                                    wm.notif('Your account has been limited.', `You can still use WebDesk normally, but you can't use online services.`);
                                }
                            }
                            resolve();
                        });
                    });
                }
            }
        } catch (error) {
            console.log(error);
            webid.priv = -1;
        }
        if (sys.name === "Default User") {
            sys.name = sd;
        }
        if (darkpref === "auto") {
            sys.autodarkacc = true;
        } else {
            sys.autodarkacc = false;
        }
        if (lightdark === "dark") {
            wd.dark('nosave');
        } else {
            wd.light('nosave');
        }
        if (color) {
            ui.crtheme(color);
        } else {
            wd.seasonal();
        }
        console.log('<i> Boot stage 3: Load apps');
        await initapps();
        console.log('<i> Boot stage 4: Load desktop, check for updates');
        await wd.desktop(sys.name, deskid, 'wait');
        await wd.setbg(false);
        ui.dest(tk.g('loading', 220));
    } else if (migcheck === "down") {
        await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
        await initapps();
        const id = gen(7);
        await ptp.go(id);
        ui.crtheme('#010101', true);
        wd.dark('nosave');
        await fs.del('/system/migval');
        app.system.migrate.init('down');
        ui.dest(tk.g('loading', 220));
        wegood();
    } else if (migcheck === "echo") {
        await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
        await initapps();
        await wd.setbg(true, false);
        const id = gen(7);
        await ptp.go(id);
        ui.crtheme('#010101', true);
        wd.dark('nosave');
        await fs.del('/system/migval');
        app.system.echodesk.init();
        ui.dest(tk.g('loading', 220));
        wegood();
    } else if (migcheck === "rec") {
        await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
        await initapps();
        await app.system.recovery.init();
        ui.dest(tk.g('loading', 220));
    } else {
        await initapps();
        await wd.seasonal();
        await wd.setbg();
        const id = await wd.newid();
        await ptp.go(id);
        if (uid2) {
            app.system.setup.init(true, uid2);
        } else {
            app.system.setup.init();
        }
        sys.setupd = false;
        ui.dest(tk.g('loading', 220));
        wegood();
    }

    wd.perfmon();
    ui.hide(tk.g('death'), 140);

    let fire = false;

    try {
        if (sys.socket !== undefined) {
            sys.socket.on("servmsg", (data) => {
                wm.snack(data);
            });

            sys.socket.on("error", (data) => {
                wm.snack(data);
            });

            sys.socket.on("force_update", (data) => {
                window.location.reload();
            });

            sys.socket.on("connect_error", () => {
                webid.priv = -1;
                resolve();
            });

            sys.socket.on("connect", async () => {
                if (fire === false) {
                    fire = true;
                } else {
                    const token = await fs.read('/user/info/token');
                    sys.socket.emit("login", token);
                }
            });

            sys.socket.on("webcall", async (call) => {
                wm.notif(call.username, 'is calling you', function () {
                    sys.callid = `${call.id}`;
                    app.webcomm.webcall.init(call.username, call.deskid, true);
                }, 'Pick up');
            });

            sys.socket.on("umsg", async (msg) => {
                app.webcomm.webchat.init(msg.username, msg.contents);
            });
            setInterval(function () {
                if (sys.socket === undefined) {
                    ui.play('/system/lib/other/error.wav');
                    webid.priv = -1;
                    sys.socket = "down";
                    const dark = ui.darken();
                    const menu = tk.c('div', dark, 'cm');
                    tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
                    tk.p('WebDesk disconnected from server', 'bold', menu);
                    tk.p(`You can still use WebDesk normally, but you can't use online services. A reboot might fix this, or the servers are down.`, undefined, menu);
                    tk.cb('b1', 'Reboot', () => reboot(), menu);
                    tk.cb('b1', 'Close', () => ui.dest(dark), menu);
                }
            }, 2000);
        }
    } catch (error) {
        console.log(error);
        wm.notif('Error starting WebDesk Online Services.', 'You might need to update.');
    }

    const dropZone = document.body;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        handleFiles(files);
    }

    async function handleFiles(files) {
        let filesArray = [...files];
        filesArray.forEach(file => {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const contents = e.target.result;
                await fs.write(`/user/files/${file.name}`, contents);
                app.files.init('/user/files/');
            };

            reader.readAsDataURL(file);
        });
    }
    wegood();
    await app.appmark.checkforup();
}
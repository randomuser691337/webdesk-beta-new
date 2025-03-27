app['settings'] = {
    runs: true,
    name: 'Settings',
    init: async function () {
        const main = tk.mbw('Settings', '310px', 'auto', true, undefined, undefined, '/apps/Settings.app/Contents/icon.svg');
        const generalPane = tk.c('div', main.main, 'hide');
        const appearPane = tk.c('div', main.main, 'hide');
        const accPane = tk.c('div', main.main, 'hide');
        const userPane = tk.c('div', main.main, 'hide');
        const appPane = tk.c('div', main.main, 'hide');
        tk.p('App Management', undefined, appPane);
        const shitStain = tk.c('div', appPane);
        const mainPane = tk.c('div', main.main);
        if (sys.mobui === false) {
            main.win.style.maxHeight = "65%";
        }
        // Main pane
        if (sys.guest !== true) {
            const userl = tk.c('div', mainPane, 'list flexthing');
            userl.style.padding = "5px";
            const tnav = tk.c('div', userl, 'tnav med');
            const title = tk.c('div', userl, 'title');
            tnav.style.marginLeft = "4px";
            tnav.innerText = ui.filter(sys.name);
            tk.cb('b3', 'Manage user/info', () => ui.sw2(mainPane, userPane), title);
            tk.cb('b1 b2 lt', 'General', () => ui.sw2(mainPane, generalPane), mainPane);
        } else {
            tk.p(`Some options are disabled, because you're in Guest mode.`, undefined, mainPane);
        }
        tk.cb('b1 b2 lt', 'Accessibility', () => ui.sw2(mainPane, accPane), mainPane);
        tk.cb('b1 b2 lt', 'Manage apps', async function () {
            ui.sw2(mainPane, appPane);
            shitStain.innerHTML = "";
            const contents = await fs.ls('/apps/');
            for (const item of contents.items) {
                if (item.type === "folder") {
                    if (item.path.includes('.app')) {
                        const skibidi2 = await fs.ls(item.path);
                        for (const item3 of skibidi2.items) {
                            if (item3.name === "manifest.json") {
                                const thing = await fs.read(item3.path);
                                const entry = JSON.parse(thing);
                                if (sys.dev === true) {
                                    console.log(entry);
                                }
                                const notif = tk.c('div', shitStain, 'notif2');
                                tk.p(entry.name, 'bold', notif);
                                tk.ps(`${entry.dev} - Ver ${entry.ver}`, undefined, notif);
                                tk.cb('b3', 'App info', async function () {
                                    const ok = tk.c('div', document.body, 'cm');
                                    tk.p('App Info', 'h2', ok);
                                    const ok2 = tk.c('div', ok, undefined);
                                    tk.p(`<span class="bold">Name</span> ` + entry.name, undefined, ok2);
                                    if (entry.installedon === undefined) {
                                        tk.p(`<span class="bold">Modified</span> Unknown`, undefined, ok2);
                                    } else {
                                        tk.p(`<span class="bold">Modified</span> ` + wd.timec(entry.installedon), undefined, ok2);
                                    }
                                    const appid = tk.p(`<span class="bold">App ID</span> `, undefined, ok2);
                                    const appids = tk.c('span', appid);
                                    appids.innerText = entry.appid;
                                    if (entry.dev === undefined) {
                                        tk.p(`<span class="bold">Developer</span> ` + 'Unknown', undefined, ok2);
                                    } else {
                                        const dev = tk.p(`<span class="bold">Developer</span> `, undefined, ok2);
                                        const devs = tk.c('span', dev);
                                        devs.innerText = entry.dev;
                                    }
                                    const ver = tk.p(`<span class="bold">Version</span> `, undefined, ok2);
                                    const vers = tk.c('span', ver);
                                    vers.innerText = entry.ver;
                                    tk.cb('b1', 'Close', () => ui.dest(ok), ok)
                                }, notif);
                                tk.cb('b3', 'Remove', async function () {
                                    await fs.delfold(entry.lastpath);
                                    ui.slidehide(notif);
                                    delete app[entry.appid];
                                    wm.notif(`${entry.name} removed`, `Reboot to finish removal, it might be in RAM`, () => wd.reboot(), 'Reboot', true);
                                }, notif);
                            }
                        }
                    }
                }
            }
        }, mainPane);
        tk.cb('b1 b2 lt', 'Personalize', () => ui.sw2(mainPane, appearPane), mainPane);
        // General pane
        tk.p('General', undefined, generalPane);
        tk.cb('b1 b2 red lt', 'Reinstall WebDesk (keep data)', async function () {
            await fs.del('/system/webdesk');
            wd.reboot();
        }, generalPane);
        tk.cb('b1 b2 lt', 'Deep Clean (keep data)', async function () {
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`Deep Clean will reinstall WebDesk, clean out cache from old versions, and will reset your settings.`, undefined, menu);
            tk.cb('b1 nodont', 'Erase', async function () {
                await fs.delfold('/system/webdesk');
                wm.snack('Deep clean done');
                ui.dest(dark);
            }, menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
        }, generalPane);
        /* tk.cb('b1 b2 red', 'Request Persistence (Stops browser from erasing WebDesk)', async function () {
            const fucker = await fs.persist();
            if (fucker === true) {
                app.ach.unlock('The Keeper', `Won't save your data from the death of the universe, though!`);
                wm.snack('Persistence turned on');
            } else {
                wm.snack(`Couldn't turn on persistence`);
            }
        }, generalPane); */
        if (sys.mob === true) {
            tk.cb('b1 b2 lt', 'Toggle mobile UI', async function () {
                if (sys.mobui === true) {
                    await set.set('mobile', 'false');
                } else {
                    await fs.del('/user/info/mobile');
                }
                wm.notif('Reboot to apply changes', undefined, () => wd.reboot(), 'Reboot', true);
            }, generalPane);
        }
        if (window.navigator.standalone === true) {
            tk.cb('b1 b2 lt', 'Recalibrate App Bar', function () {
                wd.tbcal();
            }, generalPane);
        }
        tk.cb('b1 b2 lt', 'Enter Recovery Mode', function () {
            fs.write('/system/migval', 'rec');
            wd.reboot();
        }, generalPane);
        tk.cb('b1 b2 nodontdoit lt', 'Developer Mode', async function () {
            const win = tk.c('div', document.body, 'cm');
            const opt = await fs.read('/system/info/devmode');
            const pane = tk.c('div', win);
            if (opt !== "true") {
                tk.img('/system/lib/img/icons/warn.svg', 'setupi', pane);
                tk.p(`Developer Mode lets you install third-party apps, and enables dev tools, but removes security protections.`, undefined, pane);
                tk.p(`Use caution, there's no support for issues relating to Developer Mode. Disabling Developer Mode will erase WebDesk, but will keep your files.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Enable (reboot)', async function () {
                    await fs.write(`/system/info/devmode`, 'true');
                    await wd.reboot();
                }, pane);
            } else {
                tk.img('/system/lib/img/icons/hlcrab.png', 'setupi', pane);
                tk.p(`Developer Mode enabled`, 'bold', pane);
                tk.p(`Disabling it will reset WebDesk, but will keep your files, along with your DeskID and name.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Disable (reboot)', async function () {
                    await fs.delfold('/system/');
                    await fs.delfold('/user/info/');
                    await fs.write('/user/info/name', sys.name);
                    await fs.write('/system/deskid', sys.deskid);
                    await wd.reboot();
                }, pane);
            }
        }, generalPane);
        tk.cb('b1 b2 red lt', 'Erase...', () => app.settings.eraseassist.init(), generalPane);
        const pgfx = tk.c('div', generalPane, 'list flexthing');
        const tnavgfx = tk.c('div', pgfx, 'tnav');
        const titlegfx = tk.c('div', pgfx, 'title');
        tnavgfx.innerText = "Graphics ";
        tk.cb('b7', 'Low', async function () {
            wm.notif('Graphics set to low', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'true');
        }, titlegfx);
        tk.cb('b7', 'Med', async function () {
            wm.notif('Graphics set to medium', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'half');
        }, titlegfx);
        tk.cb('b7', 'High', async function () {
            wm.notif('Graphics set to high (default)', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.del('/system/info/lowgfx');
        }, titlegfx);
        tk.cb('b7', 'Epic', async function () {
            wm.notif('Graphics set to epic', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'epic');
        }, titlegfx);

        const p = tk.c('div', generalPane, 'list flexthing');
        const tnav = tk.c('div', p, 'tnav');
        const title = tk.c('div', p, 'title');
        tnav.innerText = "Clock seconds ";
        tk.cb('b7', 'On', async function () {
            sys.seconds = true;
            await fs.write('/user/info/clocksec', 'true');
        }, title);
        tk.cb('b7', 'Off', async function () {
            sys.seconds = false;
            await fs.write('/user/info/clocksec', 'false');
        }, title);
        tk.cb('b1', 'Back', () => ui.sw2(generalPane, mainPane), generalPane);
        // Appearance pane
        tk.p('Personalize', undefined, appearPane);
        const bg1 = tk.c('input', appearPane, 'i1');
        bg1.setAttribute("data-jscolor", "{}");
        bg1.addEventListener('input', function (e) {
            ui.crtheme(e.target.value);
        });
        bg1.value = await set.read('color');
        new JSColor(bg1, undefined);
        const modething = tk.p('', undefined, appearPane);
        tk.cb('b1', 'Light', function () {
            set.del('lightdarkpref');
            sys.autodarkacc = false;
            wd.light();
        }, modething);
        tk.cb('b1', 'Dark', function () {
            set.del('lightdarkpref');
            sys.autodarkacc = false;
            wd.dark();
        }, modething);
        tk.cb('b1', 'Auto', async function () {
            fs.write('/user/info/lightdarkpref', 'auto');
            const killyourselfapplesheep = await set.read('color');
            ui.crtheme(killyourselfapplesheep);
            sys.autodarkacc = true;
        }, modething);
        tk.p('Wallpaper', undefined, appearPane);
        const wallp = tk.p('', undefined, appearPane);
        wallp.style = "display: flex; justify-content: space-between; padding: 0px; margin: 0px;";
        const wbtn1 = tk.cb('b1 b2', 'Manage', function () {
            app.settings.wallpapers.init();
        }, wallp);
        wbtn1.style = "flex: 1 1; margin-right: 1px !important;";
        const wbtn2 = tk.cb('b1 b2', 'Upload', function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';
            input.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();

                    reader.onload = async function (e) {
                        const silly = e.target.result;
                        wd.setwall(silly, true);
                    };

                    reader.readAsDataURL(file);
                }
            });

            input.click();
        }, wallp);
        wbtn2.style = "flex: 1 1; margin-left: 1px !important;";
        tk.p('Sounds', undefined, appearPane);
        const p4 = tk.c('div', appearPane, 'list');
        const ok4 = tk.c('span', p4);
        ok4.innerText = "Notifications ";
        tk.cb('b7', '1', async function () {
            wd.notifsrc('/system/lib/other/notif1.wav', true);
        }, p4);
        tk.cb('b7', '2', async function () {
            wd.notifsrc('/system/lib/other/notif2.wav', true);
        }, p4);
        tk.cb('b7', '3', async function () {
            wd.notifsrc('/system/lib/other/notif3.wav', true);
        }, p4);
        tk.cb('b7', '4', async function () {
            wd.notifsrc('/system/lib/other/notif4.wav', true);
        }, p4);
        tk.cb('b7', 'More', async function () {
            const menu = tk.c('div', document.body, 'cm');
            tk.p('Custom notification sound', 'bold', menu);
            const the = tk.c('input', menu, 'i1');
            the.placeholder = "URL of sound here";
            const ok = await set.read('cnotifurl');
            if (ok === "true") {
                const ok2 = await set.read('notifsrc');
                the.value = ok2;
            }
            tk.cb('b1', 'Close', () => ui.dest(menu), menu); tk.cb('b1', 'Save', async function () {
                try {
                    await wd.notifsrc(the.value, true);
                    await fs.write('/user/info/cnotifurl', 'true');
                } catch (error) {
                    wm.snack(`URL failed. Try a different one!`);
                }
            }, menu);
        }, p4);
        p4.style.marginBottom = '6px';
        tk.cb('b1', 'Reset Colors', async function () {
            fs.del('/user/info/color');
            fs.del('/user/info/lightdark');
            fs.del('/user/info/lightdarkpref');
            const raiseyopawifyouafuckingfaggot = await wd.defaulttheme();
            console.log(raiseyopawifyouafuckingfaggot);
            bg1.value = await ui.rgbtohex(raiseyopawifyouafuckingfaggot);
            wm.snack('Reset colors');
        }, appearPane); tk.cb('b1', 'Back', () => ui.sw2(appearPane, mainPane), appearPane);
        // User pane
        tk.p('WebDesk User', undefined, userPane);
        tk.p(`Account created on ${wd.timec(webid.userid)}`, undefined, userPane);
        /* tk.cb('b1 b2', 'Change DeskID', function () {
            const ok = tk.mbw('Change DeskID', '300px', 'auto', true, undefined, undefined);
            tk.p(`Changing your DeskID will make your WebDesk unreachable to those without your new ID.`, undefined, ok.main);
            let yeah = false;
            tk.cb('b1', 'Continue', async function () {
                yeah = true;
                const newid = await wd.newid();
                ok.main.innerHTML = `<p>Reboot WebDesk to finish changing your DeskID.</p><p>All unsaved data will be lost. Your new ID is ${newid}.</p>`;
                tk.cb('b1', 'Reboot', () => wd.reboot(), ok.main);
                app.ach.unlock('The Vanisher', 'Good luck WebDropping to nothing!');
            }, ok.main);
            ok.closebtn.addEventListener('mousedown', function () {
                if (yeah === false) {
                    app.ach.unlock('Nevermind', 'Your dark reputation follows you.');
                }
            });
        }, userPane); */
        tk.cb('b1 b2 lt', 'Change Username', function () {
            const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
            const inp = tk.c('input', ok.main, 'i1');
            inp.placeholder = "New name here";
            tk.cb('b1', 'Change name', async function () {
                if (inp.value.length > 16) {
                    wm.snack(`Set a name under 16 characters`, 3200);
                    return;
                }

                sys.socket.emit("changeusername", { token: webid.token, name: inp.value });
            }, ok.main);
            sys.socket.on("changeuserdone", async () => {
                sys.name = inp.value;
                await fs.write('/user/info/name', inp.value);
                wm.snack(`Name changed to ${inp.value}`);
                wm.close(ok.win);
            });
        }, userPane);
        tk.cb('b1 b2 lt', 'Change Password', function () {
            const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
            tk.p(`Changing your password will log you out of all WebDesks, except for this one.`, undefined, ok.main);
            tk.p(`This WebDesk will reboot after password change.`, undefined, ok.main);
            const inp = tk.c('input', ok.main, 'i1');
            inp.placeholder = "Old password";
            inp.type = "password";
            const inp2 = tk.c('input', ok.main, 'i1');
            inp2.placeholder = "New password";
            inp2.type = "password";
            tk.cb('b1', 'Change name', async function () {
                if (inp.value.length > 16) {
                    wm.snack(`Set a name under 16 characters`, 3200);
                    return;
                }

                sys.socket.emit("changepassword", { token: webid.token, password: inp.value, newpass: inp2.value });
            }, ok.main);
            sys.socket.on("changepassdone", async (token) => {
                await fs.write('/user/info/token', token);
                await wd.reboot();
            });
        }, userPane);
        tk.cb('b1 b2 lt', 'Location', function () {
            app.settings.locset.init();
        }, userPane);
        tk.cb('b1 b2 lt', 'Log out', function () {
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`You'll need to log back in/create another account.`, undefined, menu);
            tk.cb('b1', 'Log out', async function () {
                await fs.del('/user/info/token');
                await fs.write('/user/info/name', 'User');
                wd.reboot();
            }, menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
        }, userPane);
        tk.cb('b1', 'Back', () => ui.sw2(userPane, mainPane), userPane);
        // Access pane
        tk.p('Accessibility', undefined, accPane);
        const p2 = tk.c('div', accPane, 'list');
        const ok2 = tk.c('span', p2);
        ok2.innerText = "Font size ";
        tk.cb('b7', 'Big', async function () {
            wd.bgft();
            fs.write('/user/info/font', 'big');
        }, p2);
        tk.cb('b7', 'Normal', function () {
            wd.meft();
            fs.write('/user/info/font', 'normal');
        }, p2);
        tk.cb('b7', 'Small', function () {
            wd.smft();
            fs.write('/user/info/font', 'small');
        }, p2);

        const p3 = tk.c('div', accPane, 'list');
        const ok3 = tk.c('span', p3);
        ok3.innerHTML = `SFW mode (Filters text before it's seen to help stop things like <a href="https://www.gaggle.net/" target="_blank">this</a>) `;
        tk.cb('b7', 'No chances', async function () {
            sys.filter = true;
            sys.nc = true;
            fs.write('/user/info/filter', 'nc');
            wm.notif('No chances mode on!', `Text with filtered items simply won't be shown. WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b7', 'Filter', async function () {
            sys.filter = true;
            sys.nc = false;
            fs.write('/user/info/filter', 'true');
            wm.notif('SFW mode on!', `WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b7', 'Off', function () {
            sys.filter = false;
            sys.nc = false;
            fs.del('/user/info/filter');
            wm.snack('SFW mode turned off');
        }, p3);
        tk.p('Transparency/blur effects', undefined, accPane);
        const blurp = tk.p('', undefined, accPane);
        blurp.style = "display: flex; justify-content: space-between; padding: 0px; margin: 0px;";
        const blur1 = tk.cb('b1 b2', 'Disable', function () {
            fs.write('/user/info/blur', 'false');
            ui.cv('ui1', 'var(--ui2)');
            ui.cv('bl1', '0px');
            ui.cv('bl2', '0px');
        }, blurp);
        blur1.style = "flex: 1 1; margin-right: 1px !important;";
        const blur2 = tk.cb('b1 b2', 'Enable', async function () {
            await fs.del('/user/info/blur');
            const perf = await fs.read('/system/info/lowgfx');
            wd.blurcheck(perf);
            if (ui.light === false) {
                wd.dark();
            } else {
                wd.light();
            }
        }, blurp);
        blur2.style = "flex: 1 1; margin-left: 1px !important;";
        tk.cb('b1', 'Back', () => ui.sw2(accPane, mainPane), accPane);
        // App pane
        tk.cb('b1', 'Back', () => ui.sw2(appPane, mainPane), appPane);
    },
    eraseassist: {
        runs: false,
        init: async function () {
            const yeah = await fs.read('/user/info/token');
            ui.play('/system/lib/other/error.wav');
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            const m1 = tk.c('div', menu);
            const m2 = tk.c('div', menu, 'hide');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`You're about to erase this WebDesk. This can't be undone, everything will be deleted forever.`, undefined, m1);
            if (yeah) {
                tk.cb('b1 nodont', 'Erase', () => ui.sw2(m1, m2), m1);
            } else {
                tk.cb('b1 nodont', 'Erase', () => fs.erase('reboot'), m1);
            }
            tk.cb('b1', `Close`, () => ui.dest(dark), m1);
            tk.p(`Enter account password to confirm erase`, 'bold', menu);
            tk.p(`You're about to erase this WebDesk. This can't be undone, everything will be deleted forever.`, undefined, m1);
            const inp = tk.c('input', m2, 'i1');
            inp.placeholder = "Password here";
            inp.type = "password";
            tk.cb('b1', 'Erase', async function () {
                sys.socket.emit("erase", { token: webid.token, password: inp.value });
            });
            sys.socket.on("greenlight", async () => {
                await fs.erase();
                await wd.reboot();
            });
        }
    },
    locset: {
        runs: false,
        init: function () {
            const ok = tk.mbw('Location Settings', '320px', 'auto', true, undefined, undefined);
            const locp = tk.p(`<span class="bold">Location</span> `, undefined, ok.main);
            const locps = tk.c('span', locp);
            locps.innerText = sys.city;
            const upp = tk.p(`<span class="bold">Updated </span> `, undefined, ok.main);
            const upps = tk.c('span', upp);
            upps.innerText = wd.timec(sys.loclast);
            const degp = tk.p(`<span class="bold">Measurement</span> `, undefined, ok.main);
            const degps = tk.c('span', degp);
            degps.innerText = `${sys.unit} (${sys.unitsym})`;
            const mousedownevent = new MouseEvent('click');
            tk.cb('b1 b2', 'Disable Location', async function () {
                await fs.write('/user/info/location.json', [{ city: 'Paris, France', unit: 'Metric', lastupdate: Date.now(), default: true }]);
                sys.city = "Paris, France";
                sys.unit = "Metric";
                sys.unitsym = "°C";
                sys.defaultloc = true;
                ok.closebtn.dispatchEvent(mousedownevent);
                wm.snack('Location set to Paris, France so that WebDesk has something to fall back on.');
            }, ok.main);
            tk.cb('b1 b2', 'Update Location', async function () {
                wd.wetter(false);
            }, ok.main);
        }
    },
    wallpapers: {
        runs: false,
        init: async function () {
            const ok = tk.mbw('Wallpapers (beta)', '480px', 'auto', true, undefined, undefined);
            let wallpapers = await fs.ls('/system/lib/img/wallpapers/current/');
            tk.p('Scanning for duplicates...', undefined, ok.main);
            for (const wallpaper of wallpapers.items) {
                if (wallpaper.type === "file") {
                    const defaultWallpaper = await fs.read('/system/lib/img/wallpapers/restore/default');
                    const currentWallpaper = await fs.read(wallpaper.path);
                    const speedy = Math.floor(defaultWallpaper.length * 0.2);

                    if (defaultWallpaper.slice(0, speedy) === currentWallpaper.slice(0, speedy)) {
                        await fs.del(wallpaper.path);
                        wallpapers = await fs.ls('/system/lib/img/wallpapers/current/');
                    }
                }
            }

            const grid = tk.c('div', ok.main, 'brick-layout-list');
            let currentPage = 0;
            const itemsPerPage = 2;

            async function renderPage(page) {
                grid.innerHTML = '';
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = wallpapers.items.slice(start, end);

                for (const wallpaper of pageItems) {
                    if (wallpaper.type === "file") {
                        console.log('<!> Loading');
                        const img = tk.c('div', grid, 'wallpapericon');
                        const navi = tk.c('div', img, 'wallpapericonnav left');
                        const thing = await fs.read(wallpaper.path);
                        navi.style = "padding: 4px; margin: 4px; background-color: var(--ui1); box-sizing: border-box; border-radius: var(--rad2); backdrop-filter: blur(var(--bl2)); -webkit-backdrop-filter: blur(var(--bl2));";
                        tk.cb('b4', 'Delete', async function () {
                            await fs.del(wallpaper.path);
                            ui.slidehide(img);
                            const index = wallpapers.items.indexOf(wallpaper);
                            if (index > -1) {
                                wallpapers.items.splice(index, 1);
                            }
                        }, navi);
                        tk.cb('b4', 'Set', async function () {
                            await fs.del(wallpaper.path);
                            wd.setwall(thing, true, false);
                            ok.closebtn.click();
                        }, navi);
                        img.style.backgroundImage = `url(${thing})`;
                    }
                }
            }

            const nav = tk.c('div', ok.main, 'nav-buttons');
            nav.style.marginTop = "4px";
            tk.cb('b1', 'Back', async function () {
                if (currentPage > 0) {
                    currentPage--;
                    await renderPage(currentPage);
                }
            }, nav);
            tk.cb('b1', 'Forward', async function () {
                if ((currentPage + 1) * itemsPerPage < wallpapers.items.length) {
                    currentPage++;
                    await renderPage(currentPage);
                }
            }, nav);
            /* tk.cb('b1', 'Refresh', async function () {
                wallpapers.items = (await fs.ls('/system/lib/img/wallpapers/current/')).items;
                await renderPage(currentPage);
            }, nav); */
            renderPage(currentPage);
        }
    },
};
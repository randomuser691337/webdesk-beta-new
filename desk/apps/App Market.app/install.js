app['appmark'] = {
    runs: true,
    name: 'App Market',
    create: async function (apploc, app, update) {
        async function execute(url2) {
            try {
                const response = await fetch(url2);
                if (!response.ok) {
                    wm.wal(`<p>Couldn't load apps, check your internet or try again later. If it's not back up within an hour, DM macos.amfi on Discord.</p>`);
                }
                const scriptContent = await response.text();
                const script = document.createElement('script');
                script.textContent = scriptContent;
                document.head.appendChild(script);
                sys.installer = script;
                return scriptContent;
            } catch (error) {
                console.error(`Failed to execute script: ${error}`);
                throw error;
            }
        }

        console.log(`<i> Installing ${apploc}`);
        const path = '/apps/' + app.appid + '.app/';
        const check = await fs.read(`${path}install.js`);
        const newen = { name: app.name, ver: app.ver, installedon: Date.now(), dev: app.pub, appid: app.appid, system: false, lastpath: path, };
        if (check && update !== true) {
            wm.snack('Already installed');
            return;
        } else {
            const ok = await execute(sys.appurl + apploc);
            await fs.write(`${path}install.js`, ok);
            await fs.write(`${path}manifest.json`, newen);
            if (update === true) {
                wm.notif(app.name + ' was updated');
            } else {
                wm.notif(app.name + ' was installed');
            }
        }
    },
    init: async function () {
        const win = tk.mbw('App Market', '400px', '320px', undefined, undefined, undefined, '/apps/App Market.app/Contents/icon.png');
        const apps = tk.c('div', win.main);
        const appinfo = tk.c('div', win.main, 'hide');
        async function loadapps() {
            try {
                const response = await fetch(sys.appurl);
                const apps = await response.json();
                const containerdiv = tk.c('div', win.main, 'brick-layout-list');
                containerdiv.style.marginTop = "5px";
                apps.forEach(function (app2) {
                    const notif = tk.c('div', containerdiv, 'notif2');
                    tk.p(`<span class="bold">${app2.name}</span> by ${app2.pub}`, undefined, notif);
                    tk.line(notif);
                    tk.p(app2.info, 'rsmtxt', notif);
                    tk.cb('b3', 'App ID', () => wm.notif(`${app2.name}'s App ID:`, app2.appid, () => ui.copy(app2.appid), 'Copy', true), notif); tk.cb('b3', 'Install', () => app.appmark.create(app2.path, app2), notif);
                });
            } catch (error) {
                console.log(error);
            }
        }
        tk.p(`Look for things you might want, all apps have <span class="bold">full access</span> to this WebDesk/it's files. Anything here is safe.`, undefined, apps);
        if (sys.dev === true) {
            tk.cb('b1', 'Sideload', function () {
                const menu = tk.c('div', document.body, 'cm');
                const id = gen(12);
                let path2 = undefined;
                tk.p('Sideload', 'bold', menu);
                tk.p('Only sideload things you made.', undefined, menu);
                tk.p(`This app's ID is ${id}`, undefined, menu);
                const name = tk.c('input', menu, 'i1');
                name.placeholder = "App name";
                const dev = tk.c('input', menu, 'i1');
                dev.placeholder = "App developer";
                const pathbtn = tk.cb('b1 b2 dash', `Choose JS file`, async function () {
                    const path = await app.files.pick();
                    pathbtn.innerText = path;
                    path2 = path;
                }, menu);
                tk.cb('b1', `Cancel`, function () {
                    ui.dest(menu);
                }, menu);
                tk.cb('b1', `Install`, async function () {
                    if (name.value !== "" && dev.value !== "" && path2 !== undefined) {
                        const appdata = `app['${id}'] = {
                            runs: true,
                            name: '${name.value}',
                            init: async function () {
                                ${await fs.read(path2)}
                            }
                        }`;
                        fs.write(`/apps/${id}.app/install.js`, appdata);
                        const newen = { name: name.value, ver: 1.0, installedon: Date.now(), dev: dev.value, appid: id, system: false, lastpath: `/apps/${id}.app/`, };
                        await fs.write(`/apps/${id}.app/manifest.json`, newen);
                        ui.dest(menu);
                        wm.snack('Installed ' + name.value);
                    } else {
                        wm.snack('Fill out all inputs');
                    }
                }, menu);
            }, apps);
            tk.cb('b1', 'Settings', async function () {
                const menu = tk.c('div', document.body, 'cm');
                let path2 = undefined;
                tk.p('Settings', 'bold', menu);
                tk.p('Only type URLs you trust.', undefined, menu);
                const check = await fs.read('/system/appurl');
                const name = tk.c('input', menu, 'i1');
                name.placeholder = "Custom App Store repo";
                if (check) {
                    name.value = check;
                }
                tk.cb('b1', `Cancel`, function () {
                    ui.dest(menu);
                }, menu);
                tk.cb('b1', `Reset`, function () {
                    sys.appurl = `https://appmarket.meower.xyz/refresh`;
                    fs.del('/system/appurl');
                    ui.dest(menu);
                    wm.snack('Reset repo to defaults');
                }, menu);
                tk.cb('b1', `Save`, async function () {
                    if (name.value !== "") {
                        fs.write('/system/appurl', name.value);
                        sys.appurl = name.value;
                        wm.snack('Saved');
                    } else {
                        wm.snack('Fill out inputs');
                    }
                    ui.dest(menu);
                }, menu);
            }, apps);
        }
        await loadapps();
    },
    checkforup: async function () {
        console.log('<i> Checking for app updates...');
        const contents = await fs.ls('/apps/');
        for (const item of contents.items) {
            if (item.path.endsWith('.app/')) {
                const skibidihawk = await fs.ls(item.path);
                let manifestfound = false;
                for (const item3 of skibidihawk.items) {
                    if (item3.type === "file" && item3.name === "manifest.json") {
                        manifestfound = true;
                        const fuck = await fs.read(item3.path);
                        const ok = JSON.parse(fuck);
                        if (ok.dev === "Browser" && ok.ver === 1) {
                            console.log(`<i> ` + ok.name + ` skipped updates`);
                        } else {
                            const ok2 = await fetch(sys.appurl + "/update/" + ok.appid);
                            const upd = await ok2.json();
                            console.log(upd, ok2);
                            if (upd.ver !== ok.ver) {
                                console.log(`<i> App out of date: ${ok.ver} -> ${upd.ver}`);
                                app.appmark.create(upd.path, upd, true);
                            }
                        }
                    }
                }
            }
        }
    }    
}
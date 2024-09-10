var app = {
    settings: {
        runs: true,
        name: 'Settings',
        init: async function () {
            const main = tk.mbw('Settings', '300px', 'auto', true, undefined, undefined);
            const generalPane = tk.c('div', main.main, 'hide');
            const appearPane = tk.c('div', main.main, 'hide');
            const mainPane = tk.c('div', main.main);
            // Main pane
            tk.p('Settings', undefined, mainPane);
            tk.cb('b1 b2', 'General', () => ui.sw2(mainPane, generalPane), mainPane);
            tk.cb('b1 b2', 'Appearance', () => ui.sw2(mainPane, appearPane), mainPane);
            // General pane
            tk.p('General', undefined, generalPane);
            tk.cb('b1 b2 red', 'Erase This WebDesk', () => wm.wal(`<p>Warning: Erasing this WebDesk will destroy all data stored on it, and you'll need to do setup again.</p>`, () => fs.erase('reboot'), 'Erase'), generalPane);
            tk.cb('b1 b2 red', 'Remove All App Market Apps', () => wm.wal(`<p>Warning: Removing all App Market apps will cause a reboot and delete them, but their data will remain.</p>`, function () {
                fs.del('/system/apps.json');
                setTimeout(function () { window.location.reload() }, 250);
            }, 'Okay'), generalPane);
            tk.cb('b1', 'Back', () => ui.sw2(generalPane, mainPane), generalPane);
            // Appearance pane
            tk.p('Appearance', undefined, appearPane);
            const bg1 = tk.c('input', appearPane, 'i1');
            bg1.setAttribute("data-jscolor", "{}");
            bg1.addEventListener('input', function () {
                ui.crtheme(event.target.value);
            });
            new JSColor(bg1, undefined);
            tk.p('UI Theme', undefined, appearPane);
            tk.cb('b1 b2', 'Light mode', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.light();
            }, appearPane);
            tk.cb('b1 b2', 'Dark mode', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.dark();
            }, appearPane);
            tk.cb('b1 b2', 'Auto (based off color picker)', async function () {
                fs.write('/user/info/lightdarkpref', 'auto');
                const killyourselfapplesheep = await fs.read('/user/info/color');
                ui.crtheme(killyourselfapplesheep);
                sys.autodarkacc = true;
            }, appearPane);
            tk.cb('b1 b2', 'Clear mode (Light Text)', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.clearm2();
            }, appearPane);
            tk.cb('b1 b2', 'Clear mode (Dark Text)', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.clearm();
            }, appearPane);
            tk.p('Other', undefined, appearPane);
            tk.cb('b1', 'Reset Colors', function () {
                fs.del('/user/info/color');
                fs.del('/user/info/lightdark');
                fs.del('/user/info/lightdarkpref');
                wm.wal('Reboot to finish resetting colors.', () => wd.reboot(), 'Reboot');
            }, appearPane); tk.cb('b1', 'Back', () => ui.sw2(appearPane, mainPane), appearPane);
        }
    },
    setup: {
        runs: false,
        init: function () {
            const main = tk.c('div', document.getElementById('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Start Over', () => fs.erase('reboot'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/first.svg', 'setupi', first);
            tk.p('Welcome to WebDesk!', 'h2', first);
            tk.cb('b1', `Guest`, () => wd.desktop('Guest', gen(8)), first);
            tk.cb('b1', `Let's go`, () => ui.sw2(first, transfer), first);
            // migrate menu
            const transfer = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/quick.png', 'setupi', transfer);
            tk.p('Quick Start', 'h2', transfer);
            tk.p('To copy your data, open Backup -> Migrate on the other WebDesk, and enter the code below. This works for the old beta too.', undefined, transfer);
            tk.p('--------', 'h2 deskid', transfer);
            tk.cb('b1', 'No thanks', () => ui.sw2(transfer, warn), transfer);
            transfer.id = "quickstartwdsetup";
            // copying menu
            const copy = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/restore.svg', 'setupi', copy);
            tk.p('Restoring from other WebDesk', 'h2', copy);
            tk.p('This might take a while depending on settings and file size.', undefined, copy);
            tk.p('Starting...', 'restpg', copy);
            tk.cb('b1', 'Cancel', function () { fs.erase('reboot'); }, copy);
            copy.id = "quickstartwdgoing";
            // warn menu
            const warn = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/noround.png', 'setupi', warn);
            tk.p(`WebDesk Online services`, 'h2', warn);
            tk.p('WebDesk makes an ID called a DeskID for you. Others can use this ID to send you files or call you.', undefined, warn);
            tk.p('To recieve calls and files from others, WebDesk needs to be open. When not in use, WebDesk uses less resources', undefined, warn);
            tk.cb('b1', `What's my DeskID?`, function () {
                const box = wm.cm();
                tk.p(`Your DeskID is <span class="deskid med">unknown</span>. You'll need to finish setup to use this ID.`, undefined, box);
                tk.cb('b1 rb', 'Got it', undefined, box);
            }, warn); tk.cb('b1', 'Got it', function () { ui.sw2(warn, user) }, warn);
            // user menu
            const user = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/user.svg', 'setupi', user);
            tk.p('User & Permissions', 'h2', user);
            tk.p(`Set up a user for WebDesk to store all your things in, and also set up WebDesk's permissions. Data is stored on your device only.`, undefined, user);
            const input = tk.c('input', user, 'i1');
            input.placeholder = "Enter a name to use with WebDesk/it's services";
            tk.cb('b1', 'Done!', function () { wd.finishsetup(input.value, user, sum) }, user);
            // summary
            const sum = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/check.svg', 'setupi', sum);
            tk.p('All done!', 'h2', sum);
            tk.p('Make sure to check Settings for more options.', undefined, sum);
            tk.cb('b1 rb', 'Erase & restart', function () { fs.erase('reboot'); }, sum); tk.cb('b1', 'Finish setup', function () { wd.reboot(); }, sum);
            sum.id = "setupdone";
        }
    },
    imgview: {
        runs: false,
        name: 'Image Viewer',
        init: async function (contents) {
            const win = tk.mbw('Image Viewer', '300px', 'auto', true, undefined, undefined);
            const img = tk.c('img', win.main, 'embed');
            img.src = contents;
        }
    },
    files: {
        runs: true,
        name: 'Files',
        init: async function (oppath) {
            const win = tk.mbw(`Files`, '340px', 'auto', true, undefined, undefined);
            const breadcrumbs = tk.c('div', win.main);
            const items = tk.c('div', win.main);
            async function navto(path) {
                items.innerHTML = "";
                breadcrumbs.innerHTML = "";
                let crumbs = path.split('/').filter(Boolean);
                let currentp = '/';
                tk.cb('flist', 'Root', () => navto('/'), breadcrumbs);
                crumbs.forEach((crumb, index) => {
                    currentp += crumb + '/';
                    tk.cb('flists', '/', undefined, breadcrumbs);
                    tk.cb('flist', crumb, () => {
                        let newPath = crumbs.slice(0, index + 1).join('/');
                        navto('/' + newPath + "/");
                    }, breadcrumbs);
                });

                const thing = await fs.ls(path);
                thing.items.forEach(function (thing) {
                    if (thing.type === "folder") {
                        tk.cb('flist width', "Folder: " + thing.name, () => navto(thing.path + "/"), items);
                    } else {
                        const selfdestruct = tk.cb('flist width', "File: " + thing.name, async function () {
                            const yeah = await fs.read(thing.path);
                            const menu = tk.c('div', document.body, 'cm');
                            tk.p(thing.path, 'bold', menu);
                            if (thing.path.includes('/system')) {
                                tk.p('This is a system file, modifying it will likely cause damage.', 'warn', menu);
                            }
                            tk.cb('b1 b2', 'Open with', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                tk.cb('b1 b2', 'Image Viewer', function () {
                                    app.imgview.init(yeah);
                                }, menu2);
                                tk.cb('b1 b2', 'Text Editor', function () {

                                }, menu2);
                                tk.cb('b1 b2', 'console.log', function () {
                                    console.log(yeah);
                                }, menu2);
                                tk.cb('b1 b2', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                            }, menu);
                            tk.cb('b1 b2', 'Rename', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                tk.cb('b1 b2', 'Image Viewer', function () {
                                    app.imgview.init(yeah);
                                }, menu2);
                                tk.cb('b1 b2', 'Rename', function () {

                                }, menu2);
                                tk.cb('b1 b2', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                            }, menu);
                            tk.cb('b1 b2', 'Delete file', function () {
                                fs.del(thing.path);
                                ui.dest(selfdestruct);
                                ui.dest(menu);
                            }, menu);
                            tk.cb('b1', 'Cancel', function () {
                                ui.dest(menu);
                            }, menu);
                        }, items);
                    }
                });
            }

            if (oppath) {
                navto('/');
                console.log(`<!> Don't specify a custom path in Files, there's a silly issue rn`);
            } else {
                navto('/');
            }
        }
    },
    about: {
        runs: true,
        name: 'About',
        init: async function () {
            const win = tk.mbw('About', '300px', 'auto', true, undefined, undefined);
            tk.p(`WebDesk`, 'h2', win.main);
            tk.p(`Version: ${abt.ver}`, undefined, win.main);
            tk.p(`Latest update: ${abt.lastmod}`, undefined, win.main);
        }
    },
    appmark: {
        runs: true,
        name: 'App Market',
        init: async function () {
            const win = tk.mbw('App Market', '340px', 'auto', true, undefined, undefined);
            const apps = tk.c('div', win.main);
            const appinfo = tk.c('div', win.main, 'hide');
            async function execute(url) {
                try {
                    const response = await fetch(url);
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

            async function loadapps() {
                try {
                    const response = await fetch(`https://appmarket.meower.xyz/refresh`);
                    const apps = await response.json();
                    apps.forEach(function (app) {
                        const notif = tk.c('div', win.main, 'notif2');
                        tk.p(`<span class="bold">${app.name}</bold> by ${app.pub}`, 'bold', notif);
                        tk.p(app.info, undefined, notif);
                        notif.addEventListener('click', async function () {
                            const apps = await fs.read('/system/apps.json');
                            if (apps) {
                                const ok = await execute(`https://appmarket.meower.xyz${app.path}`);
                                const newen = { name: app.name, id: Date.now(), exec: ok };
                                const jsondata = JSON.parse(apps);
                                const check = jsondata.some(entry => entry.name === newen.name);
                                if (check === true) {
                                    console.log('<i> Already installed');
                                    wm.wal('<p>Already installed!</p>')
                                } else {
                                    jsondata.push(newen);
                                    wm.notif(`Installed: `, newen.name);
                                    fs.write('/system/apps.json', jsondata);
                                }
                            } else {
                                const ok = await execute(`https://appmarket.meower.xyz${app.path}`);
                                await fs.write('/system/apps.json', [{ name: app.name, id: Date.now(), exec: ok }]);
                                wm.notif(`Installed: `, app.name);
                            }
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            tk.p('Welcome to the App Market!', undefined, apps);
            tk.p(`Look around for things you might want, all apps have <span class="bold">full access</span> to this WebDesk/it's files. Anything with a <span class="bold">Safe</span> badge is trustable.`, undefined, apps);
            await loadapps();
        }
    },
    ach: {
        runs: true,
        name: 'Achievements',
        init: async function () {
            async function load() {
                try {
                    const data = await fs.read('/user/info/achieve.json');
                    if (data) {
                        const parsed = JSON.parse(data);
                        let yeah = 0;
                        parsed.forEach((entry) => {
                            const notif = tk.c('div', win.main, 'notif2');
                            tk.p(entry.name, 'bold', notif);
                            tk.p(entry.cont, undefined, notif);
                            tk.p(`Unlocked on ${wd.timec(entry.time)}`, undefined, notif);
                            yeah++
                        });
                        const elements = document.getElementsByClassName("achcount");
                        for (let i = 0; i < elements.length; i++) {
                            elements[i].innerText = yeah;
                        }
                    } else {
                        await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                        await load();
                    }
                } catch (error) {
                    console.log('<!> Achievements shat itself: ', error);
                    return null;
                }
            }

            const win = tk.mbw('Achievements', '300px', 'auto', true, undefined, undefined);
            tk.p(`WebDesk Achievements`, 'h2', win.main);
            tk.p(`Unlocked <span class="b achcount"></span> achievements`, undefined, win.main);
            await load();
        },
        unlock: async function (name, content) {
            try {
                const data = await fs.read('/user/info/achieve.json');
                if (data) {
                    const newen = { name: name, cont: content, time: Date.now() };
                    const jsondata = JSON.parse(data);
                    const check = jsondata.some(entry => entry.name === newen.name);
                    if (check === true) {
                        console.log('<i> Already achieved!');
                    } else {
                        wm.notif(`Achieved: ` + name, content, () => app.ach.init());
                        jsondata.push(newen);
                        fs.write('/user/info/achieve.json', jsondata);
                    }
                } else {
                    await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                    await app.ach.unlock(name, content);
                }
            } catch (error) {
                console.log('<!> Achievements shat itself: ', error);
                return null;
            }
        }
    },
    browser: {
        runs: true,
        name: 'Browser',
        init: async function () {
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw('Browser', '80vw', '82vh', true);
            ui.dest(win.title, 0);

            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const okiedokie = tk.c('div', tabs, 'browsertitle');
            const searchbtns = tk.c('div', okiedokie, 'tnav');
            const searchnest = tk.c('div', tabs, 'title');
            let thing = [];

            let currentTab = tk.c('div', win.main, 'hide');
            let currentBtn = tk.c('div', win.main, 'hide');
            let currentName = tk.c('div', win.main, 'hide');
            win.main.classList = "browsercont";

            function addtab() {
                const tab = tk.c('embed', win.main, 'browsertab');
                tab.src = "https://meower.xyz";
                ui.sw2(currentTab, tab, 100);
                currentTab = tab;
                let lastUrl = "";
                const urls = [];
                thing = [...urls];

                const tabBtn = tk.cb('b4 browserpad', '', function () {
                    ui.sw2(currentTab, tab, 100);
                    currentTab = tab;
                    currentBtn = tabTitle;
                    thing = [...urls];
                }, btnnest);
                const tabTitle = tk.c('span', tabBtn);
                tabTitle.innerText = "meower.xyz";
                currentName = tabTitle;
                currentBtn = tabTitle;

                const closeTabBtn = tk.cb('browserclosetab', 'x', function () {
                    ui.dest(tabBtn);
                    ui.dest(currentTab);
                }, tabBtn);
                setTimeout(function () {
                    const currentUrl = currentTab.src;
                    if (currentUrl !== lastUrl) {
                        lastUrl = currentUrl;
                        urls.push(currentUrl);
                        thing = [...urls];
                    }
                }, 200);
            }

            tk.cb('b4 browserbutton', '+', addtab, searchbtns);
            tk.cb('b4 rb browserbutton', 'x', function () {
                ui.dest(win.win, 150);
                ui.dest(win.tbn, 150);
            }, btnnest);
            tk.cb('b4 yb browserbutton', '-', function () {
                ui.hide(win.win, 150);
            }, btnnest);
            tk.cb('b4 browserbutton', '⟳', function () {
                currentTab.src = currentTab.src;
            }, searchbtns);
            tk.cb('b4 browserbutton', '<', function () {
                let omfg = thing.length - 2
                currentTab.url = omfg;
            }, searchbtns);
            tk.cb('b4 browserbutton', '>', function () {
                currentTab.contentWindow.history.go(1);
            }, searchbtns);
            const searchInput = tk.c('input', okiedokie, 'i1 browserbutton');
            searchInput.placeholder = "Enter URL";
            tk.cb('b4 browserbutton', 'Go!', function () {
                currentTab.src = "https://" + searchInput.value;
                currentBtn.innerText = searchInput.value;
                if (searchInput.value.includes('porn') || searchInput.value.includes('e621') || searchInput.value.includes('rule34') || searchInput.value.includes('r34') || searchInput.value.includes('xvideos') || searchInput.value.includes('c.ai') || searchInput.value.includes('webtoon')) {
                    app.ach.unlock('The Gooner', `We won't judge — we promise.`);
                }
            }, okiedokie);

            setTimeout(function () { addtab(); }, 250);
            wd.win();
        }
    },
    caller: {
        runs: true,
        name: 'WebCall',
        init: async function () {
            const win = tk.mbw('WebCall', '300px', 'auto', true, undefined, undefined);
            tk.p(`Enter the DeskID of the person you're trying to call`, undefined, win.main);

        }
    },
};

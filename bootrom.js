/*
    Welcome!

    WebDesk's bootcode is in this location,
    but this is stored in your browser's filesystem
    for you to look at this bootcode directly.
    If you want to make local changes to this bootcode, 
    you need a self hosted web server to make
    modifications to it as normally this is read only
    to prevent normally bricking WebDesk from being 
    able to even all reinstall it at all!

    Have fun!
*/

let url = window.location.href;
let params = new URLSearchParams(window.location.search);

var abt = {
    lastmod: "Mar 21, 2025",
    ver: "0.3.2",
}

var sys = {
    deskid: undefined,
    setupd: undefined,
    migrid: 1,
    autodarkacc: undefined,
    webdrop: true,
    name: "Default User",
    model: undefined,
    nvol: 1.0,
    installer: undefined,
    peer: undefined,
    currentf: undefined,
    full: false,
    guest: false,
    light: true,
    fucker: false,
    clip: undefined,
    dev: false,
    mob: false,
    mobui: false,
    city: "Paris, France",
    unit: "Metric",
    defaultloc: true,
    unitsym: "°C",
    seconds: false,
    echodesk: false,
    resume: undefined,
    appurl: `https://appmarket.meower.xyz/refresh`,
    filter: false,
    nc: false,
    loclast: Date.now(),
    notifsrc: "/system/lib/other/notif1.wav",
    lowgfx: false,
    lockscreen: true,
    contained: false,
    socket: undefined,
    webdeskbooted: false,
    config: {}
};

var webid = {
    priv: 1,
    userid: undefined,
}

// this is where other apps fuck with each other ig
var random = {

}

var el = {
    taskbar: undefined,
    migstat: undefined,
    webchat: undefined,
    currentid: undefined,
    lock: undefined,
    sm: undefined,
    tr: undefined,
    cc: undefined,
    dropped: false,
    deskicon: true,
}

var wc = {
    webchat: undefined,
    currentid: undefined,
}

console.log("<i> Boot stage 0: Base variables initialised from WebDesk bootcode (bootrom)")

function wegood() {
    sys.webdeskbooted = true;
}

async function initscript(ok) {
    const scriptContent = await fs.read(ok);
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.body.appendChild(script);
    return script;
}

async function initcss(ok) {
    const scriptContent = await fs.read(ok);
    const script = document.createElement('style');
    script.textContent = scriptContent;
    document.head.appendChild(script);
    return script;
}

setTimeout(function () {
    if (sys.webdeskbooted === false) {
        recovery();
    }
}, 12000);

async function recovery() {
    document.body.innerHTML = `
    <div id="loading2" class="loading"
    style="z-index: 9999;">
    <div style="position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%); max-width: 80%; max-width: 250px;">
            <p><strong>WebDesk Net Recovery</strong></p>
            <p>You need to update, WebDesk took too long, or an error occured.</p>
            <button class="tmpb" onclick="fs.del('/system/webdesk');setTimeout(function () {reboot();}, 200);">Reinstall WebDesk (Data is kept)</button><button onclick="reboot();" class="tmpb">Reboot</button>
        </div>
    </div>`;
}

/*if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/offline.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}*/

async function initapps() {
    const contents = await fs.ls('/apps/');
    for (const item of contents.items) {
        if (item.path.endsWith('.app/')) {
            const skibidihawk = await fs.ls(item.path);
            for (const item3 of skibidihawk.items) {
                if (item3.type === "file" && item3.name === "install.js") {
                    await initscript(item3.path);
                }
            }
        }
    }
}

async function boot() {
    const uid2 = params.get('id');
    const lebronjames = await fs.read("/user/info/config.json");
    if (lebronjames) {
        sys.config = JSON.parse(lebronjames);
    }
    const eepysleepy = await fs.read('/system/eepysleepy');
    const migcheck = await fs.read('/system/migval');
    const installed = await fs.read('/system/webdesk');
    if (installed) {
        console.log(`<i> Boot stage 1: Initialize bootloader`);
        const go = await fs.read('/system/boot.js');
        if (go) {
            await initscript('/system/boot.js');
            await bootstage2(uid2, eepysleepy, migcheck, undefined, installed, lebronjames);
        } else {
            fs.del('/system/webdesk');
            window.location.reload();
        }
    } else {
        try {
            wegood();
            document.body.innerHTML = `<style>* { font-family: monospace; }</style><h2>WebDesk // Built by red40lover420</h2>`;
            document.body.innerHTML += "<p>Downloading update package...</p>";
            const response = await fetch('desk.zip', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Failed to fetch zip: ${response.statusText}`);
            }
            /*const test = await fs.read('/system/core.js');
            if (test) {
                fs.del('/system/custom');
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) {
                        if (registration.active) {
                            registration.active.postMessage({ type: 'update' });
                        }
                    }
                });
            }*/

            document.body.innerHTML += "<p>Downloaded, extracting files...</p>";
            console.log('Response Status:', response.status);
            console.log('Content-Type:', response.headers.get('content-type'));
            const blob = await response.blob();
            console.log('Blob Size:', blob.size);

            const zip = await JSZip.loadAsync(blob);
            const files = zip.files;

            for (const filename in files) {
                const file = files[filename];
                if (!file.dir) {
                    // Only for extracting WebDesk package files
                    console.log(filename)
                    if (filename === "system/lib/img/wallpapers/restore/default") {
                        console.log('<i> Wallpaper!');
                        const file2 = await fs.read('/system/lib/img/wallpapers/current/wall');
                        if (!file2) {
                            const contents = await file.async('string');
                            await fs.write("/system/lib/img/wallpapers/current/wall", contents);
                            console.log(`<!> Wallpaper doesn't exist, adding one now`);
                        }
                    }

                    if (filename.endsWith('.png') || filename.endsWith('.wav') || filename.endsWith('.woff2')) {
                        const binaryContents = await file.async('blob');
                        const reader = new FileReader();
                        reader.onload = async function (e) {
                            const base64Data = e.target.result;
                            await fs.write(`/${filename}`, base64Data);
                        };
                        reader.readAsDataURL(binaryContents);
                    } else {
                        const contents = await file.async('string');
                        await fs.write("/" + filename, contents);
                    }

                    // document.body.innerHTML += `Extracted ${filename}<br>`;
                }
            }

            document.body.innerHTML += '<p>Setting up install</p>';
            await fs.write('/system/webdesk', 'existing');

            const skibidi = await fetch('/target.json');
            const fucker = await skibidi.text();
            const json = await JSON.parse(fucker);
            fs.write('/system/info/currentver', json['0'].target);
            fs.write('/system/info/currentveredit', json['0'].lastmod);

            /* await fetch('/go/fs.js').then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                localStorage.setItem("fs", response.text());
            });

            await fetch('/go/wfs.js').then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                localStorage.setItem("wfs", response.text());
            }); */

            const rebooton = params.get('reboot');

            if (rebooton === "false") {
                document.body.innerHTML += '<p><strong>Done! <button onclick="reboot();">Reboot</button></strong></p>';
            } else {
                document.body.innerHTML += '<p><strong>Done, rebooting!</strong></p>';
                reboot();
            }
        } catch (error) {
            recovery(error);
        }
    }
}

function reboot() {
    window.location.reload();
}

/* if (!navigator.onLine) {
    const downfs = localStorage.getItem("fs");
    const downwfs = localStorage.getItem("wfs");
    const script = document.createElement('script');
    script.textContent = downfs;
    document.body.appendChild(script);
} */
